const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.json({ message: 'Hello, this is a simple Node.js API!' });
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


