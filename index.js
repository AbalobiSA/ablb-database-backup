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

function main(confObj) {

    let testConfig = {
        PATH_DATA_DUMPS : "./dumps",
        PATH_ZIP_DUMPS : "./archives",
        PATH_DB_PREFIX_MONGO: "ablb_mongo_"
    };

    let config = confObj || testConfig;

    console.log("Starting backup...");

    return mongo_backup.backup(config, secrets)
    .then(success => {
        console.log("All backup completed successfully!");
        return Promise.resolve("All files have been backed up!")
    }).catch(ex => {
        return Promise.reject(["Unable to backup some files!", ex]);
    })
}

// main().then(test => {
//     console.log(test)
// }).catch(ex => {
//     console.log(ex);
// });

module.exports = {
    backup: main
};
