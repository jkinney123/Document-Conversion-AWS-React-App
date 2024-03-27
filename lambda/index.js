const AWS = require('aws-sdk');
const { execSync } = require('child_process');
const fs = require('fs').promises; // Use .promises for async/await support
const s3 = new AWS.S3();

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    // Attempt to detect the installation directory of LibreOffice
    console.log('Checking for LibreOffice binaries:');
    try {
        const bins = execSync('ls -la /opt/libreoffice*/program/').toString();
        console.log(bins);
    } catch (error) {
        console.log('Error listing LibreOffice binaries:', error.toString());
    }

    const srcBucket = 'conversion-input';
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    const dstBucket = 'conversion-output';
    const dstKey = `converted-${srcKey}.pdf`;

    try {
        const inputData = await s3.getObject({ Bucket: srcBucket, Key: srcKey }).promise();
        const inputFilePath = `/tmp/${srcKey}`;
        const outputFilePath = `/tmp/${dstKey}`;

        await fs.writeFile(inputFilePath, inputData.Body);
        console.log('Converting document:', inputFilePath);

        // Use the detected path for LibreOffice's `soffice` command
        execSync(`/opt/libreoffice*/program/soffice --convert-to pdf --outdir /tmp ${inputFilePath}`, { stdio: 'inherit' });

        const outputFileData = await fs.readFile(outputFilePath);
        await s3.putObject({ Bucket: dstBucket, Key: dstKey, Body: outputFileData, ContentType: 'application/pdf' }).promise();
        console.log(`Successfully converted and uploaded to ${dstBucket}/${dstKey}`);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
