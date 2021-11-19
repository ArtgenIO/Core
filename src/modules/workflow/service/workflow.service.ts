import { readFile } from 'fs/promises';
import { ServiceBroker } from 'moleculer';
import { basename, join } from 'path';
import { ModelDefined } from 'sequelize';
import { v4 } from 'uuid';
import walkdir from 'walkdir';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { ROOT_DIR } from '../../../app/globals';
import { LambdaService } from '../../lambda/service/lambda.service';
import { SchemaService } from '../../schema/service/schema.service';
import { IWorkflow } from '../interface/workflow.interface';
import { WorkflowSession } from '../library/workflow.session';

// Hook everything here, we can emit new and removed events so the http, and other triggers can be updated
@Service()
export class WorkflowService {
  protected isSeedFinished: Promise<boolean> | true;
  protected model: ModelDefined<IWorkflow, IWorkflow>;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(ServiceBroker)
    readonly rpcServer: ServiceBroker,
    @Inject(LambdaService)
    readonly lambda: LambdaService,
    @Inject(SchemaService)
    readonly schemas: SchemaService,
  ) {
    this.model = this.schemas.model<IWorkflow>('system', 'Workflow');
    this.loadSystemWorkflows();
  }

  async loadSystemWorkflows(): Promise<void> {
    this.isSeedFinished = new Promise<boolean>(async ok => {
      const path = join(ROOT_DIR, 'storage/seed/workflow');

      for (const workflow of await walkdir.async(path)) {
        this.logger.info('Seeding [%s] workflow', basename(workflow));
        const seed = JSON.parse((await readFile(workflow)).toString());
        const exists = await this.model.count({
          where: {
            id: seed.id,
          },
        });

        if (!exists) {
          await this.createWorkflow(seed);
        }
      }

      ok(true);
    });
  }

  async findAll(): Promise<IWorkflow[]> {
    await this.isSeedFinished;

    return (await this.model.findAll()).map(wf => wf.get({ plain: true }));
  }

  async createWorkflowSession(workflowId: string, actionId?: string) {
    const workflow = await this.model.findByPk(workflowId);

    if (!workflow) {
      throw new Error(`Workflow does not exists [${workflowId}]`);
    }

    if (!actionId) {
      actionId = v4();
    }

    return new WorkflowSession(
      this.lambda,
      workflow.get({ plain: true }),
      actionId,
    );
  }

  async createWorkflow(workflow: Omit<IWorkflow, 'id'>): Promise<IWorkflow> {
    const record = await this.model.create({
      id: v4(),
      ...workflow,
    });

    // Save to the database.
    this.logger.info(
      'New workflow [%s] has been created',
      record.getDataValue('id'),
    );

    return record.get({ plain: true });
  }

  async updateWorkflow(workflow: IWorkflow): Promise<IWorkflow> {
    const record = await this.model.findByPk(workflow.id);

    record.setAttributes({
      name: workflow.name,
      nodes: workflow.nodes,
      edges: workflow.edges,
    });

    // Update to the database.
    await record.save();

    this.logger.info('Workflow [%s] updated', workflow.id);

    return record.get({ plain: true });
  }
}
