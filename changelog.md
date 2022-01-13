### Version 0.1.10

- Remove duplicated EPs
- Fix JS error in the content list view
- Delete a lot of dupe code
- Improved OData support
- Improved reactivity on schema changes

### Version 0.1.9

- Unifyed UI for the main content manager
- Content modules on the UI
- Simplified content editor
- New content tree
- Schema editor starts to merge with the content screen

### Version 0.1.8

- Smarter blueprint handling
- Faster boot time
- Content level modules
- Health check like service
- Delete the temp landing page seed
- Faster reaction to schema changes
- Fix null conversion on the REST API
- Protect OData routes with authentication validator

### Version 0.1.7

- Seamless HTTP restarts
- Proxified HTTP upstream servers
- Fix JSON Schema type bugs in the rest service

### Version 0.1.6

- CRON based flow trigger
- Fix the upgrade checker's spam
- Flow now logs with a localized logger for easier debug
- Flow engine initialized in context session
- Lotsa small bug fix while working toward the 0.2.x milestone

### Version 0.1.3

- Remove the Cypress tests until the random fail is not patched
- New UI design for the database editor
- Experimenting with ARM releases for fellow raspy users

### Version 0.1.0

- Use homebrew table sync for better control
- Replaced the Sequelize with Knex for stability
- Enhanced testing for every database provider

### Version 0.0.19

- Lotsa new lambda
- New sign in workflow

### Version 0.0.17

- New sign in page design
- Cypress testing
- Authentication is more informative
- Release flow changes

### Version 0.0.16

- Cloud Extension store working!

### Version 0.0.14

- Lamdas for CRUD read / list action
- CRUD list action service
- Base line for the Cloud Extension store

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
