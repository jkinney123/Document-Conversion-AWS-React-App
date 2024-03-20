const express = require('express');
const app = express();
const port = process.env.PORT || 3001; // Use the environment's port if available, or default to 3001

app.get('/', (req, res) => {
    res.send('Hello, World! This is the Document Conversion App backend.');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
