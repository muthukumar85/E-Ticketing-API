var express = require('express');
var CompanyRouter = express.Router();
var bodyParser = require('body-parser');
var db = require('../sql/connect');


CompanyRouter.use(bodyParser.json());

CompanyRouter.route('/getcompany')
    .put((req, res, next) => {
        let sql = `SELECT * FROM companies WHERE created_by = ${req.body.id}`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });

CompanyRouter.route('/postcompany')
    .post((req, res, next) => {
        let sql = `INSERT INTO companies (company_id , company_name , created_by) VALUES ( NULL , '${req.body.name}' , ${req.body.created_id})`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, msg: 'Company created successfully' });
            }
        });
    });

CompanyRouter.route('/putcompany')
    .put((req, res, next) => {
        let sql = `UPDATE companies SET company_name = '${req.body.name}' WHERE company_id = ${req.body.id}`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                res.json({ success: true, msg: 'Company updated successfully' });
            }
        });
    });

module.exports = CompanyRouter;