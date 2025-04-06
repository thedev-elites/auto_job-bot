import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Check, ArrowRight, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import PageTransition from '@/components/ui-components/PageTransition';
import GlassCard from '@/components/ui-components/GlassCard';
import Button from '@/components/ui-components/Button';
import Input from '@/components/ui-components/Input';
import Navbar from '@/components/layout/Navbar';
import { api, Job } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Function to check if a job has good quality data
const hasQualityData = (job: Job) => {
  // Check for tier information (new tiering system)
  if ((job as any).tier === 1) {
    return true;
  }

  // Check if job has the completeness score (backend provides this)
  if ((job as any).completenessScore && (job as any).completenessScore >= 50) {
    return true;
  }

  // Must have actual salary (with currency symbol)
  if (job.salary && 
      job.salary !== 'N/A' && 
      job.salary.trim() !== '' && 
      !job.salary.includes('Competitive') &&
      /[₹$€£]/.test(job.salary)) {
    
    // Also must have title and company
    if (job.title && job.title !== 'N/A' && job.title.trim() !== '' &&
        job.company && job.company !== 'N/A' && job.company.trim() !== '') {
      return true;
    }
  }
  
  return false;
};

// Function to check if job has actual salary (not just "Competitive salary")
const hasActualSalary = (job: Job) => {
  return job.salary && 
         job.salary !== 'N/A' && 
         job.salary.trim() !== '' && 
         !job.salary.includes('Competitive') &&
         /[₹$€£]/.test(job.salary);
};

const Dashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [tier1Count, setTier1Count] = useState(0);
  const [tier2Count, setTier2Count] = useState(0);
  const [tier3Count, setTier3Count] = useState(0);
  const [showOnlyQualityJobs, setShowOnlyQualityJobs] = useState(true); // Default to true to show only quality jobs
  const { isAuthenticated, user, login } = useAuth();

  // Function to fetch jobs with pagination and filters
  const fetchJobs = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      console.log(`Fetching jobs for page ${page} with filters:`, filters);
      
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', '20'); // Set page size
      
      // Add filters if any
      if (selectedFilter !== 'all') {
        queryParams.append('type', selectedFilter);
      }
      
      // Add search query if any
      if (searchQuery) {
        queryParams.append('title', searchQuery);
      }
      
      // Convert additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString());
        }
      });
      
      // Use API client to ensure environment variables are properly used
      const endpoint = import.meta.env.VITE_API_BASE_URL?.includes('/api') 
        ? `/jobs?${queryParams.toString()}` 
        : `/api/jobs?${queryParams.toString()}`;
      
      // Create full URL based on environment
      const url = import.meta.env.VITE_API_BASE_URL 
        ? `${import.meta.env.VITE_API_BASE_URL}${endpoint}`
        : endpoint;
      
      console.log('Fetching from URL:', url);
      
      let response;
      let data;
      
      try {
        // First try with the environment URL
        response = await fetch(url);
        data = await response.json();
      } catch (error) {
        console.warn('First fetch attempt failed, trying fallback:', error);
        // Fallback to relative URL if the first attempt fails
        response = await fetch(`/api/jobs?${queryParams.toString()}`);
        data = await response.json();
      }
      
      if (data.status === 'success') {
        console.log(`Received ${data.results} jobs out of ${data.totalCount} total`);
        
        const allJobs = data.data.jobs;
        setJobs(allJobs);
        
        // If filter for quality jobs is on, filter them
        if (showOnlyQualityJobs) {
          const qualityJobs = allJobs.filter(job => hasQualityData(job));
          setFilteredJobs(qualityJobs);
          console.log(`Showing ${qualityJobs.length} quality jobs out of ${allJobs.length} total`);
        } else {
          setFilteredJobs(allJobs);
        }
        
        setTotalPages(data.totalPages || 1);
        setTotalJobs(data.totalCount || 0);
        setCurrentPage(data.currentPage || 1);
        setTier1Count(data.tier1Count || 0);
        setTier2Count(data.tier2Count || 0);
        setTier3Count(data.tier3Count || 0);
      } else {
        console.error('Error response from API:', data);
        toast.error('Failed to load jobs. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchJobs(1);
  }, []);

  // Toggle quality jobs filter
  useEffect(() => {
    if (jobs.length > 0) {
      if (showOnlyQualityJobs) {
        const qualityJobs = jobs.filter(job => hasQualityData(job));
        setFilteredJobs(qualityJobs);
      } else {
        setFilteredJobs(jobs);
      }
    }
  }, [showOnlyQualityJobs, jobs]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchJobs(newPage);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle filter change
  useEffect(() => {
    // Reset to first page when filters change
    fetchJobs(1, { type: selectedFilter !== 'all' ? selectedFilter : '' });
  }, [selectedFilter]);

  // Handle search
  const handleSearch = () => {
    // Reset to first page when searching
    fetchJobs(1, { 
      title: searchQuery,
      type: selectedFilter !== 'all' ? selectedFilter : '' 
    });
  };

  const handleApply = async (jobId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to apply for jobs');
      return;
    }
    
    try {
      toast.loading('Submitting your application...', { id: 'apply' });
      const result = await api.autoApply.apply(jobId);
      toast.dismiss('apply');
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.dismiss('apply');
      toast.error('Something went wrong. Please try again later.');
    }
  };

  // Function to handle job card click
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  // Function to close the job details modal
  const closeJobModal = () => {
    setSelectedJob(null);
  };

  // Function to extract skills from job
  const extractSkills = (job: Job) => {
    if (job.requirements && job.requirements.length > 0) {
      return job.requirements;
    }
    
    // If we have detailed_info, try to extract skills
    const detailedInfo = job.detailed_info as any;
    if (detailedInfo?.detailed_sections?.['Skill(s) required']) {
      return detailedInfo.detailed_sections['Skill(s) required']
        .split('\n')
        .filter((skill: string) => skill.trim() !== '');
    }
    
    return [];
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-light/20 to-background pb-20">
        <Navbar />
        
        <div className="container mx-auto px-4 md:px-6 pt-28">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Job Dashboard</h1>
            {isAuthenticated && user ? (
              <p className="text-muted-foreground">
                Welcome, {user.name}! Find and apply to your next opportunity with a single click.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Find and apply to your next opportunity with a single click.
              </p>
            )}
          </div>
          
          {!isAuthenticated && (
            <GlassCard className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium mb-1">Get the full experience</h3>
                <p className="text-muted-foreground">Sign in to apply to jobs and track your applications.</p>
              </div>
              <Button onClick={() => login()}>
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </GlassCard>
          )}
          
          {/* Search and filter section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, company, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant={selectedFilter === 'all' ? 'primary' : 'ghost'} 
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                >
                  All Jobs
                </Button>
                <Button 
                  variant={selectedFilter === 'Full-time' ? 'primary' : 'ghost'} 
                  size="sm"
                  onClick={() => setSelectedFilter('Full-time')}
                >
                  Full-time
                </Button>
                <Button 
                  variant={selectedFilter === 'Part-time' ? 'primary' : 'ghost'} 
                  size="sm"
                  onClick={() => setSelectedFilter('Part-time')}
                >
                  Part-time
                </Button>
                <Button 
                  variant={selectedFilter === 'Internship' ? 'primary' : 'ghost'} 
                  size="sm"
                  onClick={() => setSelectedFilter('Internship')}
                >
                  Internship
                </Button>
                <Button 
                  variant={selectedFilter === 'Contract' ? 'primary' : 'ghost'} 
                  size="sm"
                  onClick={() => setSelectedFilter('Contract')}
                >
                  Contract
                </Button>
              </div>
            </div>
            
            {/* Quality filter toggle */}
            <div className="flex items-center mt-4 p-3 bg-blue/10 rounded-lg">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyQualityJobs}
                  onChange={() => setShowOnlyQualityJobs(!showOnlyQualityJobs)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${showOnlyQualityJobs ? 'bg-blue' : 'bg-gray-300'} relative`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${showOnlyQualityJobs ? 'translate-x-5' : ''}`} />
                </div>
                <span className="ml-2 font-medium">Show high-quality listings with salary information</span>
                <span className="ml-1 text-sm text-muted-foreground">(prioritize jobs with actual salary amounts)</span>
              </label>
            </div>
          </div>
          
          {/* Stats section */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredJobs.length} of {totalJobs} jobs • Page {currentPage} of {totalPages}
              {showOnlyQualityJobs && jobs.length > filteredJobs.length && 
                ` • Filtered out ${jobs.length - filteredJobs.length} low-quality jobs`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-blue">{tier1Count} jobs with actual salary</span> • 
              <span className="font-medium text-blue-400">{tier2Count} jobs with complete info but no specific salary</span> • 
              <span className="text-muted-foreground">{tier3Count} jobs with incomplete information</span>
            </p>
          </div>
          
          {/* Job listings */}
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-64 bg-card/50 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => {
                  const skills = extractSkills(job);
                  const isQualityJob = hasQualityData(job);
                  const hasSalary = hasActualSalary(job);
                  const isCompetitiveSalary = job.salary && 
                                             job.salary !== 'N/A' && 
                                             job.salary.includes('Competitive');
                  
                  return (
                    <GlassCard 
                      key={job.id} 
                      className={`flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                        hasSalary ? 'border-2 border-blue/50' : 
                        isCompetitiveSalary ? 'border-2 border-blue/30' : 
                        isQualityJob ? 'border-2 border-blue/20' : ''
                      }`}
                      onClick={() => handleJobClick(job)}
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              {hasSalary && (
                                <span title="Has actual salary amount">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                </span>
                              )}
                              {isCompetitiveSalary && (
                                <span title="Has competitive salary">
                                  <Star className="h-4 w-4 text-blue-400 fill-blue-400" />
                                </span>
                              )}
                            </div>
                            <p className="text-blue font-medium">{job.company}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-light text-blue text-xs font-medium rounded-full ml-2 whitespace-nowrap">
                            {job.applicationStatus || job.type}
                          </span>
                        </div>
                        <div className="mb-4">
                          <p className="text-muted-foreground text-sm mb-1">{job.location}</p>
                          <p className="text-foreground font-medium">{job.salary}</p>
                          {job.experienceRequired && (
                            <p className="text-muted-foreground text-sm mt-1">
                              Experience: {job.experienceRequired}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {job.description || "No description available"}
                        </p>
                        <div className="space-y-1 mb-4">
                          {skills.slice(0, 2).map((skill, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <Check className="h-4 w-4 text-blue mr-2 flex-shrink-0" />
                              <span className="text-muted-foreground line-clamp-1">{skill}</span>
                            </div>
                          ))}
                          {skills.length > 2 && (
                            <p className="text-xs text-muted-foreground ml-6">
                              +{skills.length - 2} more requirements
                            </p>
                          )}
                          {skills.length === 0 && (
                            <p className="text-xs text-muted-foreground">No specific requirements listed</p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {job.postedDate && job.postedDate.includes('ago') 
                            ? `Posted ${job.postedDate}`
                            : `Posted ${job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'recently'}`}
                        </span>
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering card click
                            job.jobUrl ? window.open(job.jobUrl, '_blank') : handleApply(job.id);
                          }}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  We couldn't find any jobs matching your search criteria. Try adjusting your filters or search query.
                  {showOnlyQualityJobs && (
                    <span className="block mt-2">
                      <Button variant="outline" onClick={() => setShowOnlyQualityJobs(false)}>
                        Include all jobs regardless of salary information
                      </Button>
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Calculate page numbers to show based on current page
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                    }
                    
                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNum ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10 h-10 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="mx-1">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="w-10 h-10 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Job details modal */}
          {selectedJob && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                        {hasQualityData(selectedJob) && (
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-blue font-medium">{selectedJob.company}</p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={closeJobModal}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedJob.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">{selectedJob.salary || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Job Type</p>
                      <p className="font-medium">{selectedJob.type || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">{selectedJob.experienceRequired || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                    {selectedJob.description ? (
                      <p className="text-muted-foreground whitespace-pre-line">{selectedJob.description}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No description available</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    {extractSkills(selectedJob).length > 0 ? (
                      <ul className="space-y-2">
                        {extractSkills(selectedJob).map((req, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-blue mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{req}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground italic">No specific requirements listed</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button
                      onClick={() => selectedJob.jobUrl ? window.open(selectedJob.jobUrl, '_blank') : handleApply(selectedJob.id)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
