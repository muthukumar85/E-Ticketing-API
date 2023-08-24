var express = require('express');
var SPRouter = express.Router();
var bodyParser = require('body-parser');
var db = require('../sql/connect');
SPRouter.use(bodyParser.json());

SPRouter.route('/getgraph')
    .post((req, res, next) => {
        let sql = `SELECT SUM(CASE WHEN ticket_status = 'solved' THEN 1 ELSE 0 END) AS solved,
        SUM(CASE WHEN ticket_status = 'unsolved' THEN 1 ELSE 0 END) AS unsolved
      FROM
        tickets `;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });

SPRouter.route('/getclientwisedashboard')
    .post((req, res, next) => {
        // let sql = `SELECT  users.name , users.id , SUM(CASE WHEN tickets.ticket_state = 'open' THEN 1 ELSE 0 END) AS open , SUM(CASE WHEN tickets.ticket_state = 'closed' THEN 1 ELSE 0 END) AS closed FROM tickets INNER JOIN users ON client_id = users.id WHERE client_id IN (SELECT id FROM users WHERE created_by = ${req.body.created_id} AND role = 'client_admin') GROUP BY  client_id`;
        let sql = `SELECT
       client_id, (SELECT company_name FROM companies WHERE company_id = tickets.client_id) name,
       CASE WHEN ticket_state = 'open' THEN created_time END AS opened_date,
       CASE WHEN ticket_state = 'closed' THEN created_time END AS closed_date
   FROM
       tickets
   WHERE
       ticket_state IN ('open', 'closed') 
   GROUP BY
       ticket_id
   ORDER BY
       client_id , created_time`;

        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });

SPRouter.route('/getreports')
    .post((req, res, next) => {
        let sql = `SELECT  * , (@serial := @serial + 1) AS serial_number , (SELECT name FROM users WHERE id = tickets.user_id) username , (SELECT company_name FROM companies WHERE company_id = tickets.client_id) clientname FROM tickets , (SELECT @serial := 0) AS init `;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });

SPRouter.route('/getclients')
    .post((req, res, next) => {
        let sql = `SELECT name , id , email , mobile   FROM users WHERE  role='client_admin'`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });

SPRouter.route('/getusers')
    .post((req, res, next) => {
        let sql = `SELECT name , id , email , mobile , role , deactivate  FROM users WHERE role='client_admin' OR role='super_admin' `;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });

SPRouter.route('/gettickets')
    .post((req, res, next) => {
        var solved;
        var unsolved;
        let sql1 = `SELECT  * , (@serial := @serial + 1) AS serial_number , (SELECT name FROM users WHERE id = tickets.user_id) username , (SELECT company_name FROM companies WHERE company_id = tickets.client_id) clientname FROM tickets, (SELECT @serial := 0) AS init WHERE ticket_status = 'solved'`;
        let sql2 = `SELECT  * , (@serial := @serial + 1) AS serial_number , (SELECT name FROM users WHERE id = tickets.user_id) username ,  (SELECT company_name FROM companies WHERE company_id = tickets.client_id) clientname FROM tickets, (SELECT @serial := 0) AS init WHERE ticket_status = 'unsolved'`;
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


SPRouter.route('/postsolution')
    .put((req, res, next) => {
        let sql = `UPDATE tickets SET solution = '${req.body.solution}', ticket_status = 'solved' , solution_attachment = '${req.body.attachment}' WHERE ticket_id = ${req.body.ticket_id}`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, msg: "solution updated successfully" });
            }
        })
    });

SPRouter.route('/deactivate')
    .delete((req, res, next) => {
        let sql = `UPDATE users SET deactivate = ${req.body.deactivate} WHERE id = ${req.body.user_id}`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, msg: "User Deactivated " });
            }
        })
    });
module.exports = SPRouter;