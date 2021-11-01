declare namespace NodeJS {
  interface ProcessEnv {
    POSTGRES_DSN: string;
    NODE_ENV: 'production' | 'development' | 'test';
    PORT: string;
  }
}
