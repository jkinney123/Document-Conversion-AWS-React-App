const AWS = require('aws-sdk');
const { convertTo, canBeConvertedToPDF } = require('@shelf/aws-lambda-libreoffice');
const fs = require('fs').promises;
const path = require('path'); // Ensure path is correctly used for file operations
const s3 = new AWS.S3();

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    const srcBucket = event.Records[0].s3.bucket.name;
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    const dstBucket = 'conversion-output';
    // The utility seems to replace the original extension with .pdf directly
    const dstKey = srcKey.replace(/\.[^/.]+$/, "") + ".pdf";

    const inputFilePath = `/tmp/${srcKey}`;
    const outputFilePath = `/tmp/${dstKey}`; // Adjusted to match the utility's output naming convention

    try {
        const inputData = await s3.getObject({ Bucket: srcBucket, Key: srcKey }).promise();
        await fs.writeFile(inputFilePath, inputData.Body);

        console.log('Converting document:', inputFilePath);

        // No need to check the file extension here as it's being handled in the utility
        await convertTo(srcKey, 'pdf'); // Adjusted to pass only the filename

        // Read the converted file directly without appending 'converted-' prefix
        const outputFileData = await fs.readFile(outputFilePath);
        await s3.putObject({ Bucket: dstBucket, Key: dstKey, Body: outputFileData, ContentType: 'application/pdf' }).promise();

        console.log(`Successfully converted and uploaded to ${dstBucket}/${dstKey}`);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
