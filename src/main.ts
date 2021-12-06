import { Constructor } from '@loopback/context';
import 'dotenv-defaults/config';
import 'reflect-metadata';
import { AppModule } from './app/app.module';
import { IModule } from './app/container';
import { IKernel } from './app/kernel';
import { Kernel } from './app/kernel/kernel';

export async function main(modules: Constructor<IModule>[]): Promise<IKernel> {
  const kernel = new Kernel();

  // Register the modules.
  if (kernel.register(modules)) {
    // Shutdown handler
    const shutdown = async () => {
      console.log('');

      // Graceful shutdown timeout
      setTimeout(() => {
        process.exit(5);
      }, 10_000);

      if (await kernel.stop()) {
        process.exit(0);
      }

      // Some module failed
      process.exit(4);
    };

    // Register the shutdown hooks.
    process.on('SIGINT', shutdown.bind(shutdown));
    process.on('SIGTERM', shutdown.bind(shutdown));

    // Demo mode restarts every 30 minute, it rebuilds the database in case someone breaks it, yep Norbi, I mean You!... :D
    if (process.env?.ARTGEN_DEMO === '1') {
      setTimeout(() => kernel.stop(), 1_800_000);
    }

    // Boostrap the application!
    if (await kernel.boostrap()) {
      await kernel.start();
    } else {
      process.exit(3);
    }
  } else {
    process.exit(2);
  }

  return kernel;
}

// Direct invoking, run the application.
if (require.main === module) {
  main([AppModule]);
}
