const Job = require('../models/Job');
const { AppError } = require('../utils/errorHandler');
const mongoose = require('mongoose');

// Helper function to calculate job completeness score
const calculateCompletenessScore = (job) => {
  let score = 0;
  // Check for essential fields - each complete field adds points
  if (job['Job Title'] && job['Job Title'].length > 0 && job['Job Title'] !== 'N/A') score += 15;
  if (job['Company Name'] && job['Company Name'].length > 0 && job['Company Name'] !== 'N/A') score += 15;
  if (job['Location'] && job['Location'].length > 0 && job['Location'] !== 'N/A') score += 10;
  if (job['Salary'] && job['Salary'].length > 0 && job['Salary'] !== 'N/A') score += 10;
  if (job['Job Type'] && job['Job Type'].length > 0 && job['Job Type'] !== 'N/A') score += 8;
  if (job['Experience Required'] && job['Experience Required'].length > 0 && job['Experience Required'] !== 'N/A') score += 8;
  if (job['Company Logo'] && job['Company Logo'].length > 0) score += 5;
  
  // Detailed info adds significant points
  const detailedInfo = job.detailed_info || {};
  const detailedSections = detailedInfo.detailed_sections || {};
  
  if (detailedSections['About the job'] && detailedSections['About the job'].length > 20) score += 15;
  if (detailedSections['Skill(s) required'] && detailedSections['Skill(s) required'].length > 5) score += 15;
  
  return score;
};

// Helper function to check if a job has N/A or missing values
const hasNAValues = (job) => {
  // Check if any major field is N/A or empty
  if (!job['Job Title'] || job['Job Title'] === 'N/A' || job['Job Title'] === '') return true;
  if (!job['Company Name'] || job['Company Name'] === 'N/A' || job['Company Name'] === '') return true;
  if (!job['Location'] || job['Location'] === 'N/A' || job['Location'] === '') return true;
  if (!job['Experience Required'] || job['Experience Required'] === 'N/A' || job['Experience Required'] === '') return true;
  
  // Check if description is missing
  const detailedInfo = job.detailed_info || {};
  const detailedSections = detailedInfo.detailed_sections || {};
  if (!detailedSections['About the job']) return true;
  
  return false;
};

// Helper function to determine job quality tier
// Returns: 1 = Salary + Complete, 2 = Complete without salary, 3 = Incomplete
const getJobTier = (job) => {
  // Check if job has actual salary info (highest priority)
  const hasSalary = job['Salary'] && 
                   job['Salary'] !== 'N/A' && 
                   job['Salary'] !== '' && 
                   !job['Salary'].includes('Competitive') &&
                   job['Salary'].match(/[₹$€£]/); // Must contain a currency symbol
  
  // Check other major fields
  const hasTitle = job['Job Title'] && job['Job Title'] !== 'N/A' && job['Job Title'] !== '';
  const hasCompany = job['Company Name'] && job['Company Name'] !== 'N/A' && job['Company Name'] !== '';
  const hasLocation = job['Location'] && job['Location'] !== 'N/A' && job['Location'] !== '';
  const hasExperience = job['Experience Required'] && job['Experience Required'] !== 'N/A' && job['Experience Required'] !== '';
  
  // Check for description
  const detailedInfo = job.detailed_info || {};
  const detailedSections = detailedInfo.detailed_sections || {};
  const hasDescription = detailedSections['About the job'] && detailedSections['About the job'].length > 10;
  
  // Tier 1: Has actual salary amount and is otherwise complete
  if (hasSalary && hasTitle && hasCompany && hasLocation) {
    return 1;
  }
  
  // Tier 2: Has "Competitive salary" or no salary but otherwise complete
  if (hasTitle && hasCompany && hasLocation && (hasExperience || hasDescription)) {
    return 2;
  }
  
  // Tier 3: Incomplete
  return 3;
};

