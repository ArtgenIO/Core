import { readFile } from 'fs/promises';
import { ServiceBroker } from 'moleculer';
import { basename, join } from 'path';
import { ConnectionManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import walkdir from 'walkdir';
import { ROOT_DIR } from '../../../paths';
import { ILogger, Inject, Logger } from '../../../system/container';
import { LambdaService } from '../../lambda/service/lambda.service';
import { WorkflowEntity } from '../collection/workflow.collection';
import { IWorkflow } from '../interface/serialized-workflow.interface';
import { WorkflowSession } from '../library/workflow.session';

// Hook everything here, we can emit new and removed events so the http, and other triggers can be updated
export class WorkflowService {
  protected workflows: IWorkflow[] = [];
  protected repository: Repository<IWorkflow>;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject('providers.RpcServerProvider')
    readonly rpcServer: ServiceBroker,
    @Inject('classes.LambdaService')
    readonly lambda: LambdaService,
    @Inject('providers.ConnectionManagerProvider')
    readonly connectionManager: ConnectionManager,
  ) {
    this.repository = this.connectionManager
      .get('system')
      .getRepository<IWorkflow>(WorkflowEntity);
  }

  async findAll(): Promise<IWorkflow[]> {
    if (!this.workflows.length) {
      const path = join(ROOT_DIR, 'storage/seed/workflow');

      for (const workflow of await walkdir.async(path)) {
        this.logger.info('Seeding [%s] workflow', basename(workflow));

        await this.createWorkflow(
          JSON.parse((await readFile(workflow)).toString()),
        ).catch(() => {
          this.logger.warn('Workflow [%s] already seeded', basename(workflow));
        });
      }

      const dbWorkflows = await this.repository.find();

      this.workflows = [
        ...dbWorkflows.map(wf => ({
          id: wf.id,
          name: wf.name,
          nodes: wf.nodes,
          edges: wf.edges,
        })),
      ];
    }

    return this.workflows;
  }

  async createWorkflowSession(workflowId: string, actionId?: string) {
    const workflows = await this.findAll();
    const workflow = workflows.find(wf => wf.id === workflowId);

    if (!actionId) {
      actionId = v4();
    }

    return new WorkflowSession(this.lambda, workflow, actionId);
  }

  async createWorkflow(workflow: Omit<IWorkflow, 'id'>): Promise<IWorkflow> {
    const entity = this.repository.create(workflow);

    // Save to the database.
    await this.repository.save(entity);
    this.workflows.push(entity);
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

    this.workflows = this.workflows.filter(wf => wf.id !== workflow.id);
    this.workflows.push({
      id: workflow.id,
      name: workflow.name,
      nodes: workflow.nodes,
      edges: workflow.edges,
    });

    this.logger.info('Workflow [%s] updated', workflow.id);

    return record;
  }
}
