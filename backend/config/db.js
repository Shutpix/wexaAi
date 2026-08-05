const neo4j = require('neo4j-driver');
require('dotenv').config();

const { DB_URI, DB_USERNAME, DB_PASSWORD } = process.env;

let driver;

const initDriver = () => {
  if (!driver) {
    driver = neo4j.driver(DB_URI, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD), {
      disableLosslessIntegers: true, // Converts neo4j integers to native JS numbers (safe for smaller numbers)
    });
  }
  return driver;
};

const getSession = () => {
  const drv = initDriver();
  return drv.session();
};

const closeDriver = async () => {
  if (driver) {
    await driver.close();
    driver = null;
  }
};

const verifyConnection = async () => {
  try {
    const drv = initDriver();
    await drv.verifyConnectivity();
    console.log('Successfully connected to CognoDB');
    return true;
  } catch (error) {
    console.error('Failed to connect to CognoDB', error);
    return false;
  }
};

module.exports = {
  initDriver,
  getSession,
  closeDriver,
  verifyConnection
};
