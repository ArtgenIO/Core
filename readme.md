![Artgen Social Banner](https://user-images.githubusercontent.com/3441017/140712817-6de39d70-74ab-43d2-924f-b02776953c27.png)

[![CD](https://github.com/artgenio/core/actions/workflows/cd.yml/badge.svg?branch=main)](https://github.com/artgenio/core/actions/workflows/cd.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/artgenio/core)](https://hub.docker.com/r/artgenio/core)
[![Docker Image Version](https://img.shields.io/docker/v/artgenio/core)](https://hub.docker.com/r/artgenio/core)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/artgenio/core)](https://github.com/ArtgenIO/Core/commits/main)
[![Coverage Status](https://coveralls.io/repos/github/ArtgenIO/Core/badge.svg?branch=main)](https://coveralls.io/github/ArtgenIO/Core?branch=main)
[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

### Get Started!

---

```sh
docker run -d -p 80:7200 artgenio/core:latest

# Even faster test!
npx @artgen/core
```

then visit the [http://localhost:7200](http://localhost:7200) address

#### Project Status

---

Currently the project in the **alpha preview** phase, nothing is finalized and we are just experimenting with solutions, the proof of concept works and the goal is clear, but the features will be documented when they reach a stable enough status to be used in a beta preview like environment.

### Database Support

---

Not just one, or two, but 4 database provider is supported out of the box. By default the system starts up with an in memory SQLite database, but this is only good for previewing the system capabilities. But, of course You can use and should use persistent databases, simply configure the **ARTGEN_DATABASE_DSN** environment variable to your target database's DSN.

On boot the system will check if the system database has the necessary tables in place, if not then simply installs them, You have no work with the setup.

| Provider                | DSN Pattern                                         | Tested |
| :---------------------- | --------------------------------------------------- | -----: |
| **MySQL**               | `mysql://username:password@host.tld:3306/dbname`    |    8.x |
| **MariaDB**             | `mariadb://username:password@host.tld:3306/dbname`  |   10.x |
| **PostgreSQL**          | `postgres://username:password@host.tld:5432/dbname` |   14.x |
| **SQLite (InMemory)**   | `sqlite::memory:`                                   |    3.x |
| **SQLite (Persistent)** | `sqlite:./path/to/db.sql`                           |    3.x |

It is prefered to run the Artgen's system database in a standalone database, but don't worry, it will not modify any other table just those which You configure to do so.

##### Import Existing Database

---

This feature is still in heavy development, but the system is capable of mapping and importing existing databases, by default it will tag them as "readonly" in the sense that it will not modify their structure. But You can remove this tag and change the existing databases as well. It's useful if You want to control your existing system with a versatile user interface.

### Feature Index

- One Click Install Cloud Blueprints
- Visual Data Modeller
- Visual Flow Engine
- Drag and Drop UI Editor
- Rest API Generator
- OData API Generator
- Built In Customizable User Management
- Customizable Dashboard (coming soon)
- CRON Scheduled Flows (coming soon)
- GraphQL API generator (coming soon)
- Chart / Analytics builder (under development)

---

##### [Changelog](./changelog.md)