// Get all jobs
exports.getAllJobs = async (req, res, next) => {
  try {
    console.log('Fetching all jobs from internshala_jobs.jobs collection');
    
    // Direct MongoDB access for better debugging
    const conn = mongoose.connection;
    if (!conn || !conn.db) {
      return next(new AppError('No active MongoDB connection', 500));
    }
    
    // Get the raw collection
    const collection = conn.db.collection('jobs');
    console.log(`Using collection: ${collection.namespace}`);
    
    // Count documents for debugging
    const count = await collection.countDocuments();
    console.log(`Collection contains ${count} documents`);
    
    // Build query object from request query parameters
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    console.log('Query filters:', queryObj);

    // Convert query string to MongoDB query
    let query = {};
    if (Object.keys(queryObj).length > 0) {
      // Handle search by job title
      if (queryObj.title) {
        query['Job Title'] = { $regex: queryObj.title, $options: 'i' };
      }
      // Handle search by company
      if (queryObj.company) {
        query['Company Name'] = { $regex: queryObj.company, $options: 'i' };
      }
      // Handle search by location
      if (queryObj.location) {
        query['Location'] = { $regex: queryObj.location, $options: 'i' };
      }
      // Handle job type filtering
      if (queryObj.type) {
        query['Job Type'] = { $regex: queryObj.type, $options: 'i' };
      }
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    console.log(`Pagination: page ${page}, limit ${limit}, skip ${skip}`);
    
    // Sort options
    let sortOption = { last_updated: -1 }; // Default sort by latest
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') 
        ? req.query.sort.substring(1) 
        : req.query.sort;
      const sortDirection = req.query.sort.startsWith('-') ? -1 : 1;
      
      // Map frontend sort fields to MongoDB document fields
      const sortFieldMap = {
        'title': 'Job Title',
        'company': 'Company Name',
        'location': 'Location',
        'postedDate': 'last_updated'
      };
      
      const mongoField = sortFieldMap[sortField] || sortField;
      sortOption = { [mongoField]: sortDirection };
    }
    
    console.log('Sort option:', sortOption);
    
    // First fetch all jobs and do a client-side filtering - we're going to organize
    // jobs into three tiers based on quality
    const allJobs = await collection.find(query).toArray();
    
    // Separate jobs into tiers
    const tier1Jobs = []; // Has salary and complete
    const tier2Jobs = []; // Complete but no salary
    const tier3Jobs = []; // Incomplete
    
    // Process all jobs
    allJobs.forEach(job => {
      // Transform job data
      const detailedInfo = job.detailed_info || {};
      const detailedSections = detailedInfo.detailed_sections || {};
      
      // Extract description and requirements
      const description = detailedSections['About the job'] || '';
      const requirements = detailedSections['Skill(s) required'] || '';
      
      // Calculate completeness score
      const completenessScore = calculateCompletenessScore(job);
      
      // Get job tier (1 = best, 3 = worst)
      const jobTier = getJobTier(job);
      
      const processedJob = {
        _id: job._id,
        id: job._id,
        'Job Title': job['Job Title'] || '',
        'Company Name': job['Company Name'] || '',
        'Location': job['Location'] || '',
        'Salary': job['Salary'] || '',
        'Job Type': job['Job Type'] || '',
        'Posted Time': job['Posted Time'] || '',
        'Job URL': job['Job URL'] || '',
        'Application Status': job['Application Status'] || '',
        'Company Logo': job['Company Logo'] || '',
        'Experience Required': job['Experience Required'] || '',
        
        // Add frontend-friendly fields
        title: job['Job Title'] || '',
        company: job['Company Name'] || '',
        location: job['Location'] || '',
        salary: job['Salary'] || '',
        type: job['Job Type'] || '',
        applicationStatus: job['Application Status'] || '',
        jobUrl: job['Job URL'] || '',
        companyLogo: job['Company Logo'] || '',
        experienceRequired: job['Experience Required'] || '',
        postedDate: job['Posted Time'] || '',
        description: description,
        requirements: requirements ? requirements.split('\n').filter(r => r.trim()) : [],
        detailed_info: detailedInfo,
        last_updated: job.last_updated || new Date(),
        completenessScore: completenessScore,
        tier: jobTier
      };
      
      // Add to appropriate tier
      if (jobTier === 1) {
        tier1Jobs.push(processedJob);
      } else if (jobTier === 2) {
        tier2Jobs.push(processedJob);
      } else {
        tier3Jobs.push(processedJob);
      }
    });
    
    // Sort jobs within each tier by score and date
    const sortJobsByScoreAndDate = (a, b) => {
      if (b.completenessScore !== a.completenessScore) {
        return b.completenessScore - a.completenessScore;
      }
      return new Date(b.last_updated) - new Date(a.last_updated);
    };
    
    tier1Jobs.sort(sortJobsByScoreAndDate);
    tier2Jobs.sort(sortJobsByScoreAndDate);
    tier3Jobs.sort(sortJobsByScoreAndDate);
    
    // Combine sorted arrays - tier1 first, then tier2, then tier3
    const processedJobs = [...tier1Jobs, ...tier2Jobs, ...tier3Jobs];
    
    // Apply pagination to the sorted results
    const paginatedJobs = processedJobs.slice(skip, skip + limit);
    
    console.log(`Found ${processedJobs.length} total jobs: ${tier1Jobs.length} with salary, ${tier2Jobs.length} complete without salary, ${tier3Jobs.length} incomplete`);
    console.log(`Returning ${paginatedJobs.length} jobs for page ${page}`);
    
    // Send response with total count for pagination
    res.status(200).json({
      status: 'success',
      results: paginatedJobs.length,
      totalCount: processedJobs.length,
      tier1Count: tier1Jobs.length,
      tier2Count: tier2Jobs.length,
      tier3Count: tier3Jobs.length,
      currentPage: page,
      totalPages: Math.ceil(processedJobs.length / limit),
      data: {
        jobs: paginatedJobs
      }
    });
  } catch (error) {
    console.error('Error in getAllJobs controller:', error);
    next(error);
  }
};

