var express = require('express');
var S3Router = express.Router();
var multer = require('multer');
var bodyParser = require('body-parser');
var db = require('../sql/connect');

var AWS = require('../aws');
S3Router.use(bodyParser.json());
S3Router.use(multer().any());
var s3 = new AWS.S3();

const fs = require('fs');

S3Router.route('/uploadsolution')
    .post(async (req, res, next) => {
        console.log(req.files);
        const params = {
            Bucket: 'e-ticket-348/solution-attachments',
            Key: req.files[0].originalname,
            Body: req.files[0].buffer,
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
    });

S3Router.route('/uploadticket')
    .post(async (req, res, next) => {
        console.log(req.files);
        const params = {
            Bucket: 'e-ticket-348/ticket-attachments',
            Key: req.files[0].originalname,
            Body: req.files[0].buffer,
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
    });

module.exports = S3Router;