# DEPRECATED - DO NOT USE - THIS REPO HAS BEEN MOVED TO BITBUCKET
See https://bitbucket.org/abalobi

# Abalobi Database Backup

Node module used for backing up abalobi databases.

---------------

### Getting started

Clone this module into your NodeJS app,
and provide a secrets file containing a Salesforce username and password referenced in `index.js`

    $ yarn add git+https://git@github.com/AbalobiSA/ablb-database-backup.git

You will now be able to import this module and use it in your project.

### Dependencies

You will need to install the following native command line tools
for the backup scripts to work:

- PostgreSQL 9.6, with this specific executable: `/usr/lib/postgresql/9.6/bin/pg_dump`
- MongoDB tools, with mongoDump version 3.4.7
- Zip (linux command line zip tool)


### Usage

```js

let ablb-backups = require('ablb-database-backup');

let config = {
     PATH_DATA_DUMPS : "./dumps",
     PATH_ZIP_DUMPS : "./archives",
     PATH_DB_PREFIX_MONGO: "ablb_mongo_",
     PATH_DB_PREFIX_SF: "ablb_salesforce_",
     PATH_DB_PREFIX_PG: "ablb_postgres_"
 };

ablb-backups.backup(config).then(success => console.log(success))
                           .catch(ex => console.log(ex));
```
