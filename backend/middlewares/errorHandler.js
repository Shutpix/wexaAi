const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle Neo4j errors
  if (err.name === 'Neo4jError') {
    return res.status(500).json({
      message: 'Database error',
      details: err.message
    });
  }

  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