// Get job by ID
exports.getJob = async (req, res, next) => {
  try {
    console.log(`Fetching job with ID: ${req.params.id}`);
    
    // Direct MongoDB access
    const conn = mongoose.connection;
    if (!conn || !conn.db) {
      return next(new AppError('No active MongoDB connection', 500));
    }
    
    // Get the raw collection
    const collection = conn.db.collection('jobs');
    
    // Find by ID
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(req.params.id);
    } catch (e) {
      return next(new AppError('Invalid ID format', 400));
    }
    
    const job = await collection.findOne({ _id: objectId });

    if (!job) {
      console.log(`No job found with ID: ${req.params.id}`);
      return next(new AppError('No job found with that ID', 404));
    }

    console.log('Job found with fields:', Object.keys(job));
    
    // Get detailed info if available
    const detailedInfo = job.detailed_info || {};
    const detailedSections = detailedInfo.detailed_sections || {};
    
    // Extract description and requirements
    const description = detailedSections['About the job'] || '';
    const requirements = detailedSections['Skill(s) required'] || '';
    
    // Process job to match frontend expected format
    const processedJob = {
      _id: job._id,
      id: job._id,
      'Job Title': job['Job Title'] || '',
      'Company Name': job['Company Name'] || '',
      'Location': job['Location'] || '',
      'Salary': job['Salary'] || '',
      'Job Type': job['Job Type'] || '',
      'Posted Time': job['Posted Time'] || '',
      'Job URL': job['Job URL'] || '',
      'Application Status': job['Application Status'] || '',
      'Company Logo': job['Company Logo'] || '',
      'Experience Required': job['Experience Required'] || '',
      
      // Add frontend-friendly fields
      title: job['Job Title'] || '',
      company: job['Company Name'] || '',
      location: job['Location'] || '',
      salary: job['Salary'] || '',
      type: job['Job Type'] || '',
      applicationStatus: job['Application Status'] || '',
      jobUrl: job['Job URL'] || '',
      companyLogo: job['Company Logo'] || '',
      experienceRequired: job['Experience Required'] || '',
      postedDate: job['Posted Time'] || '',
      description: description,
      requirements: requirements ? requirements.split('\n').filter(r => r.trim()) : [],
      detailed_info: detailedInfo,
      last_updated: job.last_updated || new Date()
    };

    res.status(200).json({
      status: 'success',
      data: {
        job: processedJob
      }
    });
  } catch (error) {
    console.error(`Error fetching job with ID ${req.params.id}:`, error);
    next(error);
  }
};

// Create a new job
exports.createJob = async (req, res, next) => {
  try {
    const newJob = await Job.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        job: newJob
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a job
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a job
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 