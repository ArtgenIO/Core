import { ILogger } from '@hisorange/kernel';
import Ajv from 'ajv';
import EventEmitter2 from 'eventemitter2';
import { default as isJSON } from 'is-json';
import * as jsonSchemaInst from 'json-schema-instantiator';
import merge from 'lodash.merge';
import nunjucks, { Environment } from 'nunjucks';
import { LambdaService } from '../services/lambda.service';
import { IFlowSessionContext } from '../types/flow-session-context.interface';
import { IFlow } from '../types/flow.interface';
import { ILambdaRecord } from '../types/record.interface';
import { ITriggerConfig } from '../types/trigger-config.interface';
import { ITriggerOutput } from '../types/trigger-output.interface';

export class FlowSession {
  protected startedAt: number;

  /**
   * Execution context for data travel
   */
  protected ctx: IFlowSessionContext;

  initialTriggerId: string;

  /**
   * Handles the schema validations
   */
  readonly validator = new Ajv({
    strict: false,
  });

  /**
   * Data travel transformation renderer
   */
  protected renderer: Environment;

  /**
   * Currently executed node
   */
  protected activeNodeId: string;

  /**
   * Trace the calls
   */
  protected stackTrace: string[] = [];

  protected debugTrace: [string, number][] = [];

  constructor(
    readonly logger: ILogger,
    readonly lambda: LambdaService,
    readonly bus: EventEmitter2,
    readonly flow: IFlow,
    readonly id: string,
  ) {
    this.startedAt = Date.now();
    this.ctx = this.createContext();
    this.renderer = this.createRenderer();
  }

  /**
   * Configure the Nunjucks renderer
   */
  protected createRenderer(): Environment {
    const renderer = nunjucks.configure({ autoescape: false });

    renderer.addFilter('toJson', JSON.stringify);
    renderer.addFilter('toObject', JSON.parse);
    renderer.addGlobal('timestamp', Date.now());

    return renderer;
  }

  /**
   * Initialize a context with every key prepared for the runtime changes
   */
  protected createContext(): IFlowSessionContext {
    const ctx: IFlowSessionContext = {
      $nodes: {},
      $trigger: {},
      $output: {},
      $input: {},
      $final: null,
    };

    for (const node of this.flow.nodes) {
      const nodeId = node.id;

      ctx.$nodes[nodeId] = {
        config: node.config,
        input: {},
        output: {},
      };

      const meta = this.getLambda(node.id).meta;

      for (const handle of meta.handles) {
        ctx.$nodes[nodeId][handle.direction][handle.id] = null;
      }
    }

    return ctx;
  }

  getContext() {
    return this.ctx;
  }

  /**
   * Get the lambda by mapping back to the node type
   */
  protected getLambda(nodeId: string): ILambdaRecord {
    const serialized = this.flow.nodes.find(node => node.id === nodeId);

    if (!serialized) {
      throw new Error(
        `Node [${nodeId}] is not part of the [${this.flow.id}] flow!`,
      );
    }

    const entry = this.lambda.findByType(serialized.type);

    if (!entry) {
      throw new Error(`Node type [${serialized.type}] is not registered`);
    }

    return entry;
  }

  /**
   * Check if the handle is registered on the lambda
   */
  protected isHandleRegistered(
    lambda: ILambdaRecord,
    handleId: string,
  ): boolean {
    return lambda.meta.handles.some(handle => handle.id === handleId);
  }

  /**
   * Test the input data before passing it to the handle
   */
  protected isDataValidForHandle(
    lambda: ILambdaRecord,
    handleId: string,
    data: unknown,
  ) {
    // Load the JSON schema
    const schema = lambda.meta.handles.find(
      handle => handle.id === handleId,
    ).schema;

    // Does not have a schema to be validated
    if (schema) {
      const validator = this.validator.compile(schema);
      const result = validator(data);

      if (result) {
        return true;
      } else {
        this.logger.error('Schema [%s]', schema);
        this.logger.error('Data [%s]', data);
        this.logger.error('Errors [%s]', validator.errors);
      }
    } else {
      return true;
    }

    return false;
  }

