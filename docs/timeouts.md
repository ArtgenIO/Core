### System Timeout limitations

**Module onStart**: Every module has 60 second from initialization to complete the onStart hook, if any of them fails to resolve it's promise in this interval then the startup will fail and every module will be asked to shutdown.

**Module onStop**: When requested, every module has 10 second to complete the onStop hook, otherwise the application will forcefully exit.
