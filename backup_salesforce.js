let rek = require('rekuire');
let secrets;
let salesforce = require('ablb-salesforce');
let fs = require('fs');
let moment = require('moment');
let sanitize = require('sanitize-filename');
let paths;

function main(config, globalSecrets, conn) {
    secrets = globalSecrets;
    paths = config;

    let tables = [
        {"name": "Ablb_Bait_Types__c"},
        {"name": "Ablb_Boat__c"},
        {"name": "Ablb_Catch_Method__c"},
        {"name": "Ablb_Co_op__c"},
        {"name": "Ablb_Co_op_membership__c"},
        {"name": "Ablb_Community__c"},
        {"name": "Ablb_Fisher_Catch__c"},
        {"name": "Ablb_Fisher_Trip__c"},
        // {"name" : "Ablb_Global_Var__c"},
        // {"name" : "Ablb_Gps_Track__c"},
        // {"name" : "Ablb_Group__c"},
        // {"name" : "Ablb_Group_membership__c"},
        {"name": "Ablb_Landing_Site__c"},
        {"name": "Ablb_Monitor_Catch__c"},
        {"name": "Ablb_Monitor_Day__c"},
        {"name": "Ablb_Monitor_Role__c"},
        {"name": "Ablb_Monitor_Sample__c"},
        {"name": "Ablb_Monitor_Trip__c"},
        {"name": "Ablb_No_Trip_Reason__c"},
        {"name": "Ablb_Pwd__c"},
        {"name": "Ablb_Registration__c"},
        {"name": "Ablb_Share_Rule__c"},
        {"name": "Ablb_Species__c"},
        {"name": "Ablb_User_Type__c"},
        {"name": "Ablb_User__c"},
        {"name": "Ablb_H2C_Info__c"}
    ];

    // return salesforce.createConnection()
    //     .then(connection => {
    conn.bulk.pollInterval = 5000; // 5 sec
    conn.bulk.pollTimeout = 120000; // 60 sec

    let promiseArr = [];
    for (let table of tables) {
        promiseArr.push(salesforce.getFieldNames(conn, table.name));
    }
    return Promise
        .all(promiseArr)
        .then(fields_array => {

            let filtered_fields = fields_array.map(fieldListArr => {
                return fieldListArr.filter(item => {
                    return item !== "attributes";
                })
            });

            let queryArray = [];

            let count = 0;
            for (let table of tables) {
                // queryArray.push(getRecords(conn, table.name, filtered_fields[count]));
                queryArray.push(getBulkRecords(conn, table.name, filtered_fields[count]));
                count++;
            }

            return Promise.all(queryArray);
        }).then(resultsArray => {
            return writeRecordsFile(resultsArray);
        })
}

function getRecords(conn, table, fields) {
    let star = fields.join(", ");
    let queryString = `SELECT ${star} FROM ${table}`;
    return conn.query(queryString).then(result => {
        return Promise.resolve({
            table: table,
            records: result.records
        });
    })
}

function getBulkRecords(conn, table, fields) {
    return new Promise((resolve, reject) => {
        let star = fields.join(", ");
        let queryString = `SELECT ${star} FROM ${table}`;

        let records = [];
        console.log("Querying: " + table);

        conn.bulk.query(queryString)
            .on('record', (rec) => {
                // console.log(rec);
                records.push(rec);
            })
            .on('error', (err) => {
                console.log("Critical salesforce failure!");
                console.error(err);
                reject(err);
            })
            .on('end', () => {
                console.log("Got all records for: " + table);
                // console.log("Logging records", records);
                resolve({
                    table: table,
                    records: records
                });
            })
    })
}

function getFolderName() {
    let dateObj = moment().format("YYYY-MM-DD_HH:mm:ss");
    return sanitize(dateObj);
}

function writeRecordsFile(data) {
    return new Promise((resolve, reject) => {
        let filepath = paths.PATH_ZIP_DUMPS + "/" + paths.PATH_DB_PREFIX_SF + getFolderName() + ".json";

        fs.writeFile(filepath, JSON.stringify(data), (err, success) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("File written!");
                resolve();
            }
        })
    })
}

module.exports = {
    backup: main
};