import { readFile } from 'fs/promises';
import { ServiceBroker } from 'moleculer';
import { basename, join } from 'path';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import walkdir from 'walkdir';
import { SchemaService } from '../../../content/schema/service/schema.service';
import { ROOT_DIR } from '../../../paths';
import { ILogger, Inject, Logger, Service } from '../../../system/container';
import { LambdaService } from '../../lambda/service/lambda.service';
import { IWorkflow } from '../interface/workflow.interface';
import { WorkflowSession } from '../library/workflow.session';

// Hook everything here, we can emit new and removed events so the http, and other triggers can be updated
@Service()
export class WorkflowService {
  protected isSeedFinished: Promise<boolean> | true;
  protected repository: Repository<IWorkflow>;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject('providers.RpcServerProvider')
    readonly rpcServer: ServiceBroker,
    @Inject('classes.LambdaService')
    readonly lambda: LambdaService,
    @Inject('classes.SchemaService')
    readonly schemas: SchemaService,
  ) {
    this.repository = this.schemas.getRepository('system', 'Workflow');
    this.loadSystemWorkflows();
  }

  async loadSystemWorkflows(): Promise<void> {
    this.isSeedFinished = new Promise<boolean>(async ok => {
      const path = join(ROOT_DIR, 'storage/seed/workflow');

      for (const workflow of await walkdir.async(path)) {
        this.logger.info('Seeding [%s] workflow', basename(workflow));
        const seed = JSON.parse((await readFile(workflow)).toString());
        const exists = await this.repository.count({
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

    return await this.repository.find();
  }

  async createWorkflowSession(workflowId: string, actionId?: string) {
    const workflow = await this.repository.findOne(workflowId);

    if (!workflow) {
      throw new Error(`Workflow does not exists [${workflowId}]`);
    }

    if (!actionId) {
      actionId = v4();
    }

    return new WorkflowSession(this.lambda, workflow, actionId);
  }

  async createWorkflow(workflow: Omit<IWorkflow, 'id'>): Promise<IWorkflow> {
    const entity = this.repository.create(workflow);

    // Save to the database.
    await this.repository.save(entity);
    this.logger.info('New workflow [%s] has been created', entity.id);

    return entity;
  }

  async updateWorkflow(workflow: IWorkflow): Promise<IWorkflow> {
    const record = await this.repository.findOneOrFail(workflow.id);

    record.name = workflow.name;
    record.nodes = workflow.nodes;
    record.edges = workflow.edges;

    // Update to the database.
    await this.repository.save(record);

    this.logger.info('Workflow [%s] updated', workflow.id);

    return record;
  }
}
