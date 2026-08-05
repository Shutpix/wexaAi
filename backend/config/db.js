const neo4j = require('neo4j-driver');
require('dotenv').config();

const { DB_URI, DB_USERNAME, DB_PASSWORD } = process.env;

let driver;

/**
 * Create (or return existing) Neo4j driver.
 * Connection pool is tuned for CognoDB cloud which closes idle connections.
 */
const initDriver = () => {
  if (!driver) {
    driver = neo4j.driver(
      DB_URI,
      neo4j.auth.basic(DB_USERNAME, DB_PASSWORD),
      {
        disableLosslessIntegers: true,
        // Re-use connections for max 5 min – prevents stale TCP sockets
        maxConnectionLifetime: 5 * 60 * 1000,
        // Don't hold idle connections longer than 1 min
        maxConnectionPoolSize: 10,
        connectionAcquisitionTimeout: 10_000,
        // Retry on transient failures (Neo4j built-in)
        maxTransactionRetryTime: 30_000,
      }
    );
  }
  return driver;
};

/**
 * Open a new session. Always call session.close() in a finally block.
 */
const getSession = () => {
  const drv = initDriver();
  return drv.session();
};

/**
 * Force-close the driver and clear the singleton.
 * Used when ECONNRESET is detected so the next call rebuilds cleanly.
 */
const closeDriver = async () => {
  if (driver) {
    try { await driver.close(); } catch (_) { /* ignore */ }
    driver = null;
  }
};

/**
 * Execute a Cypher query with automatic reconnection on ECONNRESET.
 *
 * @param {Function} fn  – async fn that receives a neo4j session and returns a result
 * @returns {Promise<*>} – whatever fn returns
 */
const runWithRetry = async (fn, retries = 2) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const session = getSession();
    try {
      const result = await fn(session);
      return result;
    } catch (err) {
      await session.close().catch(() => {});

      const isReset =
        err.code === 'ECONNRESET' ||
        (err.message && err.message.includes('ECONNRESET')) ||
        (err.message && err.message.includes('Failed to connect'));

      if (isReset && attempt < retries) {
        console.warn(`[DB] Connection reset detected – rebuilding driver (attempt ${attempt}/${retries})…`);
        await closeDriver(); // force fresh driver on next call
        continue;            // retry
      }

      throw err; // non-retryable or out of retries
    } finally {
      // Session is closed inside fn's finally block – nothing extra needed here
    }
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
  runWithRetry,
  verifyConnection,
};
