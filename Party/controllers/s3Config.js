// s3Config.js
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.BUCKET_ACCESSKEY,
    secretAccessKey: process.env.BUCKET_SECRETACCESSKEY,
    region: process.env.BUCKET_REGION
});

export default s3;