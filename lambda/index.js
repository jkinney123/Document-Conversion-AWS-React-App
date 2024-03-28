const AWS = require('aws-sdk');
const { convertTo, canBeConvertedToPDF } = require('@shelf/aws-lambda-libreoffice');
const fs = require('fs').promises; // Use .promises for async/await support
const s3 = new AWS.S3();

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    const srcBucket = 'conversion-input';
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    const dstBucket = 'conversion-output';
    const dstKey = `converted-${srcKey}.pdf`;

    try {
        const inputData = await s3.getObject({ Bucket: srcBucket, Key: srcKey }).promise();
        const inputFilePath = `/tmp/${srcKey}`;
        await fs.writeFile(inputFilePath, inputData.Body);

        console.log('Converting document:', inputFilePath);

        if (!canBeConvertedToPDF(inputFilePath)) {
            throw new Error('Cannot convert this file to PDF');
        }

        const outputFilePath = await convertTo(inputFilePath, 'pdf'); // returns path to converted document
        const outputFileData = await fs.readFile(outputFilePath);

        await s3.putObject({ Bucket: dstBucket, Key: dstKey, Body: outputFileData, ContentType: 'application/pdf' }).promise();
        console.log(`Successfully converted and uploaded to ${dstBucket}/${dstKey}`);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
