const express = require('express');
const jobController = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Debug route - get raw data from MongoDB collection
router.get('/debug', async (req, res) => {
  try {
    // Get the MongoDB connection directly
    const mongoose = require('mongoose');
    const conn = mongoose.connection;
    
    if (!conn || !conn.db) {
      return res.status(500).json({
        status: 'error',
        message: 'No active MongoDB connection'
      });
    }
    
    console.log('Attempting to access internshala_jobs.jobs collection directly');
    // Access the raw collection
    const collection = conn.db.collection('jobs');
    // Get a few documents to examine
    const docs = await collection.find().limit(3).toArray();
    
    console.log('Sample document keys:', docs.length > 0 ? Object.keys(docs[0]) : 'No documents found');
    
    return res.status(200).json({
      status: 'success',
      dbName: conn.db.databaseName,
      collectionName: 'jobs',
      sampleCount: docs.length,
      sampleData: docs
    });
  } catch (error) {
    console.error('Debug route error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Public routes - anyone can view jobs
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJob);

// Protected routes - admin only
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', jobController.createJob);
router.patch('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router; 