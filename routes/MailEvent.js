const cron = require('node-cron');
const db = require('../sql/connect');
const pool = require('../sql/connect');
const util = require('util');
const queryAsync = util.promisify(pool.query).bind(pool);
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
var email = require('../sql/credentials');
var password = require('../sql/credentials');
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'muthukumar69743@gmail.com',
        pass: 'luzmdaztxvshajlp',
    },
});
const readFile = util.promisify(fs.readFile);
const emailTemplatePath1 = path.join(__dirname, '../views/userWarn.html');
const emailTemplatePath2 = path.join(__dirname, '../views/userClose.html');
const emailTemplatePath3 = path.join(__dirname, '../views/adminWarn.html');


const imageFile = fs.readFileSync('public/images/gtn.png');

cron.schedule('* * * * *', async () => {
    // Get messages from the database that meet the condition (created time is more than 2 hours from the current time)
    const eligibleMessages = await getEligibleMessagesFromDatabase();
    console.log('runned');
    // Process eligible messages by calling the Node.js API for each message
    // eligibleMessages.forEach((message) => {
    //   axios.post('http://localhost:3000/api/process-message', message)
    //     .then((response) => {
    //       console.log(response.data.message);
    //     })
    //     .catch((error) => {
    //       console.error('Error processing message:', error.message);
    //     });
    // });
});

async function getEligibleMessagesFromDatabase() {
    // Your database query logic to get messages with created time more than 2 hours from the current time
    // Example: SELECT * FROM messages WHERE created_time < (NOW() - INTERVAL 2 HOUR);


    let sql = `SELECT ticket_id , ABS(TIMESTAMPDIFF(SECOND, created_time, NOW())) seconds ,(SELECT email FROM users WHERE id = tickets.user_id) mail_user , (SELECT email FROM users WHERE id = (SELECT created_by FROM users WHERE id = tickets.client_id)) mail_admin ,
      subject , user_email , admin_email FROM tickets WHERE ticket_state = 'open'`;

    var result = await queryAsync(sql);

    await result.forEach(async element => {
        // console.log(element);
        let gettimesql = `SELECT * , ABS(TIMESTAMPDIFF(SECOND, timestamp, NOW())) seconds FROM ticketmessages WHERE ticket_id = ${element.ticket_id} ORDER BY ABS(TIMESTAMPDIFF(SECOND, timestamp, NOW())) LIMIT 1;`;
        var data = await queryAsync(gettimesql);
        if (data.length > 0) {
            // console.log(data);
            let getuserrole = `SELECT role , email FROM users WHERE id = ${data[0].sender_id}`;
            var role = await queryAsync(getuserrole);
            console.log(role);
            if (role[0].role == 'super_admin') {
                if (data[0].seconds > (3600 * 24) && element.user_email == 0) {
                    await SendEmailToUser(element.mail_user, element.subject);
                    let updateusermail = `UPDATE tickets SET user_email = 1 WHERE ticket_id = ${element.ticket_id}`;
                    await queryAsync(updateusermail);
                }
                else {
                    if (data[0].seconds > (3600 * 26) && element.user_email == 1) {
                        await SendEmailToCloseTicket(element.mail_user, element.subject);
                        let closeticket = `UPDATE tickets SET ticket_status = 'solved' , ticket_state = 'closed' WHERE ticket_id = ${element.ticket_id}`;
                        await queryAsync(closeticket);
                    }
                }
            }
            else {
                if (data[0].seconds > (3600 * 2) && element.admin_email == 0) {
                    await SendEmailToAdmin(element.mail_admin, element.subject);
                    let updateusermail = `UPDATE tickets SET admin_email = 1 WHERE ticket_id = ${element.ticket_id}`;
                    await queryAsync(updateusermail);
                }
            }
        }
        else {
            if (element.admin_email == 0 && element[0].seconds > (3600 * 2)) {
                await SendEmailToAdmin(element.mail_admin, element.subject);
                let updateusermail = `UPDATE tickets SET admin_email = 1 WHERE ticket_id = ${element.ticket_id}`;
                await queryAsync(updateusermail);
            }
        }

    });
}

async function SendEmailToUser(email, subject) {
    try {
        const mailOptions = {
            from: 'muthukumar69743@gmail.com', // Replace with your Gmail email address
            to: email,
            subject: 'Response Validation : GTN Info Solution',
            html: await getTemplate(subject),
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

async function SendEmailToCloseTicket(email, subject) {
    try {
        const mailOptions = {
            from: 'muthukumar69743@gmail.com', // Replace with your Gmail email address
            to: email,
            subject: 'Ticket Closed : GTN Info Solution',
            html: await getTemplateClose(subject),
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

async function SendEmailToAdmin(email, subject) {
    try {
        const mailOptions = {
            from: 'muthukumar69743@gmail.com', // Replace with your Gmail email address
            to: email,
            subject: 'Request Validation : GTN Info Solution',
            html: await getTemplateAdmin(subject),
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
async function getTemplate(subject) {
    const emailTemplate = await readFile(emailTemplatePath1, 'utf8');
    return emailTemplate.replace('{{subject}}', subject);
}

async function getTemplateClose(subject) {
    const emailTemplate = await readFile(emailTemplatePath2, 'utf8');
    return emailTemplate.replace('{{subject}}', subject);
}

async function getTemplateAdmin(subject) {
    const emailTemplate = await readFile(emailTemplatePath3, 'utf8');
    return emailTemplate.replace('{{subject}}', subject);
}

module.exports = cron;