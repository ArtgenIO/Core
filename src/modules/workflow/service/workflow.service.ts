import { ServiceBroker } from 'moleculer';
import { ModelDefined } from 'sequelize';
import { v4 } from 'uuid';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { IExtension } from '../../extension/interface/extension.interface';
import { SystemExtensionProvider } from '../../extension/provider/system-extension.provider';
import { LambdaService } from '../../lambda/service/lambda.service';
import { SchemaService } from '../../schema/service/schema.service';
import { IWorkflow } from '../interface/workflow.interface';
import { WorkflowSession } from '../library/workflow.session';

// Hook everything here, we can emit new and removed events so the http, and other triggers can be updated
@Service()
export class WorkflowService {
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
    @Inject(SystemExtensionProvider)
    readonly sysExt: IExtension,
  ) {
    this.model = this.schemas.model<IWorkflow>('system', 'Workflow');
  }

  async seed(): Promise<void> {
    for (const wf of this.sysExt.workflows) {
      const exists = await this.model.count({
        where: {
          id: wf.id,
        },
      });

      if (!exists) {
        await this.createWorkflow(wf);
      }
    }
  }

  async findAll(): Promise<IWorkflow[]> {
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
