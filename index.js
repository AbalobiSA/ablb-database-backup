let secrets;

try {
    secrets = require("./secrets/secrets.js");
} catch (ex) {
    try {
        secrets = require("../../secrets/secrets.js");
    } catch (ex) {
        console.log("Unable to find your secrets file!");
        console.log(ex);
        process.exit(0);
    }
}

let mongo_backup = require('./backup_mongo.js');
let pg_backup = require('./backup_pg');
let sf_backup = require('./backup_salesforce');

function main(confObj, conn) {

    let testConfig = {
        PATH_DATA_DUMPS : "./dumps",
        PATH_ZIP_DUMPS : "./archives",
        PATH_DB_PREFIX_MONGO: "ablb_mongo_",
        PATH_DB_PREFIX_SF: "ablb_salesforce_",
        PATH_DB_PREFIX_PG: "ablb_postgres_"
    };

    let config = confObj || testConfig;

    console.log("Starting backup tasks...");

    return Promise.all([
        mongo_backup.backup(config, secrets),
        pg_backup.backup(config, secrets),
        sf_backup.backup(config, secrets, conn)
    ]).then(successArr => {
        console.log("All backups completed successfully!");
        return Promise.resolve("All files have been backed up!")
    }).catch(ex => {
        return Promise.reject(["Unable to backup some files!", ex]);
    })
}

// main().then(test => {
//
// }).catch(ex => {
//     console.log(ex);
// });

module.exports = {
    backup: main
};