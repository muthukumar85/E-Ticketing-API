const express = require('express');
const mysql = require('mysql');

const hostname = "13.200.46.244";
const username = "gtn";
const password = "eSL57k9o2nkd8wXyNUPQ";
const database = "eticketSchema";


const db = mysql.createConnection({
    host: hostname,
    user: username,
    password: password,
    database: database,
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("mysql connected");
    }
});
const pool = mysql.createPool({
    host: hostname,
    user: username,
    password: password,
    database: database,
    port: 3306
});
module.exports = pool;
module.exports = db;
