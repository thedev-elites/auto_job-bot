// API service for interacting with the backend

import axios from 'axios';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  type: string;
  jobUrl?: string;
  applicationStatus?: string;
  companyLogo?: string;
  experienceRequired?: string;
  responsibilities?: string;
  detailed_info?: any;
}

export interface Resume {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa?: string;
  }[];
}

// Create axios instance with configurable base URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug the API base URL to understand what's configured
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || '/api');

// Add a request interceptor for debugging
apiClient.interceptors.request.use(
  config => {
    console.log('Making API request to:', `${config.baseURL}${config.url}`);
    // Make sure URLs are properly formed when using environment variables
    if (config.baseURL.endsWith('/') && config.url?.startsWith('/')) {
      config.url = config.url.substring(1);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Debug utility function to log job data structure
const logJobStructure = (job: any) => {
  console.log('Job data structure:', Object.keys(job));
  console.log('Sample job data:', {
    id: job._id || job.id,
    title: job['Job Title'] || job.title,
    company: job['Company Name'] || job.company,
    type: job['Job Type'] || job.type
  });
};

// API functions
export const api = {
  jobs: {
    getAll: async (): Promise<Job[]> => {
      try {
        console.log('Fetching all jobs...');
        // Make sure we're adding /api if the baseURL doesn't already have it
        const endpoint = import.meta.env.VITE_API_BASE_URL?.includes('/api') ? '/jobs' : '/api/jobs';
        const response = await apiClient.get(endpoint);
        console.log('Raw API response status:', response.status);
        
        // Check the response structure
        const jobsData = response.data.data?.jobs || response.data.jobs || [];
        console.log(`Received ${jobsData.length} jobs from API`);
        
        if (jobsData.length === 0) {
          console.log('No jobs found in response');
          return [];
        }
        
        // Log the first job to understand its structure
        if (jobsData.length > 0) {
          logJobStructure(jobsData[0]);
        }
        
        // Transform the response data to match our Job interface
        return jobsData.map((job: any) => {
          // Extract requirements from detailed info if available
          const detailedInfo = job.detailed_info || {};
          const detailedSections = detailedInfo.detailed_sections || {};
          
          const requirements = detailedSections['Skill(s) required']
            ? detailedSections['Skill(s) required'].split('\n')
            : detailedSections['About the job']
              ? detailedSections['About the job'].split('\n').filter((line: string) => line.trim() !== '')
              : [];
          
          // Extract description from detailed info if available
          const description = detailedSections['About the job'] || 
                            detailedSections ? 'See details for more information' : 'No description available';
          
          // Access fields consistently regardless of backend format
          const title = job.title || job['Job Title'] || 'No Title';
          const company = job.company || job['Company Name'] || 'No Company';
          const location = job.location || job['Location'] || 'Remote';
          const salary = job.salary || job['Salary'] || 'Salary not specified';
          const jobType = job.type || job['Job Type'] || job.jobType || 'Full-time';
          const postedTime = job['Posted Time'] || job.postedTime || '';
          const postedDate = job.last_updated || postedTime || new Date().toISOString();
          const jobUrl = job.jobUrl || job['Job URL'] || '';
          const applicationStatus = job.applicationStatus || job['Application Status'] || '';
          const companyLogo = job.companyLogo || job['Company Logo'] || '';
          const experienceRequired = job.experienceRequired || job['Experience Required'] || '';

          return {
            id: job._id || job.id,
            title,
            company,
            location,
            salary,
            description,
            requirements: Array.isArray(requirements) ? requirements : 
                         (requirements ? [requirements] : []),
            postedDate,
            type: jobType,
            jobUrl,
            applicationStatus,
            companyLogo,
            experienceRequired,
            responsibilities: job.responsibilities || '',
            detailed_info: job.detailed_info || {}
          };
        });
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Return empty array instead of throwing to allow graceful UI handling
        return [];
      }
    },
    getById: async (id: string): Promise<Job | undefined> => {
      try {
        console.log(`Fetching job with id: ${id}`);
        // Make sure we're adding /api if the baseURL doesn't already have it
        const endpoint = import.meta.env.VITE_API_BASE_URL?.includes('/api') ? `/jobs/${id}` : `/api/jobs/${id}`;
        const response = await apiClient.get(endpoint);
        
        // Check response structure
        const jobData = response.data.data?.job || response.data.job;
        
        if (!jobData) {
          console.log('No job found in response');
          return undefined;
        }
        
        // Log job structure for debugging
        logJobStructure(jobData);
        
        // Extract requirements from detailed info if available
        const detailedInfo = jobData.detailed_info || {};
        const detailedSections = detailedInfo.detailed_sections || {};
        
        const requirements = detailedSections['Skill(s) required']
          ? detailedSections['Skill(s) required'].split('\n')
          : detailedSections['About the job']
            ? detailedSections['About the job'].split('\n').filter((line: string) => line.trim() !== '')
            : [];
        
        // Extract description from detailed info if available
        const description = detailedSections['About the job'] || 
                           (detailedSections ? 'See details for more information' : 'No description available');
        
        // Access fields consistently regardless of backend format
        const title = jobData.title || jobData['Job Title'] || 'No Title';
        const company = jobData.company || jobData['Company Name'] || 'No Company';
        const location = jobData.location || jobData['Location'] || 'Remote';
        const salary = jobData.salary || jobData['Salary'] || 'Salary not specified';
        const jobType = jobData.type || jobData['Job Type'] || jobData.jobType || 'Full-time';
        const postedTime = jobData['Posted Time'] || jobData.postedTime || '';
        const postedDate = jobData.last_updated || postedTime || new Date().toISOString();
        const jobUrl = jobData.jobUrl || jobData['Job URL'] || '';
        const applicationStatus = jobData.applicationStatus || jobData['Application Status'] || '';
        const companyLogo = jobData.companyLogo || jobData['Company Logo'] || '';
        const experienceRequired = jobData.experienceRequired || jobData['Experience Required'] || '';
        
        return {
          id: jobData._id || jobData.id,
          title,
          company,
          location,
          salary,
          description,
          requirements: Array.isArray(requirements) ? requirements : 
                       (requirements ? [requirements] : []),
          postedDate,
          type: jobType,
          jobUrl,
          applicationStatus,
          companyLogo,
          experienceRequired,
          responsibilities: jobData.responsibilities || '',
          detailed_info: jobData.detailed_info || {}
        };
      } catch (error) {
        console.error(`Error fetching job with id ${id}:`, error);
        return undefined;
      }
    },
    // Debug function to look at raw MongoDB data
    getRawData: async (): Promise<any> => {
      try {
        // Make sure we're adding /api if the baseURL doesn't already have it
        const endpoint = import.meta.env.VITE_API_BASE_URL?.includes('/api') ? '/jobs/debug' : '/api/jobs/debug';
        const response = await apiClient.get(endpoint);
        return response.data;
      } catch (error) {
        console.error('Error fetching raw job data:', error);
        return null;
      }
    }
  },
  resume: {
    get: async (): Promise<Resume> => {
      // This would be replaced with a real API call
      const mockResume: Resume = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        address: 'San Francisco, CA',
        summary: 'Experienced software engineer with a passion for building user-friendly applications and solving complex problems.',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'CSS', 'HTML', 'Git', 'REST APIs'],
        experience: [
          {
            title: 'Senior Frontend Developer',
            company: 'TechCorp',
            location: 'San Francisco, CA',
            startDate: '2020-06',
            endDate: 'Present',
            description: 'Lead frontend development for the company\'s flagship product. Implemented new features, improved performance, and mentored junior developers.'
          },
          {
            title: 'Frontend Developer',
            company: 'WebSolutions',
            location: 'San Francisco, CA',
            startDate: '2018-03',
            endDate: '2020-05',
            description: 'Developed responsive web applications using React and TypeScript. Collaborated with designers to implement pixel-perfect UIs.'
          }
        ],
        education: [
          {
            degree: 'B.S. Computer Science',
            institution: 'University of California, Berkeley',
            location: 'Berkeley, CA',
            graduationDate: '2018',
            gpa: '3.8'
          }
        ]
      };
      return mockResume;
    },
    save: async (resume: Resume): Promise<Resume> => {
      // This would be replaced with a real API call
      return resume;
    }
  },
  autoApply: {
    apply: async (jobId: string): Promise<{ success: boolean; message: string }> => {
      try {
        // In a real implementation, this would call the backend API
        // const response = await apiClient.post('/applications', { jobId });
        // return response.data;
        
        // For now, just simulate a successful response
        return {
          success: true,
          message: 'Your application has been submitted successfully!'
        };
      } catch (error) {
        console.error('Error applying to job:', error);
        return {
          success: false,
          message: 'Failed to submit application. Please try again later.'
        };
      }
    }
  }
};
