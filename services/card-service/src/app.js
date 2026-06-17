const express = require('express');
const cors = require('cors');
const authMiddleware = require('@moneyswift/middleware/auth.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Card Service' });
});

module.exports = app;