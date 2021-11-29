### Version 0.0.13

- Offline extension support
- Observe and handle schema changes
- Allow trusted proxies

### Version 0.0.11

- Scheduler with CRON like task timing
- Upgrade detector module initialized
- Fixed the bad EP on workflow creation UI

### Version 0.0.10

- REST functionality tested and fixed
- Authentication with header and access key query param tested
- Fixed the dagre import in the live build

### Version 0.0.9

- Reorganized base structure
- More realistic tests
- KV storage
- JWT secret is persistent
- Spliting the rest / odata modules
- Use the more common Admin naming
- Analytics bootstrapping
- Group the HTTP resources into a module
- RPC as separate module
- Fixed a lot of open handles
- Graceful shutdown should work now
- HTTP gateways are deregistered
- Page seed is not in race condition anymore (hacky but will be fixed later)

### Version 0.0.6

- Use the .env based config pattern
- Remove dead codes
- Use tsc to build the API

### Version 0.0.5

- Authentication strategies
- Key value storage service
- JWT, Access Key support
- Improved build with ESBuild for the API
- Better Rest coverage
- Authentication on the Rest & OData endpoints
- Removed redundant endpoints / workflows

### Version 0.0.4

- Initial automated release
- Preview functionality for the main features
- Working data model editor
- Testable workflow engine concept
- Testable static page builder concept
