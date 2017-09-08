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

let paths;

/* ======================================================== */

// main();

function main(config, globalSecrets) {
    secrets = globalSecrets;
    paths = config;

    return new Promise((resolve, reject) => {
        let GLOBAL_FULL_PATH;

        // Create the dump
        mongoDump().then(foldername => {
            // console.log(foldername);
            GLOBAL_FULL_PATH = paths.PATH_DATA_DUMPS + "/" + foldername;
            return mongoZip(paths.PATH_DATA_DUMPS, foldername)
            // Then, zip the dump into a file
        }).then(success => {
            console.log("Successfully zipped mongo database file.");
            return mongoDelete(GLOBAL_FULL_PATH)
        }).then(success => {
            console.log("Successfully deleted old mongo database folder.");
            resolve();
        }).catch(ex => {
            reject(ex);
            console.log(ex);
        })
    })
}

function mongoDump () {
    return new Promise((resolve, reject) => {
        let folder_name = getFolderName();
        let output = paths.PATH_DATA_DUMPS + '/' + folder_name; // Generate the filename based on date

        let mongoquery = spawn('mongodump', [
            '-h', secrets.odk_mongo_db.host + ":" + secrets.odk_mongo_db.port,
            '-d', secrets.odk_mongo_db.database,
            '-u', secrets.odk_mongo_db.user,
            '-p', secrets.odk_mongo_db.password,
            '-o', `${output}`
        ]);

        mongoquery.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        mongoquery.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        mongoquery.on('close', (code) => {
            console.log(`child process exited with code ${code}`);

            if (code === 0) {
                resolve(folder_name);
            } else {
                reject("Failure!");
            }

        });

    })
}

function mongoZip(path, filename) {
    return new Promise((resolve, reject) => {
        //zip -r myfiles.zip mydir

        let zipfile = spawn('zip', [
            '-r', paths.PATH_ZIP_DUMPS + "/" + paths.PATH_DB_PREFIX_MONGO + filename + ".zip",
            paths.PATH_DATA_DUMPS + "/" + filename
        ]);

        zipfile.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        zipfile.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        zipfile.on('close', (code) => {
            console.log(`child process exited with code ${code}`);

            if (code === 0) {
                resolve();
            } else {
                reject();
            }

        });
    })
}

function mongoDelete(full_path) {
    return new Promise((resolve, reject) => {
        rimraf(full_path,  () => {
            console.log('done');
            resolve();
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