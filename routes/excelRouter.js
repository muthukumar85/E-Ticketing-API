var express = require('express');
var ExcelRouter = express.Router();
var bodyParser = require('body-parser');
var db = require('../sql/connect');
var pool = require('../sql/connect');
const Excel = require('exceljs');
const fs = require('fs');
var AWS = require('../aws');
var s3 = new AWS.S3();
const util = require('util');
ExcelRouter.use(bodyParser.json());

ExcelRouter.route('/createreportexcel')
    .post((req, res, next) => {
        console.log(req.body.name);
        const workbook = new Excel.Workbook();
        const filePath = 'public/Frame.xlsx';
        const modifiedFilePath = 'public/Framecopy.xlsx';
        const name = req.body.name;
        var data = req.body.data;
        const queryAsync = util.promisify(pool.query).bind(pool);
        workbook.xlsx.readFile(filePath)
            .then(async () => {
                // Assuming there is only one worksheet in the workbook
                const worksheet = workbook.getWorksheet(1);
                var row = 3;
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    var sql = `SELECT * , (@serial := @serial + 1) AS serial_number FROM ticketmessages  ,(SELECT @serial := 0) AS init WHERE ticket_id = ${element.ticket_id} ORDER BY timestamp ASC`;
                    worksheet.getCell(`A${row}`).value = element.serial_number;
                    worksheet.getCell(`B${row}`).value = element.username;
                    worksheet.getCell(`C${row}`).value = element.clientname;
                    worksheet.getCell(`D${row}`).value = element.ticket_status;
                    worksheet.getCell(`E${row}`).value = element.ticket_state;
                    worksheet.getCell(`F${row}`).value = element.subject;
                    worksheet.getCell(`G${row}`).value = element.description;
                    worksheet.getCell(`H${row}`).value = element.attachment;
                    worksheet.getCell(`I${row}`).value = element.units;
                    worksheet.getCell(`J${row}`).value = element.priority;
                    worksheet.getCell(`K${row}`).value = element.type;
                    worksheet.getCell(`L${row}`).value = element.created_time;
                    console.log(sql);
                    try {
                        // Perform a SELECT query
                        const result = await queryAsync(sql);

                        // Process the results
                        console.log('Data from the database:', result);

                        // You can further process the data or return it, etc.
                        for (let secondindex = 0; secondindex < result.length; secondindex++) {
                            const secondelement = result[secondindex];
                            console.log(result[secondindex]);
                            worksheet.getCell(`M${row}`).value = secondelement.serial_number;
                            worksheet.getCell(`N${row}`).value = (secondelement.sender_id == element.user_id) ? element.username : 'SuperAdmin';
                            worksheet.getCell(`O${row}`).value = secondelement.content;
                            worksheet.getCell(`P${row}`).value = secondelement.attachment;
                            worksheet.getCell(`Q${row}`).value = secondelement.timestamp;
                            row += 1;
                        }
                    } catch (error) {
                        console.error('Error querying the database:', error);
                        throw error;
                    }

                    row += 1;
                }

                // Save the modified data to a new Excel file

                // Write the modified workbook directly to the response

                return workbook.xlsx.writeFile(modifiedFilePath);
            })
            .then(() => {
                // Read the modified file to send it back to the client
                fs.readFile(modifiedFilePath, async (err, data) => {
                    if (err) {
                        console.error('Error reading the modified Excel file:', err);
                        return;
                    }
                    let str = req.body.name;
                    console.log(name);
                    const params = {
                        Bucket: 'e-ticket-348/excelfiles',
                        Key: `${name}.xlsx`,
                        Body: data,
                        ACL: 'public-read'
                    }
                    try {
                        const result = await s3.upload(params).promise();
                        console.log('File uploaded to S3:', result.Location);
                        res.json({ message: 'File uploaded successfully', path: result.Location });
                    } catch (err) {
                        console.error('Error uploading file to S3:', err);
                        res.status(500).json({ error: 'Failed to upload file' });
                    }
                    // Send the data back to the client (e.g., through an HTTP response)
                    // Ensure you set the appropriate headers in your response to indicate that it's an Excel file.
                    // For example, if using Express:
                });
            })
            .catch((error) => {
                console.error('Error processing the Excel file:', error);
            });

    });

ExcelRouter.route('/deleteexcel')
    .delete((req, res, next) => {
        const name = req.body.name;
        console.log(name);
        const params = {
            Bucket: 'e-ticket-348/excelfiles',
            Key: `${name}`
        }
        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.error('Error deleting the file:', err);
            } else {
                console.log('File deleted successfully');
                res.end();
            }
        });
    });

module.exports = ExcelRouter;