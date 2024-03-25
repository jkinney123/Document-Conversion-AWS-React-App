const AWS = require('aws-sdk');
const { execSync } = require('child_process');
const fs = require('fs'); // Fixed fs issue
const s3 = new AWS.S3();

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    const libreOfficePath = '/tmp/instdir/program/soffice';
    if (!fs.existsSync(libreOfficePath)) {
        console.log('Unpacking LibreOffice...');
        execSync('tar -xvf /opt/lo.tar.br -C /tmp');
        console.log('LibreOffice unpacked.');
    }

    // Extract the bucket name and key for the uploaded file from the event
    const srcBucket = 'conversion-input'; // Directly specify the input bucket name
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

    // Define the destination bucket and the output key
    const dstBucket = 'conversion-output'; // Directly specify the output bucket name
    const dstKey = `converted-${srcKey}.pdf`;

    // Download the document from the input bucket
    try {
        const inputData = await s3.getObject({
            Bucket: srcBucket,
            Key: srcKey
        }).promise();

        // Temporary file paths for the input and output files in the Lambda /tmp directory
        const inputFilePath = `/tmp/${srcKey}`;
        const outputFilePath = `/tmp/${dstKey}`;

        // Write the downloaded file to a temporary file
        await fs.promises.writeFile(inputFilePath, inputData.Body);


        const { execSync } = require('child_process');
        console.log('Checking /opt contents:', execSync('ls -la /opt').toString());


        // Convert the document to PDF using LibreOffice
        execSync(`/opt/libreoffice/program/soffice --convert-to pdf --outdir /tmp ${inputFilePath}`);

        // Read the converted file
        const outputFileData = await fs.promises.readFile(outputFilePath);

        // Upload the converted file to the output bucket
        await s3.putObject({
            Bucket: dstBucket,
            Key: dstKey,
            Body: outputFileData,
            ContentType: 'application/pdf'
        }).promise();

        console.log(`Successfully converted and uploaded to ${dstBucket}/${dstKey}`);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
