const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
    console.log(`Card Service listening on port ${PORT}`);
});