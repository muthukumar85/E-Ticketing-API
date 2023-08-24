var express = require('express');
var OTPRouter = express.Router();
const path = require('path');
var db = require('../sql/connect');
const util = require('util');
var bodyParser = require('body-parser');
OTPRouter.use(bodyParser.json());
const randomstring = require('randomstring');
const fs = require('fs');
const nodemailer = require('nodemailer');
var email = require('../sql/credentials');
var password = require('../sql/credentials');
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: email,
        pass: password,
    },
});

const readFile = util.promisify(fs.readFile);
const emailTemplatePath = path.join(__dirname, '../views/otp.html');

async function getCompiledTemplate(name) {
    try {
        const emailTemplate = await readFile(emailTemplatePath, 'utf8');
        return emailTemplate.replace('{{name}}', name);
    } catch (error) {
        console.error('Error reading email template:', error);
        throw error;
    }
}
const imageFile = fs.readFileSync('public/images/gtn.png');
OTPRouter.route('/generateotp')
    .post(async (req, res, next) => {
        const email = req.body.email;
        var otp = randomstring.generate({
            length: 6,
            charset: 'numeric',
        });
        let sqldelete = `DELETE FROM otp WHERE email = '${email}'`;

        let sql = `INSERT INTO otp (otp_id , otp_number , email) VALUES (NULL , ${otp} , '${email}')`;

        let sqlcheck = `SELECT * FROM users WHERE email = '${email}'`;
        db.query(sqlcheck, (errc, resultc) => {
            if (errc) {
                next(errc);
            } else {
                if (resultc.length > 0) {
                    db.query(sqldelete, (err1, result1) => {
                        if (err1) {
                            next(err1);
                        }
                        else {
                            db.query(sql, async (err, result) => {
                                if (err) {
                                    next(err);
                                }
                                else {
                                    const mailOptions = {
                                        from: 'muthukumar69743@gmail.com', // Replace with your Gmail email address
                                        to: email,
                                        subject: 'Verification Code : GTN Info Solution',
                                        html: await getCompiledTemplate(otp),
                                        attachments: [{
                                            filename: "gtn.png",
                                            content: imageFile,
                                            cid: '123'
                                        }]
                                    };

                                    transporter.sendMail(mailOptions, (error, info) => {
                                        if (error) {
                                            console.log(error);
                                            res.json({ success: false, message: 'Failed to send OTP' });
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                            res.json({ success: true, message: 'OTP sent successfully' });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    res.json({ success: false, msg: "Email not found" });
                }
            }
        });



    });

OTPRouter.route('/verifyotp')
    .post((req, res, next) => {
        let sql = `SELECT otp_number FROM otp WHERE email = '${req.body.email}'`;
        db.query(sql, (err, result) => {
            if (err) {
                next(err);
            }
            else {
                if (req.body.otp == result[0].otp_number) {
                    res.json({ success: true, msg: "OTP verified successfully" });
                }
                else {
                    res.json({ success: false, msg: "OTP incorrect - check again" });
                }
            }
        });
    });


module.exports = OTPRouter;