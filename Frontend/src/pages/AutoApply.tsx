
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  X, 
  FileText, 
  Mail, 
  RefreshCcw, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import PageTransition from '@/components/ui-components/PageTransition';
import GlassCard from '@/components/ui-components/GlassCard';
import Button from '@/components/ui-components/Button';
import Navbar from '@/components/layout/Navbar';
import { api, Job, Resume } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Application {
  id: string;
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  appliedAt: string;
  coverLetter?: string;
}

const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '1',
    status: 'completed',
    appliedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    coverLetter: `Dear Hiring Manager,

I am writing to express my interest in the Frontend Developer position at TechCorp. With 3+ years of experience in React development and a strong foundation in TypeScript and modern CSS, I believe I would be a valuable addition to your team.

At WebSolutions, I successfully implemented responsive web applications and collaborated with designers to create pixel-perfect UIs. Currently, as a Senior Frontend Developer at TechCorp, I lead development efforts for the company's flagship product, focusing on performance optimization and mentoring junior developers.

I am particularly drawn to TechCorp's innovative approach to user experience and would be excited to contribute my skills to your ongoing projects. My technical expertise aligns perfectly with your requirements, and I am confident that I can help drive your frontend development initiatives forward.

Thank you for considering my application. I look forward to the opportunity to discuss how my experience and skills can benefit TechCorp.

Sincerely,
John Doe`
  },
  {
    id: '2',
    jobId: '3',
    status: 'failed',
    appliedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: '3',
    jobId: '5',
    status: 'completed',
    appliedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    coverLetter: `Dear Hiring Manager,

I am excited to apply for the DevOps Engineer position at CloudTech. With my AWS certification and extensive experience with Docker, Kubernetes, and Infrastructure as Code tools like Terraform, I am well-equipped to optimize your CI/CD pipelines and cloud infrastructure.

Throughout my career, I have implemented robust DevOps solutions that have significantly improved deployment efficiency and system reliability. I am particularly impressed by CloudTech's commitment to cloud innovation and would welcome the opportunity to contribute to your team's success.

I look forward to discussing how my skills and experience align with your needs.

Best regards,
John Doe`
  }
];

