import { Module } from './container';
import { DatabaseModule } from './database/database.module';
import { DevelopModule } from './develop/develop.module';
import { HttpRequestLambda, LogLambda } from './lambda';
import { SecurityModule } from './security/security.module';
import { ServerModule } from './server/server.module';

@Module({
  exports: [DatabaseModule, DevelopModule, SecurityModule, ServerModule],
  providers: [HttpRequestLambda, LogLambda],
})
export class SystemModule {}