  /**
   * Set the current input and store the context trace
   */
  protected setInput(nodeId: string, handleId: string, data: unknown) {
    const lambda = this.getLambda(nodeId);

    if (this.isHandleRegistered(lambda, handleId)) {
      if (this.isDataValidForHandle(lambda, handleId, data)) {
        // Set it on the global context
        this.ctx.$nodes[nodeId].input[handleId] = data;
        // Set it to the current context
        this.ctx.$input = {
          [handleId]: data,
        };
      } else {
        throw new Error(
          `Lambda [${lambda.meta.type}] handle [${handleId}] validation failed`,
        );
      }
    } else {
      throw new Error(
        `Lambda [${lambda.meta.type}] does not have handle [${handleId}] registered`,
      );
    }
  }

  /**
   * Set the current output and store the context trace
   */
  setOutput(handleId: string, data: unknown) {
    const lambda = this.getLambda(this.activeNodeId);

    if (this.isHandleRegistered(lambda, handleId)) {
      if (this.isDataValidForHandle(lambda, handleId, data)) {
        // Set it on the global context
        this.ctx.$nodes[this.activeNodeId].output[handleId] = data;
        // Set it to the current context
        this.ctx.$output = {
          [handleId]: data,
        };
      } else {
        throw new Error(
          `Lambda [${lambda.meta.type}] handle [${handleId}] validation failed`,
        );
      }
    } else {
      throw new Error(
        `Lambda [${lambda.meta.type}] does not have handle [${handleId}] registered`,
      );
    }
  }

  /**
   * Read the input for the given handle
   */
  getInput<T = unknown>(handleId: string): T {
    return this.ctx.$input[handleId] as T;
  }

  /**
   * Read the output for the given handle
   */
  getOutput(handleId: string) {
    return this.ctx.$output[handleId];
  }

  /**
   * Check if an optional input is present
   */
  hasInput(handleId: string): boolean {
    return !!this.ctx.$input[handleId];
  }

  protected renderConfig(config: unknown) {
    switch (typeof config) {
      case 'string':
        if (this.isTemplateSyntax(config)) {
          config = this.renderSyntax(config);
        }
        break;
      case 'object':
        if (Array.isArray(config)) {
          config.forEach(i => this.renderConfig(i));
        } else {
          for (const k in config) {
            if (Object.prototype.hasOwnProperty.call(config, k)) {
              let val = this.renderConfig(config[k]);

              if (this.isTemplateSyntax(k)) {
                delete config[k];
                config[this.renderSyntax(k)] = val;
              } else {
                config[k] = val;
              }
            }
          }
        }
        break;
    }

    return config;
  }

  /**
   * Access to the node's config from the lambda's execution context
   */
  getConfig<T = unknown>(): T {
    const config = this.ctx.$nodes[this.activeNodeId].config as T;

    if (config) {
      return this.renderConfig(config) as T;
    }

    return config;
  }

  /**
   * Invoke a trigger with request data and format the response based in the config
   */
  async trigger(triggerId: string, request: any): Promise<ITriggerOutput> {
    const startedAt = Date.now();
    // Store the trigger data
    this.ctx.$trigger = request;
    this.initialTriggerId = triggerId;

    // Default response
    const config = this.ctx.$nodes[triggerId].config as ITriggerConfig;

    if (config.waitForLastNode) {
      try {
        await this.invokeNode(triggerId);
      } catch (error) {
        this.logger.error('Uncaught trigger error!');
        this.logger.error('Flow [%s]', this.flow.name);
        this.logger.error('Stack Trace [%s]', this.stackTrace);
        this.logger.error('Input [%s]', this.ctx.$input);
        this.logger.error('Error [%s]', error);
      }
    }
    let response = config.response;

    // Render the response is not a direct response
    if (this.isTemplateSyntax(response)) {
      response = this.renderSyntax(config.response);
    }

    // Response is an object
    if (config.responseFormat === 'application/json' && isJSON(response)) {
      try {
        response = JSON.parse(response);
      } catch (error) {
        this.logger.error('Response is not a valid json %s', {
          error,
          response,
        });
      }
    }

    this.bus.emit(
      `flow.${this.flow.id}.finished`,
      this.id,
      this.flow,
      this.getContext(),
      this.debugTrace,
      startedAt,
    );

    return {
      meta: {
        // Re query the config, maybe changed by a terminator
        config: this.ctx.$nodes[triggerId].config as ITriggerConfig,
      },
      data: response,
    };
  }

