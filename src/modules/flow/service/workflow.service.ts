import { Model } from 'objection';
import { v4 } from 'uuid';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { IBlueprint } from '../../blueprint/interface/extension.interface';
import { SystemBlueprintProvider } from '../../blueprint/provider/system-extension.provider';
import { LambdaService } from '../../lambda/service/lambda.service';
import { SchemaService } from '../../schema/service/schema.service';
import { ILogic } from '../interface/workflow.interface';
import { WorkflowSession } from '../library/workflow.session';

type FlowModel = ILogic & Model;

@Service()
export class FlowService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(LambdaService)
    readonly lambda: LambdaService,
    @Inject(SchemaService)
    readonly schema: SchemaService,
    @Inject(SystemBlueprintProvider)
    readonly sysExt: IBlueprint,
  ) {}

  async seed(): Promise<void> {
    for (const wf of this.sysExt.workflows) {
      const exists = await this.schema
        .getModel('main', 'Workflow')
        .query()
        .findById(wf.id);

      if (!exists) {
        await this.createWorkflow(wf);
      }
    }
  }

  async findAll(): Promise<ILogic[]> {
    return (
      await this.schema.getModel<FlowModel>('main', 'Workflow').query()
    ).map(wf => wf.$toJson());
  }

  async createWorkflowSession(workflowId: string, actionId?: string) {
    const workflow = await this.schema
      .getModel<FlowModel>('main', 'Workflow')
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

  async createWorkflow(workflow: Omit<ILogic, 'id'>): Promise<ILogic> {
    const record = await this.schema
      .getModel<FlowModel>('main', 'Workflow')
      .query()
      .insertAndFetch(workflow);

    // Save to the database.
    this.logger.info('New workflow [%s] has been created', record.id);

    return record.$toJson();
  }

  async updateWorkflow(workflow: ILogic): Promise<ILogic> {
    const record = await this.schema
      .getModel<FlowModel>('main', 'Workflow')
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
