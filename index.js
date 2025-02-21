const express = require('express');
const axios = require('axios');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');

const port = process.env.PORT || 3000;

// Middleware untuk kompresi response
app.use(compression({
    level: 5,
    threshold: 0,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Set view engine ke EJS
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

// Middleware untuk mengizinkan CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
    next();
});

// Middleware untuk parsing body request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Tangani request untuk favicon.ico
app.all('/favicon.ico', function(req, res) {
    res.status(204).end();
});

// Endpoint untuk registrasi player
app.all('/player/register', function(req, res) {
    res.send("Coming soon...");
});

// Endpoint untuk login dashboard player
app.all('/player/login/dashboard', function (req, res) {
    const tData = {};
    try {
        const uData = JSON.stringify(req.body).split('"')[1].split('\\n'); 
        const uName = uData[0].split('|'); 
        const uPass = uData[1].split('|');
        for (let i = 0; i < uData.length - 1; i++) { 
            const d = uData[i].split('|'); 
            tData[d[0]] = d[1]; 
        }
        if (uName[1] && uPass[1]) { 
            res.redirect('/player/growid/login/validate'); 
        }
    } catch (why) { 
        console.log(`Warning: ${why}`); 
    }

    res.render(__dirname + '/public/html/dashboard.ejs', {data: tData});
});

// Endpoint untuk validasi login GrowID
app.all('/player/growid/login/validate', (req, res) => {
    const _token = req.body._token;
    const growId = req.body.growId;
    const password = req.body.password;

    const token = Buffer.from(
        `_token=${_token}&growId=${growId}&password=${password}`,
    ).toString('base64');
   
    res.send(
        `{"status":"success","message":"Account Validated.","token":"${token}","url":"","accountType":"growtopia"}`,
    );
});

// Endpoint untuk memeriksa token
app.all('/player/growid/checktoken', (req, res) => {
    const { refreshToken } = req.body;
    try {
        const decoded = Buffer.from(refreshToken, 'base64').toString('utf-8');
        if (typeof decoded !== 'string' && !decoded.startsWith('growId=') && !decoded.includes('passwords=')) {
            return res.render(__dirname + '/public/html/dashboard.ejs');
        }
        res.json({
            status: 'success',
            message: 'Account Validated.',
            token: refreshToken,
            url: '',
            accountType: 'growtopia',
        });
    } catch (error) {
        console.log("Redirecting to player login dashboard");
        res.render(__dirname + '/public/html/dashboard.ejs');
    }
});

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
