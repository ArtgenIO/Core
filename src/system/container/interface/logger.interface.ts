import { Logger } from 'winston';

// This interface is here to avoid import collision with the @Logger decorator.
export type ILogger = Logger;
