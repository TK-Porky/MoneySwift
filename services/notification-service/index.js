const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
  console.log(`Notification Service listening on port ${PORT}`);
});