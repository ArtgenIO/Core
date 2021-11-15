import { AppModule } from './app.module';
import { Kernel } from './system/kernel/kernel';

(async function main() {
  // Bootstrap with the production features.
  const app = new Kernel();

  // Register the base modules.
  if (app.bootstrap([AppModule])) {
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
