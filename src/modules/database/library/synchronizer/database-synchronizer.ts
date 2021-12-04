import { DepGraph } from 'dependency-graph';
import createInspector from 'knex-schema-inspector';
import { ILogger, Logger } from '../../../../app/container';
import { ISchema } from '../../../schema';
import { RelationKind } from '../../../schema/interface/relation.interface';
import { IDatabaseLink } from '../../interface';
import { createRelations } from './create-relations';
import { createTable } from './create-table';
import { QueryInstruction } from './query-plan';

export class DatabaseSynchronizer {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  protected getDependencyGraph(schemas: ISchema[]): DepGraph<void> {
    const dependencies: DepGraph<void> = new DepGraph({
      circular: true,
    });

    schemas.forEach(s => dependencies.addNode(s.reference));

    for (const localSchema of schemas) {
      if (localSchema.relations) {
        for (const rel of localSchema.relations) {
          const remoteSchema = schemas.find(s => s.reference === rel.target);

          if (rel.kind === RelationKind.BELONGS_TO_ONE) {
            dependencies.addDependency(
              localSchema.reference,
              remoteSchema.reference,
            );
          }
        }
      }
    }

    return dependencies;
  }

  async sync(link: IDatabaseLink) {
    const instructions: QueryInstruction[] = [];

    // Reduce the associations to only the changed schemas.
    const changes: ISchema[] = Array.from(link.getAssications().values())
      .filter(association => !association.inSync)
      .map(association => association.schema);

    // Nothing has changed, skip early.
    if (!changes.length) {
      return;
    }

    // Dependency tree is used to remove foreign keys
    // when we drop a table we need to know if the any other table
    // is dependent on it. If so, then the user has to remove the dependency first.
    //
    // Or when we change a column and we plan to drop it, because the type will not match???
    // Or when the column is removed from the schema but still on the db!
    const dependencies = this.getDependencyGraph(changes);

    // TODO validate the schema for sanity,
    // - types match their foreign keys
    // - remote tables exits
    // - changed fields require conversion
    // - has unique
    // - index for foreign key in local
    // - unique for foreign key targe

    const inspector = createInspector(link.connection);
    const currentTables = await inspector.tables();
    const isSchemaExits = (s: ISchema) => currentTables.includes(s.tableName);

    for (const schema of changes) {
      // Imported / protected schemas are not synchronized.
      if (!schema || schema.tags.includes('readonly')) {
        continue;
      }
      this.logger.debug('Synchornizing [%s] schema', schema.reference);

      if (!isSchemaExits(schema)) {
        instructions.push(...createTable(schema, link));
        instructions.push(...createRelations(schema, link));
      } else {
        //await doAlterTable(schema, link, inspector);
      }

      link.getAssications().get(schema.reference).inSync = true;
    }

    const order: QueryInstruction['type'][] = [
      'backup',
      'copy',
      'create',
      'constraint',
      'foreign',
      'drop',
    ];

    for (const phase of order) {
      const queries = instructions
        .filter(i => i.type === phase)
        .map(i => i.query)
        .filter(q => !!q.toQuery());

      this.logger.info(
        'Phase [%s] with [%d] instruction',
        phase,
        queries.length,
      );

      queries.forEach(q => console.log('--SQL:\t', q.toQuery()));

      await Promise.all(queries);
    }

    this.logger.info('Synchronized');
  }
}
