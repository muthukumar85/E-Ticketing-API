var express = require('express');
var TicketRouter = express.Router();
var bodyParser = require('body-parser');
var db = require('../sql/connect');


TicketRouter.use(bodyParser.json());
TicketRouter.route('/create')
    .post((req, res, next) => {
        console.log(req.body);

        let sql = `INSERT INTO tickets(ticket_id, user_id, client_id, ticket_status, ticket_state, subject, description, priority , type , units , attachment) 
        VALUES (NULL,${req.body.user_id},${req.body.client_id},'${req.body.status}','${req.body.state}','${req.body.subject}','${req.body.description}','${req.body.priority}','${req.body.type}' , '${req.body.units}' , '${req.body.attachment}')`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, msg: "ticket created successfully" });
            }
        });
    });
TicketRouter.route('/editticket')
    .put((req, res, next) => {
        var sql;
        if (req.body.isattach) {
            sql = `UPDATE tickets SET subject = '${req.body.subject}' , description = '${req.body.description}' , attachment = '${req.body.attachment}' WHERE ticket_id = ${req.body.id}`;
        }
        else {
            sql = `UPDATE tickets SET subject = '${req.body.subject}' , description = '${req.body.description}'  WHERE ticket_id = ${req.body.id}`;
        }
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, msg: 'Ticket Updated Successfully' });
            }
        });

    });
TicketRouter.route('/closeticket')
    .put((req, res, next) => {
        let sql = `UPDATE tickets SET ticket_status = 'solved' , ticket_state = 'closed' WHERE ticket_id = ${req.body.ticket_id}`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, msg: 'Ticket Closed Successfully' });
            }
        });
    });
module.exports = TicketRouter;