const AutoApply = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, resumeData] = await Promise.all([
          api.jobs.getAll(),
          api.resume.get().catch(() => null)
        ]);
        
        setJobs(jobsData);
        setResume(resumeData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data. Please try again later.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const generateCoverLetter = async () => {
    if (!selectedJob || !resume) {
      toast.error('Please select a job and complete your resume first');
      return;
    }
    
    setIsGeneratingCoverLetter(true);
    
    try {
      // Simulate AI-generated cover letter
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const jobTitle = selectedJob.title;
      const company = selectedJob.company;
      const skills = selectedJob.requirements.join(', ');
      
      const coverLetter = `Dear Hiring Manager,

I am writing to express my interest in the ${jobTitle} position at ${company}. With my background in ${resume.skills.slice(0, 3).join(', ')}, and other relevant skills, I believe I would be a valuable addition to your team.

${resume.experience.length > 0 ? `At ${resume.experience[0].company}, I ${resume.experience[0].description.substring(0, 100)}...` : 'Throughout my career, I have developed skills in...'}

I am particularly drawn to ${company}'s innovative approach and would be excited to contribute my skills to your team. My technical expertise in ${skills} aligns perfectly with your requirements, and I am confident that I can help drive your initiatives forward.

Thank you for considering my application. I look forward to the opportunity to discuss how my experience and skills can benefit ${company}.

Sincerely,
${resume.fullName}`;
      
      setGeneratedCoverLetter(coverLetter);
      toast.success('Cover letter generated successfully!');
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast.error('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const submitApplication = async () => {
    if (!selectedJob || !resume) {
      toast.error('Please select a job and complete your resume first');
      return;
    }
    
    if (!generatedCoverLetter) {
      toast.error('Please generate a cover letter first');
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('Please sign in to submit applications');
      return;
    }
    
    setIsSubmittingApplication(true);
    
    try {
      await api.autoApply.apply(selectedJob.id);
      
      // Add the new application to the list
      const newApplication: Application = {
        id: Math.random().toString(36).substring(2, 9),
        jobId: selectedJob.id,
        status: 'completed',
        appliedAt: new Date().toISOString(),
        coverLetter: generatedCoverLetter
      };
      
      setApplications(prev => [newApplication, ...prev]);
      setSelectedJob(null);
      setGeneratedCoverLetter('');
      
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again later.');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const getJobById = (jobId: string) => {
    return jobs.find(job => job.id === jobId);
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-subtle">Loading data...</div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-light/20 to-background pb-20">
        <Navbar />
        
        <div className="container mx-auto px-4 md:px-6 pt-28">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Auto Apply</h1>
            <p className="text-muted-foreground max-w-2xl">
              Use AI to generate personalized cover letters and automatically apply to jobs with a single click.
            </p>
          </div>
          
          {!isAuthenticated && (
            <GlassCard className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium mb-1">Get the full experience</h3>
                <p className="text-muted-foreground">Sign in to submit applications and track your progress.</p>
              </div>
              <Button onClick={login}>
                Sign In
              </Button>
            </GlassCard>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Job Selection and Cover Letter Generation */}
            <div className="md:col-span-2 space-y-6">
              {/* Resume Check */}
              <GlassCard>
                <h2 className="text-xl font-semibold mb-6">Resume Check</h2>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-blue" />
                    <div>
                      <h3 className="font-medium">Your Resume</h3>
                      <p className="text-sm text-muted-foreground">
                        {resume ? 'Your resume is ready to use for applications.' : 'You need to create a resume first.'}
                      </p>
                    </div>
                  </div>
                  <div>
                    {resume ? (
                      <div className="flex items-center text-green-600">
                        <Check className="h-5 w-5 mr-1" />
                        <span>Complete</span>
                      </div>
                    ) : (
                      <Link to="/resume-builder">
                        <Button size="sm">Create Resume</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </GlassCard>
              
              {/* Job Selection */}
              <GlassCard>
                <h2 className="text-xl font-semibold mb-6">Select a Job</h2>
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map(job => (
                      <div 
                        key={job.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedJob?.id === job.id 
                            ? 'border-blue bg-blue-light/20' 
                            : 'border-border hover:border-blue/30 hover:bg-blue-light/10'
                        }`}
                        onClick={() => setSelectedJob(job)}
                      >
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium">{job.title}</h3>
                          <span className="text-sm px-2 py-0.5 bg-secondary rounded-full">
                            {job.type}
                          </span>
                        </div>
                        <p className="text-blue text-sm mb-2">{job.company}</p>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{job.location}</span>
                          <span>{job.salary}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-muted rounded-lg">
                    <p className="text-muted-foreground mb-4">No jobs available.</p>
                    <Link to="/dashboard">
                      <Button variant="outline" size="sm">
                        Browse Jobs
                      </Button>
                    </Link>
                  </div>
                )}
              </GlassCard>
              
              {/* Cover Letter Generation */}
              <GlassCard>
                <h2 className="text-xl font-semibold mb-6">Cover Letter</h2>
                
                {selectedJob ? (
                  <>
                    <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
                      <h3 className="font-medium mb-2">Selected Job: {selectedJob.title} at {selectedJob.company}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{selectedJob.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requirements.map((req, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-white rounded-full">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Generated Cover Letter</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={generateCoverLetter}
                        isLoading={isGeneratingCoverLetter}
                        disabled={!resume || isGeneratingCoverLetter}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        {generatedCoverLetter ? 'Regenerate' : 'Generate'} with AI
                      </Button>
                    </div>
                    
                    {generatedCoverLetter ? (
                      <div className="p-4 bg-white border border-border rounded-lg whitespace-pre-line">
                        {generatedCoverLetter}
                      </div>
                    ) : (
                      <div className="text-center py-10 border border-dashed border-muted rounded-lg">
                        <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground mb-4">
                          Click "Generate with AI" to create a personalized cover letter based on your resume and the selected job.
                        </p>
                      </div>
                    )}
                    
                    {generatedCoverLetter && (
                      <div className="mt-6 flex justify-end">
                        <Button 
                          onClick={submitApplication}
                          isLoading={isSubmittingApplication}
                          disabled={!isAuthenticated || isSubmittingApplication}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Submit Application
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10 border border-dashed border-muted rounded-lg">
                    <p className="text-muted-foreground mb-4">
                      Select a job to generate a cover letter.
                    </p>
                  </div>
                )}
              </GlassCard>
            </div>
            
            {/* Right Column: Application History */}
            <div className="md:col-span-1">
              <div className="sticky top-28">
                <GlassCard>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Application History</h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {applications.length > 0 ? (
                    <div className="space-y-4 max-h-[70vh] overflow-auto pr-2">
                      {applications.map(app => {
                        const job = getJobById(app.jobId);
                        return job ? (
                          <div key={app.id} className="p-4 border border-border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{job.title}</h3>
                                <p className="text-blue text-sm">{job.company}</p>
                              </div>
                              {app.status === 'completed' ? (
                                <span className="flex items-center text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Applied
                                </span>
                              ) : app.status === 'failed' ? (
                                <span className="flex items-center text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                  <X className="h-3 w-3 mr-1" />
                                  Failed
                                </span>
                              ) : (
                                <span className="flex items-center text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                  Pending
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Applied on {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                            {app.coverLetter && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  // Simulate viewing the cover letter
                                  toast.success('Cover letter opened');
                                }}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                View Cover Letter
                              </Button>
                            )}
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-muted rounded-lg">
                      <p className="text-muted-foreground">
                        No applications submitted yet.
                      </p>
                    </div>
                  )}
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AutoApply;
