import { JSONSchema7Definition } from 'json-schema';

export const JSCHEMA_MAP: JSONSchema7Definition = {
  type: 'object',
  patternProperties: {
    '^[a-z0-9]+$': {
      type: 'string',
    },
  },
};

export const JSCHEMA_ERR: JSONSchema7Definition = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
    },
  },
};

export const JSCHEMA_BINARY: JSONSchema7Definition = {
  type: 'string',
};

export const JSCHEMA_VOID: JSONSchema7Definition = {
  type: 'null',
};

export const JSCHEMA_TRIGGER: { [prop: string]: JSONSchema7Definition } = {
  responseFormat: {
    title: 'Response Format',
    enum: ['text/html', 'text/plain', 'application/json', 'octet/stream'],
    default: 'application/json',
  },
  response: {
    title: 'Response Content',
    type: 'string',
    default: '{"ack":true}',
  },
  waitForLastNode: {
    title: 'Wait For Last Node',
    type: 'boolean',
    default: 'true',
  },
};