  /**
   * Check if the config is a template syntax
   */
  isTemplateSyntax(syntax: string): boolean {
    if (typeof syntax === 'string') {
      return !!syntax.match('{{') && !!syntax.match('}}');
    }

    return false;
  }

  renderSyntax(syntax: string) {
    return this.renderer.renderString(syntax, this.ctx);
  }

  /**
   * Invoke the node in the flow
   */
  protected async invokeNode(nodeId: string): Promise<void> {
    this.stackTrace.push(nodeId);
    this.debugTrace.push([nodeId, Date.now() - this.startedAt]);

    this.logger.debug('Invoking [%d][%s]', this.debugTrace.length, nodeId);

    // Resolve the lambda to the node type
    const lambda = this.getLambda(nodeId);

    // Change the context for the node
    this.activeNodeId = nodeId;

    // Reset the output context
    this.ctx.$output = {};

    let outputs: void | { [handeId: string]: unknown };

    // Get the output edges from the returned object
    // { content: 'a' } populates the content handle
    try {
      outputs = await lambda.handler.invoke(this);
    } catch (error) {
      this.logger.error('Uncaught lambda error!');
      this.logger.error('Flow', this.flow.id.substring(0, 8));
      this.logger.error('Stack Trace', this.stackTrace);
      this.logger.error('Input', this.ctx.$input);
      this.logger.error('Error', error);

      throw error;
    }

    // Reset the input context
    this.ctx.$input = {};

    // Load global output if the lambda didn't do it
    // Basically magic output handling
    if (typeof outputs === 'object') {
      for (const handle in outputs) {
        if (Object.prototype.hasOwnProperty.call(outputs, handle)) {
          this.setOutput(handle, outputs[handle]);
        }
      }
    }

    // Get the connected edges
    const edges = this.flow.edges.filter(edge => edge.sourceNodeId === nodeId);

    const chains = [];

    // Only the filled handles are triggered
    // So, if a lambda sets an output handle to any value
    // The flow will invoke it, even with null or falsy values
    for (const handleId in this.ctx.$output) {
      if (Object.prototype.hasOwnProperty.call(this.ctx.$output, handleId)) {
        const output = this.ctx.$output[handleId];

        // Filter for the same handle which we process
        // In case when the executed node has multiple handle connected to multiple target node
        const handleEdges = edges.filter(
          edge => edge.sourceHandle === handleId,
        );

        for (const edge of handleEdges) {
          const targetNodeId = edge.targetNodeId;
          const targetLambda = this.getLambda(targetNodeId);
          const targetHandle = targetLambda.meta.handles.find(
            h => h.id === edge.targetHandle,
          );

          let targetInput = output as string | [] | boolean | null | number;

          // Init a default config for the node
          if (typeof targetInput === 'object') {
            if (targetHandle.schema) {
              const handleDefaults = jsonSchemaInst.instantiate(
                targetHandle.schema,
              );

              if (!Array.isArray(targetInput)) {
                // Merge when the type is a POJO
                targetInput = merge(handleDefaults, output);
              }
            }
          }

          // Value transformation
          if (edge?.transform) {
            targetInput = this.renderer.renderString(edge.transform, {
              ...this.ctx,
              $data: output,
            }) as string;

            if (isJSON(targetInput.trim())) {
              try {
                targetInput = JSON.parse(targetInput);
              } catch (error) {
                this.logger.error('Invalid JSON format', {
                  node: targetNodeId,
                  handle: edge.targetHandle,
                  value: targetInput,
                  context: this.ctx,
                });
                throw new Error(`Input is not a JSON`);
              }
            }
          }

          if (targetInput === 'false') {
            targetInput = false;
          } else if (targetInput === 'true') {
            targetInput = true;
          } else if (targetInput === 'null') {
            targetInput = null;
          }

          // Configure the next node's input
          this.setInput(targetNodeId, edge.targetHandle, targetInput);
          // Invoke the next node
          chains.push(this.invokeNode(targetNodeId));
        }
      }
    }

    await Promise.all(chains);

    this.stackTrace.pop();
  }
}
