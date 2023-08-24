var express = require('express');
var MsgRouter = express.Router();
var bodyParser = require('body-parser');
var db = require('../sql/connect');
MsgRouter.use(bodyParser.json());

MsgRouter.route('/sendticketmessage')
    .post((req, res, next) => {
        let sql = `INSERT INTO ticketmessages (id , ticket_id , sender_id , content , attachment) 
    VALUES  (NULL , ${req.body.ticket_id} , ${req.body.sender}   , '${req.body.content}' , '${req.body.attachment}')`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                let sql2 = `UPDATE tickets SET user_email = 0 , admin_email = 0 WHERE ticket_id = ${req.body.ticket_id}`;
                db.query(sql2, (err1, result) => {
                    if (err1) {
                        next(err1);
                    }
                    else {

                        res.json({ success: true, msg: "msg send successfully" });
                    }
                })
            }
        });
    });

MsgRouter.route('/getticketmessage')
    .put((req, res, next) => {
        let sql = `SELECT * , (SELECT name FROM users WHERE id = ticketmessages.sender_id AND role = 'super_admin') FROM ticketmessages WHERE ticket_id = ${req.body.ticket_id} ORDER BY timestamp ASC`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });

module.exports = MsgRouter;