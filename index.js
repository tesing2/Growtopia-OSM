const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.status(200).send('OK. Redirecting to https://www.growtopia1.com/');
  res.redirect('https://www.growtopia1.com/');
});

app.get('/cache/*', (req, res) => {
  const ip = req.params[0];
  res.redirect(`http://${ip}/cache/`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
