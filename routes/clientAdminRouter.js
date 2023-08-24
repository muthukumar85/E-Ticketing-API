var express = require('express');
var CLRouter = express.Router();
var bodyParser = require('body-parser');
var db = require('../sql/connect');

CLRouter.use(bodyParser.json());

CLRouter.route('/getgraph')
    .post((req, res, next) => {
        let sql = `SELECT
        SUM(CASE WHEN ticket_status = 'solved' THEN 1 ELSE 0 END) AS solved,
        SUM(CASE WHEN ticket_status = 'unsolved' THEN 1 ELSE 0 END) AS unsolved
      FROM
        tickets WHERE client_id = ${req.body.client_id} `;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {

                res.json({ success: true, result: result });
            }
        });
    });

CLRouter.route('/getreports')
    .post((req, res, next) => {
        let sql = `SELECT * , (@serial := @serial + 1) AS serial_number ,  (SELECT name FROM users WHERE id = tickets.user_id) username , (SELECT company_name FROM companies WHERE company_id = tickets.client_id) clientname FROM tickets , (SELECT @serial := 0) AS init WHERE client_id = ${req.body.client_id}`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });

CLRouter.route('/getusers')
    .post((req, res, next) => {
        let sql = `SELECT name , id , email , mobile , role ,  (SELECT name FROM units WHERE unit_id = users.unit_id) unit_name  FROM users WHERE created_by = ${req.body.client_id} `;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });

CLRouter.route('/gettickets')
    .post((req, res, next) => {
        var solved;
        var unsolved;
        let sql1 = `SELECT * , (@serial := @serial + 1) AS serial_number , (SELECT name FROM users WHERE id = tickets.user_id) username , (SELECT company_name FROM companies WHERE company_id = tickets.client_id) clientname FROM tickets , (SELECT @serial := 0) AS init WHERE client_id = ${req.body.client_id} AND ticket_status = 'solved'`;
        let sql2 = `SELECT * , (@serial := @serial + 1) AS serial_number , (SELECT name FROM users WHERE id = tickets.user_id) username , (SELECT company_name FROM companies WHERE company_id = tickets.client_id) clientname FROM tickets , (SELECT @serial := 0) AS init WHERE client_id = ${req.body.client_id} AND ticket_status = 'unsolved'`;
        db.query(sql1, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                solved = result;
                db.query(sql2, (err, results) => {
                    if (err) {
                        next(err);
                    }
                    else {
                        unsolved = results;
                        res.json({ success: true, solved: solved, unsolved: unsolved });
                    }
                });
            }
        });

    });

CLRouter.route('/getunits')
    .post((req, res, next) => {
        let sql = `SELECT * FROM units WHERE created_by = ${req.body.client_id}`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });

CLRouter.route('/createunits')
    .post((req, res, next) => {
        let sql = `INSERT INTO units (unit_id , unit_number , name , address , created_by)
    VALUES (NULL , ${req.body.unit_number} , '${req.body.unit_name}' , '${req.body.unit_address}' , ${req.body.created_by})`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, msg: "unit inserted successfully" });
            }
        });
    });

CLRouter.route('/updateunits')
    .put((req, res, next) => {
        let sql = `UPDATE units SET unit_number = ${req.body.unit_number} , name = '${req.body.unit_name}' , address = '${req.body.unit_address}' WHERE unit_id = ${req.body.unit_id}`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, msg: "unit updated successfully" });
            }
        });
    });

CLRouter.route('/deleteunits')
    .delete((req, res, next) => {
        let sql = `DELETE FROM units WHERE unit_id = ${req.body.unit_id}`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, msg: "unit deleted successfully" });
            }
        });
    });
module.exports = CLRouter;