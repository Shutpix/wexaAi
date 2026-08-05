require('dotenv').config();
const app = require('./app');
const { verifyConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const isConnected = await verifyConnection();
  
  if (!isConnected) {
    console.error('Failed to start server: Database connection failed.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
