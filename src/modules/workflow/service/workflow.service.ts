import { Model } from 'objection';
import { v4 } from 'uuid';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { IExtension } from '../../extension/interface/extension.interface';
import { SystemExtensionProvider } from '../../extension/provider/system-extension.provider';
import { LambdaService } from '../../lambda/service/lambda.service';
import { SchemaService } from '../../schema/service/schema.service';
import { IWorkflow } from '../interface/workflow.interface';
import { WorkflowSession } from '../library/workflow.session';

type WorkflowModel = IWorkflow & Model;

@Service()
export class WorkflowService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(LambdaService)
    readonly lambda: LambdaService,
    @Inject(SchemaService)
    readonly schema: SchemaService,
    @Inject(SystemExtensionProvider)
    readonly sysExt: IExtension,
  ) {}

  async seed(): Promise<void> {
    for (const wf of this.sysExt.workflows) {
      const exists = await this.schema
        .model('system', 'Workflow')
        .query()
        .findById(wf.id);

      if (!exists) {
        await this.createWorkflow(wf);
      }
    }
  }

  async findAll(): Promise<IWorkflow[]> {
    return (
      await this.schema.model<WorkflowModel>('system', 'Workflow').query()
    ).map(wf => wf.$toJson());
  }

  async createWorkflowSession(workflowId: string, actionId?: string) {
    const workflow = await this.schema
      .model<WorkflowModel>('system', 'Workflow')
      .query()
      .findById(workflowId);

    if (!workflow) {
      throw new Error(`Workflow does not exists [${workflowId}]`);
    }

    if (!actionId) {
      actionId = v4();
    }

    return new WorkflowSession(this.lambda, workflow.$toJson(), actionId);
  }

  async createWorkflow(workflow: Omit<IWorkflow, 'id'>): Promise<IWorkflow> {
    const record = await this.schema
      .model<WorkflowModel>('system', 'Workflow')
      .query()
      .insertAndFetch(workflow);

    // Save to the database.
    this.logger.info('New workflow [%s] has been created', record.id);

    return record.$toJson();
  }

  async updateWorkflow(workflow: IWorkflow): Promise<IWorkflow> {
    const record = await this.schema
      .model<WorkflowModel>('system', 'Workflow')
      .query()
      .findById(workflow.id);

    record.$set({
      name: workflow.name,
      nodes: workflow.nodes,
      edges: workflow.edges,
    });

    // Update to the database.
    await record.$query().update();

    this.logger.info('Workflow [%s] updated', workflow.id);

    return record.$toJson();
  }
}
