var express = require('express');
var router = express.Router();
var db = require('../sql/connect');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
const util = require('util');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const password = require('../sql/credentials');
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'muthukumar69743@gmail.com',
    pass: 'luzmdaztxvshajlp',
  },
});
const readFile = util.promisify(fs.readFile);
const emailTemplatePath1 = path.join(__dirname, '../views/userCreate.html');
const imageFile = fs.readFileSync('public/images/gtn.png');

router.use(bodyParser.json());
router.post('/signup', (req, res, next) => {
  const saltRounds = 10;
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
    } else {
      let sql = `INSERT INTO users(id, name, email, password_hash, mobile, role, created_by , created_by_role , company_id , unit_id) VALUES 
       (NULL,'${req.body.username}','${req.body.email}','${hash.toString()}','${req.body.mobile}','${req.body.role}','${req.body.created_by}' , '${req.body.created_by_role}' , ${req.body.company_id} , ${req.body.unit_id})`;

      db.query(sql, async (err, result) => {
        if (err) {
          next(err);
        } else {
          console.log(result);
          await SendEmailToUser(req.body.email, req.body.role, req.body.username, req.body.password, req.body.mobile)
          if (req.body.role == 'super_admin') {
            let sql1 = `INSERT INTO help_master (id , email , contact ) VALUES (NULL , '${req.body.email}' , '${req.body.mobile}')`;
            db.query(sql1, async (err1, result1) => {
              if (err) {
                next(err);
              }
              res.json({ success: true, msg: `${req.body.role} created successfully` });
            });
          } else {
            res.json({ success: true, msg: `${req.body.role} created successfully` });
          }
        }
      });
    }
  });
});
async function SendEmailToUser(email, role, username, password, mobile) {
  try {
    const mailOptions = {
      from: 'muthukumar69743@gmail.com', // Replace with your Gmail email address
      to: email,
      subject: 'Role Assigned : GTN Info Solution',
      html: await getTemplate(role, username, password, mobile),
      attachments: [{
        filename: "gtn.png",
        content: imageFile,
        cid: '123'
      }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);

      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (error) {
    console.error('Error reading email template:', error);
    throw error;
  }
}
async function getTemplate(role, username, password, mobile) {
  const emailTemplate = await readFile(emailTemplatePath1, 'utf8');
  // console.log(emailTemplate);
  return emailTemplate.replace('{{role}}', role).replace('{{user}}', username).replace('{{pass}}', password).replace('{{mobile}}', mobile);

}
// login



router.post('/login', (req, res, next) => {
  let sql = `SELECT * , (SELECT company_name FROM companies WHERE company_id = users.company_id) company_name , (SELECT name FROM units WHERE unit_id = users.unit_id) unit_name FROM users WHERE mobile = '${req.body.mobile}'`;
  db.query(sql, async (err, result) => {
    if (err) {
      next(err);
    }
    else {
      if (result.length === 0) {
        res.json({ success: false, msg: "user not found", role: null });
      } else {
        console.log(result)
        const hashedPassword = result[0].password_hash;
        bcrypt.compare(req.body.password, hashedPassword, (err, isMatch) => {
          if (err) {
            console.error('Error comparing passwords:', err);
            res.json({ success: false, msg: "password wrong", role: null });
          } else {
            if (isMatch) {
              result[0].password_hash = null;
              if (result[0].deactivate) {
                res.json({ success: false, msg: "Account Deactivated" });
              } else {
                res.json({ success: true, msg: "login successfull", result: result[0] });
              }

            } else {
              res.json({ success: false, msg: "password wrong", role: null });
            }
          }
        });
      }
    }
  })
});
router.put('/getmobile', (req, res, next) => {
  let sql = `SELECT * FROM users WHERE mobile = '${req.body.mobile}' OR email = '${req.body.email}'`;
  db.query(sql, (err, result) => {
    if (err) {
      next(err);
    } else {
      if (result.length > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    }
  });
});
router.post('/gettickets', (req, res, next) => {
  var solved;
  var unsolved;
  let sql1 = `SELECT * , (SELECT name FROM users WHERE id = tickets.user_id) username , (SELECT company_name FROM companies WHERE company_id = tickets.client_id) clientname FROM tickets WHERE user_id = ${req.body.user_id}  AND ticket_status = 'solved'`;
  let sql2 = `SELECT * , (SELECT name FROM users WHERE id = tickets.user_id) username ,  (SELECT company_name FROM companies WHERE company_id = tickets.client_id) clientname FROM tickets WHERE user_id = ${req.body.user_id} AND ticket_status = 'unsolved'`;
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

router.get('/getrandomunits', (req, res, next) => {
  let sql = `SELECT id FROM users WHERE role = 'client_admin'`;
  db.query(sql, (err, result) => {
    if (err) {
      next(err);
    }
    else {
      // console.log(result[Math.floor(Math.random() * result.length)].id);
      var randomid = result[Math.floor(Math.random() * result.length)].id;
      let sql2 = `SELECT * , (SELECT id FROM users WHERE id = ${randomid}) client_id , (SELECT name FROM users WHERE id = ${randomid}) client_name FROM units WHERE created_by = ${randomid}`;
      db.query(sql2, (err1, result1) => {
        if (err1) {
          next(err1);
        }
        else {
          res.json({ success: true, client_id: result1[0].client_id, client_name: result1[0].client_name, result: result1 });
        }
      });

    }
  });
});

router.put('/updateuser', (req, res, next) => {
  let sql = `UPDATE users SET name = '${req.body.username}' , email = '${req.body.email}' , mobile = '${req.body.mobile}' , role = '${req.body.role}' WHERE id = ${req.body.user_id}`;
  db.query(sql, (err, result) => {
    if (err) {
      next(err);
    }
    else {
      res.json({ success: true, msg: `${req.body.role} Updated Successfully` });
    }
  });
});

router.put('/changepassword', (req, res, next) => {
  const saltRounds = 10;
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
    } else {
      let sql = `UPDATE users SET password_hash = '${hash.toString()}' WHERE email = '${req.body.email}'`;
      db.query(sql, (err, result) => {
        if (err) {
          next(err);
        }
        else {
          res.json({ success: true, msg: 'Password Updated Successfully' });
        }
      });
    }

  });
})




module.exports = router;
