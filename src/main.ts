import 'reflect-metadata';
import { ContentModule } from './content/content.module';
import { ManagementModule } from './management/management.module';
import { Application } from './system/app/application';
import { SystemModule } from './system/system.module';

(async function main() {
  // Bootstrap with the production features.
  const app = new Application();

  // Register the base modules.
  if (app.bootstrap([ContentModule, ManagementModule, SystemModule])) {
    // Start the application!
    if (await app.start()) {
      // Shutdown handler
      const shutdown = async () => {
        console.log('');

        // Graceful shutdown timeout
        setTimeout(() => {
          process.exit(5);
        }, 10_000);

        if (await app.stop()) {
          process.exit(0);
        }

        // Some module failed
        process.exit(4);
      };

      // Register the shutdown hooks.
      process.on('SIGINT', shutdown.bind(shutdown));
      process.on('SIGTERM', shutdown.bind(shutdown));
    } else {
      process.exit(3);
    }
  } else {
    process.exit(2);
  }
})();
