import { IModule, Kernel } from '@hisorange/kernel';
import { Constructor } from '@loopback/context';
import 'dotenv-defaults/config';
import esMain from 'es-main';
import 'reflect-metadata';
import { AppModule } from './app/app.module';

export async function main(modules: Constructor<IModule>[]): Promise<void> {
  const kernel = new Kernel();
  kernel.register(modules);

  await kernel.boostrap();
  await kernel.start();
}

// Direct invoking, run the application.
if (esMain(import.meta)) {
  main([AppModule]);
}
