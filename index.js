const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk menangani request
app.use(express.json());

// Endpoint utama
app.get('/', (req, res) => {
  res.status(200).send('OK. Proxy is running.');
});

// Endpoint untuk proxy request ke Growtopia
app.get('/proxy', async (req, res) => {
  try {
    // URL tujuan (misalnya www.growtopia1.com)
    const targetUrl = 'https://www.growtopia1.com/';
    // Lakukan request ke server Growtopia
    const response = await axios.get(targetUrl);
    // Kirim response dari server Growtopia ke client
    res.status(response.status).send(response.data);
  } catch (error) {
    // Tangani error jika request gagal
    console.error('Error fetching data from Growtopia:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint untuk cache dengan format /:ip/cache/*
app.get('/:ip/cache/*', async (req, res) => {
  try {
    const ip = req.params.ip; // Ambil IP dari parameter
    const path = req.params[0]; // Ambil path setelah cache/
    // URL tujuan (misalnya http://<IP>/cache/<path>)
    const targetUrl = `http://${ip}/cache/${path}`;
    // Lakukan request ke server tujuan
    const response = await axios.get(targetUrl);
    // Kirim response ke client
    res.status(response.status).send(response.data);
  } catch (error) {
    // Tangani error jika request gagal
    console.error('Error fetching data from cache server:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
