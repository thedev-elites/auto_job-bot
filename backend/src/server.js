const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed patterns
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [
          'https://careerwise.ai', 
          'https://www.careerwise.ai', 
          'https://careersync-mvp-frontend.onrender.com', 
          'https://careersync-mvp-final-frontend.onrender.com',
          // Include any other production domains here
        ]
      : [
          'http://localhost:3000', 
          'http://localhost:5173', 
          'http://localhost:5174', 
          'http://127.0.0.1:5173', 
          'http://127.0.0.1:5174', 
          'http://127.0.0.1:3000', 
          'http://localhost:8080',
          'http://127.0.0.1:8080'
        ];
    
    // Allow all Render domains
    if (origin && origin.includes('.onrender.com')) {
      console.log('Allowing CORS for Render domain:', origin);
      return callback(null, true);
    }
    
    // Check against specific allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Allowing CORS for allowed origin:', origin);
      return callback(null, true);
    }
    
    console.log('CORS blocked for origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Import routes
const jobRoutes = require('./routes/jobRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const userRoutes = require('./routes/userRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to CareerWise API',
    status: 'Server is running',
    docs: 'API documentation available at /api/docs'
  });
});

// Database connection status route
app.get('/api/status', async (req, res) => {
  try {
    const conn = await connectDB();
    if (conn) {
      res.json({
        status: 'success',
        message: 'Connected to MongoDB',
        database: conn.connection.host
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to connect to MongoDB. Please check your MongoDB Atlas configuration and ensure your IP is whitelisted.'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Connect to database and mount routes when connection is successful
(async () => {
  const conn = await connectDB();
  
  // Only mount API routes if database connection was successful
  if (conn) {
    // Mount routes
    app.use('/api/jobs', jobRoutes);
    app.use('/api/resumes', resumeRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/applications', applicationRoutes);
    
    console.log('All API routes mounted successfully');
  } else {
    // Setup limited routes for error recovery
    app.use('/api/jobs', (req, res) => {
      res.status(503).json({
        status: 'error',
        message: 'Database connection failed. Please check server logs.'
      });
    });
    
    app.use('/api/resumes', (req, res) => {
      res.status(503).json({
        status: 'error',
        message: 'Database connection failed. Please check server logs.'
      });
    });
    
    app.use('/api/users', (req, res) => {
      res.status(503).json({
        status: 'error',
        message: 'Database connection failed. Please check server logs.'
      });
    });
    
    app.use('/api/applications', (req, res) => {
      res.status(503).json({
        status: 'error',
        message: 'Database connection failed. Please check server logs.'
      });
    });
    
    console.warn('API routes mounted in limited mode due to database connection failure');
  }
})();

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 