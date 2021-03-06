declare namespace NodeJS {
  interface ProcessEnv {
    ARTGEN_NODE_ID: string;
    ARTGEN_DATABASE_DSN: string;
    ARTGEN_HTTP_PORT: string;
    ARTGEN_HTTP_HOST: string;
    ARTGEN_DEMO: '0' | '1';

    NODE_ENV: 'production' | 'development' | 'test';
    PORT: string;

    ARTGEN_MEILI_HOST: string;
    ARTGEN_MEILI_KEY: string;

    CYPRESS_COVERAGE: '1' | undefined;
  }
}
