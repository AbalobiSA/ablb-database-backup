let rek = require('rekuire');
let secrets;
// let secrets = require('./secrets/secrets');
let salesforce = require('ablb-salesforce');
let childProcess = require("child_process");
let oldSpawn = childProcess.spawn;
let sanitize = require('sanitize-filename');
let moment = require("moment");
let fs = require('fs');
let rimraf = require('rimraf');
/* ======================================================== */

function mySpawn() {
    // console.log('spawn called');
    // console.log(arguments);
    return oldSpawn.apply(this, arguments);
}

childProcess.spawn = mySpawn;
let spawn = childProcess.spawn;

/* ======================================================== */

let password, host, user, database;
/* ======================================================== */

let paths;
// main();

function main(config, globalSecrets) {
    // Setup globals
    secrets = globalSecrets;
    paths = config;

    password = secrets.AbalobiUserPG.Password;
    host = secrets.AbalobiUserPG.Host;
    user = secrets.AbalobiUserPG.User;
    database = secrets.AbalobiUserPG.Database;




    console.log("Starting PG Backup...");

    let fileNameTimeStamp = getFolderName();
    let output = paths.PATH_ZIP_DUMPS + '/' + paths.PATH_DB_PREFIX_PG + fileNameTimeStamp + ".pgbackup";

    let commandLineArgs = `-Fc --no-acl --no-owner -h ${host} -U ${user} ${database} -f ${output}`;
    let args = commandLineArgs.split(" ");
    let options = {
        env: {
            "PGPASSWORD" : password
        }
    };
    // console.log(args);
    return pgDump(args, options).then(success => console.log(success))
}

function pgDump (args, options) {
    return new Promise((resolve, reject) => {


        let pgQuery = spawn('/usr/lib/postgresql/9.6/bin/pg_dump', args, options);

        pgQuery.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        pgQuery.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        pgQuery.on('close', (code) => {
            console.log(`child process exited with code ${code}`);

            if (code === 0) {
                resolve();
            } else {
                reject("Failure!");
            }

        });

    })
}


function getFolderName() {
    let dateObj = moment().format("YYYY-MM-DD_HH:mm:ss");
    return sanitize(dateObj);
}

module.exports = {
    backup: main
};