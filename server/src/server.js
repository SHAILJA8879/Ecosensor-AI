const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(` EcoSense AI API Server Running        `);
  console.log(` Port: ${PORT}                          `);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'} `);
  console.log(`========================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
