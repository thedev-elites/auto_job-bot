import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash, Save, File, ChevronLeft, ChevronRight, Star, User, Mail, Phone, MapPin, Briefcase, GraduationCap, ChevronUp, ChevronDown, FileText } from 'lucide-react';
import PageTransition from '@/components/ui-components/PageTransition';
import GlassCard from '@/components/ui-components/GlassCard';
import Button from '@/components/ui-components/Button';
import Input from '@/components/ui-components/Input';
import Navbar from '@/components/layout/Navbar';
import { api, Resume } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Added template data model
type ResumeTemplate = {
  id: number;
  name: string;
  description: string;
  stars: number;
  popular?: boolean;
  new?: boolean;
  featured?: boolean;
  bgColor: string;
};

const templates: ResumeTemplate[] = [
  {
    id: 1,
    name: "Modern Professional",
    description: "Clean and professional design with a touch of color.",
    stars: 5,
    popular: true,
    bgColor: "from-blue-50 to-indigo-50"
  },
  {
    id: 2,
    name: "Executive Brief",
    description: "Elegant design with photo, perfect for executives.",
    stars: 4,
    bgColor: "from-gray-50 to-gray-100"
  },
  {
    id: 3,
    name: "Creative Impact",
    description: "Bold design with skill visualization features.",
    stars: 4,
    bgColor: "from-green-50 to-emerald-50"
  },
  {
    id: 4,
    name: "Tech Innovator",
    description: "Modern design optimized for tech industry jobs.",
    stars: 5,
    new: true,
    bgColor: "from-purple-50 to-pink-50"
  },
  {
    id: 5,
    name: "Timeline Focus",
    description: "Chronological format with a creative twist for your work history.",
    stars: 5,
    featured: true,
    bgColor: "from-orange-50 to-amber-50"
  },
  {
    id: 6,
    name: "Minimalist Pro",
    description: "Clean timeline-based design with focus on experience.",
    stars: 4,
    bgColor: "from-cyan-50 to-sky-50"
  }
];

// Resume Template Components
const ModernProfessionalTemplate = ({ resume, sectionOrder }: { resume: Resume, sectionOrder: string[] }) => (
  <div className="font-sans text-gray-800">
    {/* Header with blue accent */}
    <div className="bg-blue-600 p-4 text-white mb-4">
      <h2 className="text-xl font-bold">{resume.fullName || 'Your Name'}</h2>
      <div className="flex flex-wrap gap-2 text-xs mt-1">
        {resume.email && <span>{resume.email}</span>}
        {resume.email && resume.phone && <span>•</span>}
        {resume.phone && <span>{resume.phone}</span>}
        {(resume.email || resume.phone) && resume.address && <span>•</span>}
        {resume.address && <span>{resume.address}</span>}
      </div>
    </div>
    
    {/* Render sections according to sectionOrder */}
    {sectionOrder.map((section) => {
      switch(section) {
        case 'summary':
          return resume.summary ? (
            <div key="summary" className="mb-4">
              <h3 className="text-sm font-bold text-blue-600 border-b border-blue-200 pb-1 mb-2">PROFESSIONAL SUMMARY</h3>
              <p className="text-xs">{resume.summary}</p>
            </div>
          ) : null;
        
        case 'skills':
          return resume.skills.length > 0 ? (
            <div key="skills" className="mb-4">
              <h3 className="text-sm font-bold text-blue-600 border-b border-blue-200 pb-1 mb-2">SKILLS</h3>
              <div className="flex flex-wrap gap-1">
                {resume.skills.map((skill, index) => (
                  <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null;
        
        case 'experience':
          return resume.experience.length > 0 ? (
            <div key="experience" className="mb-4">
              <h3 className="text-sm font-bold text-blue-600 border-b border-blue-200 pb-1 mb-2">EXPERIENCE</h3>
              {resume.experience.map((exp, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between">
                    <h4 className="text-xs font-bold">{exp.title || 'Position'}</h4>
                    <span className="text-xs">
                      {exp.startDate || 'Start'} - {exp.endDate || 'End'}
                    </span>
                  </div>
                  <p className="text-xs font-medium">{exp.company || 'Company'}{exp.location ? `, ${exp.location}` : ''}</p>
                  <p className="text-xs mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          ) : null;
        
        case 'education':
          return resume.education.length > 0 ? (
            <div key="education">
              <h3 className="text-sm font-bold text-blue-600 border-b border-blue-200 pb-1 mb-2">EDUCATION</h3>
              {resume.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between">
                    <h4 className="text-xs font-bold">{edu.degree || 'Degree'}</h4>
                    <span className="text-xs">{edu.graduationDate || 'Graduation Date'}</span>
                  </div>
                  <p className="text-xs">{edu.institution || 'Institution'}{edu.location ? `, ${edu.location}` : ''}</p>
                  {edu.gpa && <p className="text-xs">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          ) : null;
        
        default:
          return null;
      }
    })}
  </div>
);

const ExecutiveBriefTemplate = ({ resume, sectionOrder }: { resume: Resume, sectionOrder: string[] }) => (
  <div className="font-serif text-gray-800">
    {/* Header with photo placeholder */}
    <div className="flex items-start mb-4">
      <div className="mr-4 bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center text-gray-500 text-xs">
        {resume.fullName ? resume.fullName.charAt(0) : 'Photo'}
      </div>
      <div>
        <h2 className="text-xl font-bold">{resume.fullName || 'Your Name'}</h2>
        <div className="text-xs text-gray-600">
          {resume.email && <div>{resume.email}</div>}
          {resume.phone && <div>{resume.phone}</div>}
          {resume.address && <div>{resume.address}</div>}
        </div>
      </div>
    </div>
    
    {/* Render sections according to sectionOrder */}
    {sectionOrder.map((section) => {
      switch(section) {
        case 'summary':
          return resume.summary ? (
            <div key="summary" className="mb-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase">Executive Summary</h3>
              <p className="text-xs border-l-2 border-gray-300 pl-2">{resume.summary}</p>
            </div>
          ) : null;
        
        case 'skills':
          return resume.skills.length > 0 ? (
            <div key="skills" className="mb-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase">Core Competencies</h3>
              <div className="grid grid-cols-2 gap-1">
                {resume.skills.map((skill, index) => (
                  <div key={index} className="text-xs flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-500 mr-1"></span>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        
        case 'experience':
          return resume.experience.length > 0 ? (
            <div key="experience" className="mb-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase">Professional Experience</h3>
              {resume.experience.map((exp, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between">
                    <h4 className="text-xs font-bold">{exp.company || 'Company'}</h4>
                    <span className="text-xs italic">
                      {exp.startDate || 'Start'} - {exp.endDate || 'End'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold">{exp.title || 'Position'}{exp.location ? ` | ${exp.location}` : ''}</p>
                  <p className="text-xs mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          ) : null;
        
        case 'education':
          return resume.education.length > 0 ? (
            <div key="education">
              <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase">Education</h3>
              {resume.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <p className="text-xs font-bold">{edu.degree || 'Degree'}</p>
                  <p className="text-xs">{edu.institution || 'Institution'}{edu.location ? `, ${edu.location}` : ''}</p>
                  <p className="text-xs italic">{edu.graduationDate || 'Graduation Date'}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
                </div>
              ))}
            </div>
          ) : null;
        
        default:
          return null;
      }
    })}
  </div>
);

const CreativeImpactTemplate = ({ resume, sectionOrder }: { resume: Resume, sectionOrder: string[] }) => (
  <div className="font-sans text-gray-800">
    {/* Header with green accent */}
    <div className="border-l-4 border-green-500 pl-3 mb-4">
      <h2 className="text-xl font-bold text-green-700">{resume.fullName || 'Your Name'}</h2>
      <div className="flex flex-wrap gap-2 text-xs mt-1">
        {resume.email && <span>{resume.email}</span>}
        {resume.phone && <span>{resume.phone}</span>}
        {resume.address && <span>{resume.address}</span>}
      </div>
    </div>
    
    {/* Render sections according to sectionOrder */}
    {sectionOrder.map((section) => {
      switch(section) {
        case 'summary':
          return resume.summary ? (
            <div key="summary" className="mb-4">
              <h3 className="text-sm font-bold text-green-600 mb-2">ABOUT ME</h3>
              <p className="text-xs bg-green-50 p-2 rounded">{resume.summary}</p>
            </div>
          ) : null;
        
        case 'skills':
          return resume.skills.length > 0 ? (
            <div key="skills" className="mb-4">
              <h3 className="text-sm font-bold text-green-600 mb-2">MY SKILLS</h3>
              <div className="grid grid-cols-2 gap-2">
                {resume.skills.map((skill, index) => (
                  <div key={index} className="text-xs flex items-center">
                    <div className="h-2 bg-green-200 rounded-full w-full mr-2 overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        
        case 'experience':
          return resume.experience.length > 0 ? (
            <div key="experience" className="mb-4">
              <h3 className="text-sm font-bold text-green-600 mb-2">WORK EXPERIENCE</h3>
              {resume.experience.map((exp, index) => (
                <div key={index} className="mb-3 border-l-2 border-green-200 pl-2">
                  <h4 className="text-xs font-bold">{exp.title || 'Position'} @ {exp.company || 'Company'}</h4>
                  <p className="text-xs text-green-700">{exp.startDate || 'Start'} - {exp.endDate || 'End'} | {exp.location || 'Location'}</p>
                  <p className="text-xs mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          ) : null;
        
        case 'education':
          return resume.education.length > 0 ? (
            <div key="education">
              <h3 className="text-sm font-bold text-green-600 mb-2">EDUCATION</h3>
              {resume.education.map((edu, index) => (
                <div key={index} className="mb-2 border-l-2 border-green-200 pl-2">
                  <h4 className="text-xs font-bold">{edu.degree || 'Degree'}</h4>
                  <p className="text-xs">{edu.institution || 'Institution'}{edu.location ? `, ${edu.location}` : ''}</p>
                  <p className="text-xs text-green-700">{edu.graduationDate || 'Graduation Date'}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
                </div>
              ))}
            </div>
          ) : null;
        
        default:
          return null;
      }
    })}
  </div>
);

const TechInnovatorTemplate = ({ resume, sectionOrder }: { resume: Resume, sectionOrder: string[] }) => (
  <div className="font-mono text-gray-800">
    {/* Header with purple accent */}
    <div className="mb-4">
      <h2 className="text-xl font-bold bg-purple-600 text-white px-2 py-1 inline-block">{resume.fullName || 'Your Name'}</h2>
      <div className="text-xs mt-2 border-t-2 border-purple-300 pt-2">
        {resume.email && <span className="mr-2">[{resume.email}]</span>}
        {resume.phone && <span className="mr-2">[{resume.phone}]</span>}
        {resume.address && <span>[{resume.address}]</span>}
      </div>
    </div>
    
    {/* Render sections according to sectionOrder */}
    {sectionOrder.map((section) => {
      switch(section) {
        case 'summary':
          return resume.summary ? (
            <div key="summary" className="mb-4">
              <h3 className="text-sm font-bold bg-purple-100 text-purple-800 px-2 mb-2"># PROFILE</h3>
              <p className="text-xs font-light">{resume.summary}</p>
            </div>
          ) : null;
        
        case 'skills':
          return resume.skills.length > 0 ? (
            <div key="skills" className="mb-4">
              <h3 className="text-sm font-bold bg-purple-100 text-purple-800 px-2 mb-2"># TECHNICAL SKILLS</h3>
              <div className="flex flex-wrap gap-1">
                {resume.skills.map((skill, index) => (
                  <span key={index} className="text-xs border border-purple-300 px-1 font-light">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null;
        
        case 'experience':
          return resume.experience.length > 0 ? (
            <div key="experience" className="mb-4">
              <h3 className="text-sm font-bold bg-purple-100 text-purple-800 px-2 mb-2"># EXPERIENCE</h3>
              {resume.experience.map((exp, index) => (
                <div key={index} className="mb-3">
                  <h4 className="text-xs font-bold">{exp.title || 'Position'}</h4>
                  <p className="text-xs font-light">
                    @ {exp.company || 'Company'} | {exp.startDate || 'Start'} - {exp.endDate || 'End'} | {exp.location || 'Location'}
                  </p>
                  <p className="text-xs mt-1 font-light">&gt; {exp.description}</p>
                </div>
              ))}
            </div>
          ) : null;
        
        case 'education':
          return resume.education.length > 0 ? (
            <div key="education">
              <h3 className="text-sm font-bold bg-purple-100 text-purple-800 px-2 mb-2"># EDUCATION</h3>
              {resume.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <h4 className="text-xs font-bold">{edu.degree || 'Degree'}</h4>
                  <p className="text-xs font-light">
                    @ {edu.institution || 'Institution'} | {edu.graduationDate || 'Graduation Date'} | {edu.location || 'Location'}
                  </p>
                  {edu.gpa && <p className="text-xs font-light">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          ) : null;
        
        default:
          return null;
      }
    })}
  </div>
);

const TimelineFocusTemplate = ({ resume, sectionOrder }: { resume: Resume, sectionOrder: string[] }) => (
  <div className="font-sans text-gray-800">
    {/* Header with orange accent */}
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-orange-600">{resume.fullName || 'Your Name'}</h2>
      <div className="text-xs text-right">
        {resume.email && <div>{resume.email}</div>}
        {resume.phone && <div>{resume.phone}</div>}
        {resume.address && <div>{resume.address}</div>}
      </div>
    </div>
    
    {/* Render sections according to sectionOrder */}
    {sectionOrder.map((section) => {
      switch(section) {
        case 'summary':
          return resume.summary ? (
            <div key="summary" className="mb-4 bg-orange-50 p-2 border-l-4 border-orange-400">
              <p className="text-xs">{resume.summary}</p>
            </div>
          ) : null;
        
        case 'skills':
          return resume.skills.length > 0 ? (
            <div key="skills" className="mb-4">
              <h3 className="text-sm font-bold text-orange-600 border-b border-orange-200 pb-1 mb-2">SKILLS & EXPERTISE</h3>
              <div className="grid grid-cols-2 gap-1">
                {resume.skills.map((skill, index) => (
                  <span key={index} className="text-xs bg-orange-50 border-l-2 border-orange-300 pl-1">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null;
        
        case 'experience':
          return resume.experience.length > 0 ? (
            <div key="experience" className="mb-4">
              <h3 className="text-sm font-bold text-orange-600 border-b border-orange-200 pb-1 mb-2">CAREER HISTORY</h3>
              {resume.experience.map((exp, index) => (
                <div key={index} className="mb-3 relative pl-4">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-orange-300"></div>
                  <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-orange-500"></div>
                  <div className="flex justify-between">
                    <h4 className="text-xs font-bold">{exp.title || 'Position'}</h4>
                    <span className="text-xs text-orange-700">
                      {exp.startDate || 'Start'} - {exp.endDate || 'End'}
                    </span>
                  </div>
                  <p className="text-xs font-medium">{exp.company || 'Company'}{exp.location ? ` | ${exp.location}` : ''}</p>
                  <p className="text-xs mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          ) : null;
        
        case 'education':
          return resume.education.length > 0 ? (
            <div key="education">
              <h3 className="text-sm font-bold text-orange-600 border-b border-orange-200 pb-1 mb-2">EDUCATION</h3>
              {resume.education.map((edu, index) => (
                <div key={index} className="mb-2 relative pl-4">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-orange-300"></div>
                  <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-orange-500"></div>
                  <div className="flex justify-between">
                    <h4 className="text-xs font-bold">{edu.degree || 'Degree'}</h4>
                    <span className="text-xs text-orange-700">{edu.graduationDate || 'Graduation Date'}</span>
                  </div>
                  <p className="text-xs">{edu.institution || 'Institution'}{edu.location ? ` | ${edu.location}` : ''}</p>
                  {edu.gpa && <p className="text-xs">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          ) : null;
        
        default:
          return null;
      }
    })}
  </div>
);

const MinimalistProTemplate = ({ resume, sectionOrder }: { resume: Resume, sectionOrder: string[] }) => (
  <div className="font-sans text-gray-800">
    {/* Header */}
    <div className="mb-4">
      <h2 className="text-xl font-bold">{resume.fullName || 'Your Name'}</h2>
      <div className="flex gap-3 text-xs text-gray-600 mt-1">
        {resume.email && <span>{resume.email}</span>}
        {resume.phone && <span>{resume.phone}</span>}
        {resume.address && <span>{resume.address}</span>}
      </div>
      <div className="h-px bg-gray-300 w-full mt-2"></div>
    </div>
    
    {/* Render sections according to sectionOrder */}
    {sectionOrder.map((section) => {
      switch(section) {
        case 'summary':
          return resume.summary ? (
            <div key="summary" className="mb-4">
              <p className="text-xs">{resume.summary}</p>
            </div>
          ) : null;
        
        case 'skills':
          return resume.skills.length > 0 ? (
            <div key="skills" className="mb-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">SKILLS</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {resume.skills.map((skill, index) => (
                  <span key={index} className="text-xs">
                    {skill}{index < resume.skills.length - 1 ? ' •' : ''}
                  </span>
                ))}
              </div>
            </div>
          ) : null;
        
        case 'experience':
          return resume.experience.length > 0 ? (
            <div key="experience" className="mb-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">EXPERIENCE</h3>
              {resume.experience.map((exp, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">{exp.startDate || 'Start'} - {exp.endDate || 'End'}</span>
                    <span className="text-xs">{exp.location || 'Location'}</span>
                  </div>
                  <h4 className="text-xs font-bold">{exp.title || 'Position'} | {exp.company || 'Company'}</h4>
                  <p className="text-xs mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          ) : null;
        
        case 'education':
          return resume.education.length > 0 ? (
            <div key="education">
              <h3 className="text-sm font-medium text-gray-800 mb-2">EDUCATION</h3>
              {resume.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">{edu.graduationDate || 'Graduation Date'}</span>
                    <span className="text-xs">{edu.location || 'Location'}</span>
                  </div>
                  <h4 className="text-xs font-bold">{edu.degree || 'Degree'} | {edu.institution || 'Institution'}</h4>
                  {edu.gpa && <p className="text-xs">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          ) : null;
        
        default:
          return null;
      }
    })}
  </div>
);

const ResumeBuilder = () => {
  const [resume, setResume] = useState<Resume>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    skills: [],
    experience: [],
    education: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const { isAuthenticated, login } = useAuth();
  
  // Added template related states
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const templateScrollRef = useRef<HTMLDivElement>(null);

  // Add state to track which sections are open/closed
  const [openSections, setOpenSections] = useState({
    personalInfo: true,
    summary: true,
    skills: true,
    experience: true,
    education: true
  });

  // Add state for download loading indicator
  const [isDownloading, setIsDownloading] = useState(false);

  // Add state to track the order of sections
  const [sectionOrder, setSectionOrder] = useState([
    'personalInfo',
    'summary',
    'skills',
    'experience',
    'education'
  ]);

  // Reference for the dropdown menu
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownButtonRef.current && 
        !dropdownButtonRef.current.contains(event.target as Node)
      ) {
        const dropdown = document.getElementById('download-dropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
          dropdown.classList.add('hidden');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to scroll through templates
  const scrollTemplates = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentTemplate > 0) {
      setCurrentTemplate(prev => prev - 1);
    } else if (direction === 'right' && currentTemplate < templates.length - 1) {
      setCurrentTemplate(prev => prev + 1);
    }
    
    if (templateScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      templateScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Function to select a template
  const selectTemplate = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    toast.success(`Selected template: ${template.name}`);
  };

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const resumeData = await api.resume.get();
        setResume(resumeData);
      } catch (error) {
        console.error('Error fetching resume:', error);
        toast.error('Failed to load resume data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, []);

  const handleSaveResume = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save your resume');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await api.resume.save(resume);
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResume(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() === '') return;
    setResume(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', company: '', location: '', startDate: '', endDate: '', description: '' }
      ]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', institution: '', location: '', graduationDate: '', gpa: '' }
      ]
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Handle resume download in different formats
  const handleDownloadResume = (format: 'pdf' | 'docx' | 'xlsx' | 'png' | 'svg') => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
    
    if (!resume.fullName) {
      toast.error('Please enter at least your name before downloading');
      return;
    }
    
    // Show loading toast
    const loadingToast = toast.loading(`Preparing ${format.toUpperCase()} download...`);
    
    try {
      // In a real application, we would implement actual conversion logic here
      // For example, using libraries like html2pdf, html2canvas, etc.
      
      setTimeout(() => {
        // Replace with actual download implementation based on format
        toast.dismiss(loadingToast);
        
        const fileName = `${resume.fullName.replace(/\s+/g, '_')}_resume.${format}`;
        
        // This is a placeholder for the actual download implementation
        // In a real app, you would generate the file and trigger the download
        
        toast.success(`Resume downloaded as ${format.toUpperCase()}`);
        
        // Tracking download event
        console.log(`Resume downloaded in ${format} format`);
      }, 1500);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`Failed to download as ${format.toUpperCase()}. Please try again.`);
      console.error(`Download error (${format}):`, error);
    }
  };

  // Handle PDF download - using actual print functionality
  const handleDownloadPDF = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
    
    if (!resume.fullName) {
      toast.error('Please enter at least your name before downloading');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Get the resume preview element
      const resumeContainer = document.querySelector('.max-h-\\[600px\\]');
      
      if (!resumeContainer) {
        toast.error('Could not locate the resume element');
        setIsDownloading(false);
        return;
      }

      // Deep clone the element to avoid modifying the original
      const clonedContent = resumeContainer.cloneNode(true) as HTMLElement;
      
      // Remove data attributes and component metadata from the clone
      const removeDataAttributes = (element: HTMLElement) => {
        // Remove all data-* attributes
        Array.from(element.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            element.removeAttribute(attr.name);
          }
        });
        
        // Process children recursively
        Array.from(element.children).forEach(child => {
          removeDataAttributes(child as HTMLElement);
        });
      };
      
      removeDataAttributes(clonedContent);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups and try again.');
        setIsDownloading(false);
        return;
      }

      // Extract all stylesheets from the current document
      const stylesheets = Array.from(document.styleSheets);
      let cssText = '';
      
      // Get all CSS rules from stylesheets
      stylesheets.forEach(sheet => {
        try {
          if (sheet.cssRules) {
            cssText += Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          }
        } catch (e) {
          console.log('Error accessing stylesheet', e);
        }
      });
      
      // Write to the new window with appropriate styles and resume content
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${resume.fullName} - Resume</title>
            <style>${cssText}</style>
            <style>
              @page {
                size: 8.5in 11in;
                margin: 0.5in;
              }
              body { 
                padding: 0;
                margin: 0;
                background-color: white;
                font-family: Arial, sans-serif;
              }
              .resume-container {
                max-width: 100%;
                margin: 0 auto;
                padding: 0;
                background-color: white;
                box-shadow: none;
              }
              /* Preserve bullet points and styling */
              .rounded-full {
                border-radius: 9999px;
              }
              .bg-gray-500 {
                background-color: #6b7280;
              }
              .text-gray-800 {
                color: #1f2937;
              }
              .font-serif {
                font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
              }
              .text-xs {
                font-size: 0.75rem;
                line-height: 1rem;
              }
              .text-sm {
                font-size: 0.875rem;
                line-height: 1.25rem;
              }
              .text-gray-600 {
                color: #4b5563;
              }
              .text-gray-700 {
                color: #374151;
              }
              /* Ensure printing works properly */
              @media print {
                body { 
                  padding: 0;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .resume-container {
                  width: 100%;
                  box-shadow: none;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="resume-container">
              ${clonedContent.innerHTML}
            </div>
            <script>
              // Automatically trigger print when content is loaded
              window.onload = function() {
                setTimeout(() => {
                  window.focus();
                  window.print();
                  
                  // Listen for print dialog close
                  const checkPrintDialogClosed = setInterval(() => {
                    if (document.readyState === 'complete') {
                      try {
                        if (!window.document.hasFocus()) {
                          window.opener.postMessage('pdfCompleted', '*');
                          clearInterval(checkPrintDialogClosed);
                        }
                      } catch (e) {
                        // Error with focus checking
                        window.opener.postMessage('pdfCompleted', '*');
                        clearInterval(checkPrintDialogClosed);
                      }
                    }
                  }, 500);
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Listen for message from print window
      const messageListener = (event) => {
        if (event.data === 'pdfCompleted') {
          setIsDownloading(false);
          window.removeEventListener('message', messageListener);
          toast.success('PDF generation completed');
        }
      };
      
      window.addEventListener('message', messageListener);
      
      // Fallback in case the print window doesn't send a message
      setTimeout(() => {
        setIsDownloading(false);
        window.removeEventListener('message', messageListener);
      }, 10000);
      
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to generate PDF');
      setIsDownloading(false);
    }
  };
  
  // Handle Text download - actual download implementation
  const handleDownloadText = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
    
    if (!resume.fullName) {
      toast.error('Please enter at least your name before downloading');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Get the resume preview element
      const resumeContainer = document.querySelector('.max-h-\\[600px\\]') as HTMLElement;
      
      if (!resumeContainer) {
        toast.error('Could not locate the resume element');
        setIsDownloading(false);
        return;
      }
      
      // Generate plain text version
      let plainText = '';
      
      // Function to extract text content
      const extractText = (element: Element) => {
        // Skip hidden elements
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return;
        }
        
        // Add element text content
        if (element.textContent && element.textContent.trim()) {
          const tag = element.tagName.toLowerCase();
          const text = element.textContent.trim();
          
          // Format based on tag
          switch (tag) {
            case 'h1':
              plainText += '\n\n' + text.toUpperCase() + '\n' + '='.repeat(text.length) + '\n\n';
              break;
            case 'h2':
              plainText += '\n\n' + text + '\n' + '-'.repeat(text.length) + '\n\n';
              break;
            case 'h3':
              plainText += '\n\n' + text + '\n\n';
              break;
            case 'li':
              plainText += '* ' + text + '\n';
              break;
            case 'p':
              plainText += text + '\n\n';
              break;
            default:
              // For spans and other inline elements, check parent
              if (!['div', 'section', 'article', 'header', 'footer'].includes(tag)) {
                plainText += text + ' ';
              }
          }
        }
        
        // Process child elements
        Array.from(element.children).forEach(child => {
          extractText(child);
        });
        
        // Add line breaks after certain elements
        if (['div', 'section', 'article'].includes(element.tagName.toLowerCase()) && 
            element.children.length > 0 && 
            plainText && 
            !plainText.endsWith('\n\n')) {
          plainText += '\n';
        }
      };
      
      // Start text extraction
      extractText(resumeContainer);
      
      // Clean up extra whitespace
      plainText = plainText
        .replace(/\n\s+\n/g, '\n\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      // Add header with contact information
      const header = 
        `${resume.fullName.toUpperCase()}\n` +
        `${'='.repeat(resume.fullName.length)}\n` +
        `${resume.email ? 'Email: ' + resume.email + '\n' : ''}` +
        `${resume.phone ? 'Phone: ' + resume.phone + '\n' : ''}` +
        `${resume.address ? 'Location: ' + resume.address + '\n' : ''}\n`;
      
      plainText = header + plainText;
      
      // Create a Blob with the text
      const blob = new Blob([plainText], {type: 'text/plain'});
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${resume.fullName.replace(/\s+/g, '_')}_resume.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      setIsDownloading(false);
      toast.success('Text file downloaded successfully');
      
    } catch (error) {
      console.error('Text download error:', error);
      toast.error('Failed to download text file');
      setIsDownloading(false);
    }
  };
  
  // Handle PNG download - actual download implementation
  const handleDownloadPNG = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
    
    if (!resume.fullName) {
      toast.error('Please enter at least your name before downloading');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Get the resume preview element
      const resumeContainer = document.querySelector('.max-h-\\[600px\\]') as HTMLElement;
      
      if (!resumeContainer) {
        toast.error('Could not locate the resume element');
        setIsDownloading(false);
        return;
      }
      
      // Deep clone the element to avoid modifying the original
      const clonedContent = resumeContainer.cloneNode(true) as HTMLElement;
      
      // Remove data attributes and component metadata from the clone
      const removeDataAttributes = (element: HTMLElement) => {
        // Remove all data-* attributes
        Array.from(element.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            element.removeAttribute(attr.name);
          }
        });
        
        // Process children recursively
        Array.from(element.children).forEach(child => {
          removeDataAttributes(child as HTMLElement);
        });
      };
      
      removeDataAttributes(clonedContent);
      
      // Use browser's print functionality to create a new window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups and try again.');
        setIsDownloading(false);
        return;
      }
      
      // Extract all stylesheets from the current document
      const stylesheets = Array.from(document.styleSheets);
      let cssText = '';
      
      // Get all CSS rules from stylesheets
      stylesheets.forEach(sheet => {
        try {
          if (sheet.cssRules) {
            cssText += Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          }
        } catch (e) {
          console.log('Error accessing stylesheet', e);
        }
      });
      
      // Write to the new window with appropriate styles and resume content
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${resume.fullName} - Resume</title>
            <style>${cssText}</style>
            <style>
              body { 
                margin: 0;
                padding: 20px;
                font-family: 'Arial', sans-serif;
                background-color: white;
              }
              .resume-container {
                width: 8.5in;
                height: 11in;
                margin: 0 auto;
                padding: 0.5in;
                box-shadow: none;
                background-color: white;
                position: relative;
              }
              /* Preserve bullet points and styling */
              .rounded-full {
                border-radius: 9999px;
              }
              .bg-gray-500 {
                background-color: #6b7280;
              }
              .text-gray-800 {
                color: #1f2937;
              }
              .font-serif {
                font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
              }
              .text-xs {
                font-size: 0.75rem;
                line-height: 1rem;
              }
              .text-sm {
                font-size: 0.875rem;
                line-height: 1.25rem;
              }
              .text-gray-600 {
                color: #4b5563;
              }
              .text-gray-700 {
                color: #374151;
              }
              h1, h2, h3, h4, h5, h6, p {
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div class="resume-container" id="capture-element">
              ${clonedContent.innerHTML}
            </div>
            <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
            <script>
              // Implement PNG capture in the new window
              window.onload = function() {
                // Wait for fonts and resources to load
                setTimeout(() => {
                  const captureElement = document.getElementById('capture-element');
                  
                  // Use html2canvas library
                  html2canvas(captureElement, {
                    scale: 2, // 2x for better quality
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "white",
                    logging: false,
                    // Preserve fonts, colors, and styling
                    onclone: (clonedDoc) => {
                      Array.from(clonedDoc.querySelectorAll('*')).forEach(el => {
                        if (el.classList.contains('rounded-full')) {
                          el.style.borderRadius = '9999px';
                        }
                      });
                    }
                  }).then(canvas => {
                    // Get the PNG data
                    const pngData = canvas.toDataURL('image/png');
                    
                    // Create download link
                    const downloadLink = document.createElement('a');
                    downloadLink.href = pngData;
                    downloadLink.download = '${resume.fullName.replace(/\s+/g, '_')}_resume.png';
                    
                    // Add to document and trigger click
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    
                    // Send message back to parent window
                    window.opener.postMessage('pngDownloadComplete', '*');
                    
                    setTimeout(() => {
                      window.close();
                    }, 100);
                  });
                }, 1000); // Give enough time for fonts to load
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Listen for message from the new window
      const messageListener = (event) => {
        if (event.data === 'pngDownloadComplete') {
          setIsDownloading(false);
          toast.success('PNG image downloaded successfully');
          window.removeEventListener('message', messageListener);
        }
      };
      
      window.addEventListener('message', messageListener);
      
      // Fallback in case window doesn't communicate back
      setTimeout(() => {
        window.removeEventListener('message', messageListener);
        setIsDownloading(false);
      }, 15000);
      
    } catch (error) {
      console.error('PNG download error:', error);
      toast.error('Failed to download PNG');
      setIsDownloading(false);
    }
  };
  
  // Handle SVG download - actual download implementation
  const handleDownloadSVG = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
    
    if (!resume.fullName) {
      toast.error('Please enter at least your name before downloading');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Get the resume preview element
      const resumeContainer = document.querySelector('.max-h-\\[600px\\]') as HTMLElement;
      
      if (!resumeContainer) {
        toast.error('Could not locate the resume element');
        setIsDownloading(false);
        return;
      }
      
      // Deep clone the element to avoid modifying the original
      const clonedContent = resumeContainer.cloneNode(true) as HTMLElement;
      
      // Remove data attributes and component metadata from the clone
      const removeDataAttributes = (element: HTMLElement) => {
        // Remove all data-* attributes
        Array.from(element.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            element.removeAttribute(attr.name);
          }
        });
        
        // Process children recursively
        Array.from(element.children).forEach(child => {
          removeDataAttributes(child as HTMLElement);
        });
      };
      
      removeDataAttributes(clonedContent);
      
      // Use browser's print functionality to create a new window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups and try again.');
        setIsDownloading(false);
        return;
      }
      
      // Extract all stylesheets from the current document
      const stylesheets = Array.from(document.styleSheets);
      let cssText = '';
      
      // Get all CSS rules from stylesheets
      stylesheets.forEach(sheet => {
        try {
          if (sheet.cssRules) {
            cssText += Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          }
        } catch (e) {
          console.log('Error accessing stylesheet', e);
        }
      });
      
      // Write to the new window with appropriate styles and resume content
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${resume.fullName} - Resume</title>
            <style>${cssText}</style>
            <style>
              body { 
                margin: 0;
                padding: 20px;
                font-family: 'Arial', sans-serif;
                background-color: white;
              }
              .resume-container {
                width: 8.5in;
                height: 11in;
                margin: 0 auto;
                padding: 0.5in;
                box-shadow: none;
                background-color: white;
                position: relative;
              }
              /* Preserve bullet points and styling */
              .rounded-full {
                border-radius: 9999px;
              }
              .bg-gray-500 {
                background-color: #6b7280;
              }
              .text-gray-800 {
                color: #1f2937;
              }
              .font-serif {
                font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
              }
              .text-xs {
                font-size: 0.75rem;
                line-height: 1rem;
              }
              .text-sm {
                font-size: 0.875rem;
                line-height: 1.25rem;
              }
              .text-gray-600 {
                color: #4b5563;
              }
              .text-gray-700 {
                color: #374151;
              }
              h1, h2, h3, h4, h5, h6, p {
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div class="resume-container" id="capture-element">
              ${clonedContent.innerHTML}
            </div>
            <script>
              // Implement SVG creation in the new window
              window.onload = function() {
                // Wait for fonts and resources to load
                setTimeout(() => {
                  const captureElement = document.getElementById('capture-element');
                  
                  // Create SVG with proper namespace
                  const svgNS = "http://www.w3.org/2000/svg";
                  const xmlNS = "http://www.w3.org/1999/xhtml";
                  
                  // Get the exact styling
                  const cssStyleText = document.querySelector('style').outerHTML;
                  
                  // Create SVG with all styling preserved
                  const svgContent = 
                    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
                    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
                    '<svg xmlns="' + svgNS + '" ' +
                    'width="' + captureElement.offsetWidth + '" ' +
                    'height="' + captureElement.offsetHeight + '" ' +
                    'viewBox="0 0 ' + captureElement.offsetWidth + ' ' + captureElement.offsetHeight + '">' +
                    '<foreignObject width="100%" height="100%" x="0" y="0" xmlns="' + xmlNS + '">' +
                    '<html xmlns="http://www.w3.org/1999/xhtml">' +
                    '<head>' +
                    cssStyleText +
                    '</head>' +
                    '<body style="margin:0; padding:0;">' +
                    captureElement.outerHTML +
                    '</body>' +
                    '</html>' +
                    '</foreignObject>' +
                    '</svg>';
                  
                  // Create a Blob from the SVG data
                  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                  
                  // Create download link
                  const downloadLink = document.createElement('a');
                  downloadLink.href = URL.createObjectURL(blob);
                  downloadLink.download = '${resume.fullName.replace(/\s+/g, '_')}_resume.svg';
                  
                  // Add to document and trigger click
                  document.body.appendChild(downloadLink);
                  downloadLink.click();
                  document.body.removeChild(downloadLink);
                  
                  // Send message back to parent window
                  window.opener.postMessage('svgDownloadComplete', '*');
                  
                  setTimeout(() => {
                    window.close();
                  }, 100);
                }, 1000); // Wait for fonts to load
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Listen for message from the new window
      const messageListener = (event) => {
        if (event.data === 'svgDownloadComplete') {
          setIsDownloading(false);
          toast.success('SVG file downloaded successfully');
          window.removeEventListener('message', messageListener);
        }
      };
      
      window.addEventListener('message', messageListener);
      
      // Fallback in case window doesn't communicate back
      setTimeout(() => {
        window.removeEventListener('message', messageListener);
        setIsDownloading(false);
      }, 15000);
      
    } catch (error) {
      console.error('SVG download error:', error);
      toast.error('Failed to download SVG');
      setIsDownloading(false);
    }
  };

  // Handle Word Document download - actual download implementation
  const handleDownloadWord = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
    
    if (!resume.fullName) {
      toast.error('Please enter at least your name before downloading');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Get the resume preview element
      const resumeContainer = document.querySelector('.max-h-\\[600px\\]') as HTMLElement;
      
      if (!resumeContainer) {
        toast.error('Could not locate the resume element');
        setIsDownloading(false);
        return;
      }
      
      // Deep clone the element to avoid modifying the original
      const clonedContent = resumeContainer.cloneNode(true) as HTMLElement;
      
      // Remove data attributes and component metadata from the clone
      const removeDataAttributes = (element: HTMLElement) => {
        // Remove all data-* attributes
        Array.from(element.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            element.removeAttribute(attr.name);
          }
        });
        
        // Process children recursively
        Array.from(element.children).forEach(child => {
          removeDataAttributes(child as HTMLElement);
        });
      };
      
      removeDataAttributes(clonedContent);
      
      // Extract all stylesheets from the current document
      const stylesheets = Array.from(document.styleSheets);
      let cssText = '';
      
      // Get all CSS rules from stylesheets
      stylesheets.forEach(sheet => {
        try {
          if (sheet.cssRules) {
            cssText += Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          }
        } catch (e) {
          console.log('Error accessing stylesheet', e);
        }
      });
      
      // Create Word-compatible HTML document with mso (Microsoft Office) namespaces
      const wordHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word'
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${resume.fullName} - Resume</title>
          <style>
            ${cssText}
            /* Word-specific styles */
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .resume-container {
              width: 100%;
              padding: 0.5in;
            }
            /* Preserve bullet points and styling */
            .rounded-full {
              border-radius: 9999px !important;
            }
            .bg-gray-500 {
              background-color: #6b7280 !important;
            }
            .text-gray-800 {
              color: #1f2937 !important;
            }
            .font-serif {
              font-family: 'Times New Roman', Times, serif !important;
            }
            .text-xs {
              font-size: 0.75rem !important;
              line-height: 1rem !important;
            }
            .text-sm {
              font-size: 0.875rem !important;
              line-height: 1.25rem !important;
            }
            .text-gray-600 {
              color: #4b5563 !important;
            }
            .text-gray-700 {
              color: #374151 !important;
            }
            h1, h2, h3, h4, h5, h6, p {
              margin-top: 0;
              margin-bottom: 0;
            }
            /* Microsoft Word specific settings */
            @page {
              size: 8.5in 11in;
              margin: 0.5in;
              mso-header-margin: 0.5in;
              mso-footer-margin: 0.5in;
            }
            td, th, div, p {
              mso-line-height-rule: exactly;
            }
            table {
              border-collapse: collapse;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
          </style>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
        </head>
        <body>
          <div class="resume-container">
            ${clonedContent.innerHTML}
          </div>
        </body>
        </html>
      `;
      
      // Create a Blob with the Word HTML
      const blob = new Blob([wordHtml], {type: 'application/msword'});
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${resume.fullName.replace(/\s+/g, '_')}_resume.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      setIsDownloading(false);
      toast.success('Word document downloaded successfully');
      
    } catch (error) {
      console.error('Word download error:', error);
      toast.error('Failed to download Word document');
      setIsDownloading(false);
    }
  };
  
  // Handle Google Docs download - actual download implementation
  const handleDownloadGoogleDocs = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
    
    if (!resume.fullName) {
      toast.error('Please enter at least your name before downloading');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Get the resume preview element
      const resumeContainer = document.querySelector('.max-h-\\[600px\\]') as HTMLElement;
      
      if (!resumeContainer) {
        toast.error('Could not locate the resume element');
        setIsDownloading(false);
        return;
      }
      
      // Deep clone the element to avoid modifying the original
      const clonedContent = resumeContainer.cloneNode(true) as HTMLElement;
      
      // Remove data attributes and component metadata from the clone
      const removeDataAttributes = (element: HTMLElement) => {
        // Remove all data-* attributes
        Array.from(element.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            element.removeAttribute(attr.name);
          }
        });
        
        // Process children recursively
        Array.from(element.children).forEach(child => {
          removeDataAttributes(child as HTMLElement);
        });
      };
      
      removeDataAttributes(clonedContent);
      
      // Extract all stylesheets from the current document
      const stylesheets = Array.from(document.styleSheets);
      let cssText = '';
      
      // Get all CSS rules from stylesheets
      stylesheets.forEach(sheet => {
        try {
          if (sheet.cssRules) {
            cssText += Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          }
        } catch (e) {
          console.log('Error accessing stylesheet', e);
        }
      });
      
      // Create Google Docs compatible HTML document
      const gdocsHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${resume.fullName} - Resume for Google Docs</title>
          <style>
            ${cssText}
            /* Google Docs specific styles */
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .resume-container {
              width: 100%;
              padding: 0.5in;
            }
            /* Preserve bullet points and styling */
            .rounded-full {
              border-radius: 9999px !important;
            }
            .bg-gray-500 {
              background-color: #6b7280 !important;
            }
            .text-gray-800 {
              color: #1f2937 !important;
            }
            .font-serif {
              font-family: 'Times New Roman', Times, serif !important;
            }
            .text-xs {
              font-size: 0.75rem !important;
              line-height: 1rem !important;
            }
            .text-sm {
              font-size: 0.875rem !important;
              line-height: 1.25rem !important;
            }
            .text-gray-600 {
              color: #4b5563 !important;
            }
            .text-gray-700 {
              color: #374151 !important;
            }
            h1, h2, h3, h4, h5, h6, p {
              margin-top: 0;
              margin-bottom: 0;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${clonedContent.innerHTML}
          </div>
          <script>
            // Add instructions for users
            window.onload = function() {
              const instructions = document.createElement('div');
              instructions.style.margin = '20px';
              instructions.style.padding = '15px';
              instructions.style.backgroundColor = '#f0f4f8';
              instructions.style.border = '1px solid #d0d7de';
              instructions.style.borderRadius = '5px';
              instructions.innerHTML = '<h2>How to import this file to Google Docs:</h2>' +
                '<ol>' +
                '<li>Sign in to your Google account and open Google Docs</li>' +
                '<li>Click on "File" > "Open" or create a new document</li>' +
                '<li>Click on "Upload" and select this HTML file</li>' +
                '<li>The resume should appear in Google Docs</li>' +
                '<li>You may need to adjust some formatting</li>' +
                '</ol>';
              document.body.prepend(instructions);
            }
          </script>
        </body>
        </html>
      `;
      
      // Create a Blob with the Google Docs compatible HTML
      const blob = new Blob([gdocsHtml], {type: 'text/html'});
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${resume.fullName.replace(/\s+/g, '_')}_resume_for_gdocs.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      // Open Google Docs in a new tab for manual import
      window.open('https://docs.google.com/', '_blank');
      
      setIsDownloading(false);
      toast.success('HTML file for Google Docs downloaded. Please open Google Docs to import it.');
      
    } catch (error) {
      console.error('Google Docs download error:', error);
      toast.error('Failed to download for Google Docs');
      setIsDownloading(false);
    }
  };

  // Function to toggle section state
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Function to move a section up in the order
  const moveSectionUp = (sectionKey: string) => {
    setSectionOrder(prevOrder => {
      const index = prevOrder.indexOf(sectionKey);
      if (index <= 0) return prevOrder; // Already at the top
      
      const newOrder = [...prevOrder];
      const temp = newOrder[index - 1];
      newOrder[index - 1] = newOrder[index];
      newOrder[index] = temp;
      return newOrder;
    });
  };
  
  // Function to move a section down in the order
  const moveSectionDown = (sectionKey: string) => {
    setSectionOrder(prevOrder => {
      const index = prevOrder.indexOf(sectionKey);
      if (index === -1 || index >= prevOrder.length - 1) return prevOrder; // Already at the bottom
      
      const newOrder = [...prevOrder];
      const temp = newOrder[index + 1];
      newOrder[index + 1] = newOrder[index];
      newOrder[index] = temp;
      return newOrder;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-blue-100 rounded mb-3"></div>
          <div className="h-3 w-36 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Render form sections in the custom order
  const renderFormSections = () => {
    return sectionOrder.map(sectionKey => {
      switch (sectionKey) {
        case 'personalInfo':
          return (
            <GlassCard key="personalInfo" className="mb-6 overflow-hidden border-blue-100/50 shadow-lg">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 -mx-6 -mt-6 px-6 py-5 mb-6 border-b border-blue-100/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-blue-700">
                    <User className="h-5 w-5 mr-2" />
                    <h2 className="text-xl font-semibold text-blue-700">Personal Information</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Group the up/down arrows vertically */}
                    <div className="flex flex-col border border-gray-200 rounded overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => moveSectionUp('personalInfo')} 
                        className="text-blue-600 hover:bg-blue-50 p-1 transition-colors border-b border-gray-200"
                        aria-label="Move section up"
                        disabled={sectionOrder.indexOf('personalInfo') === 0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`h-4 w-4 ${sectionOrder.indexOf('personalInfo') === 0 ? 'text-gray-300' : ''}`}>
                          <path d="m18 15-6-6-6 6"></path>
                        </svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => moveSectionDown('personalInfo')} 
                        className="text-blue-600 hover:bg-blue-50 p-1 transition-colors"
                        aria-label="Move section down"
                        disabled={sectionOrder.indexOf('personalInfo') === sectionOrder.length - 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`h-4 w-4 ${sectionOrder.indexOf('personalInfo') === sectionOrder.length - 1 ? 'text-gray-300' : ''}`}>
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleSection('personalInfo')} 
                      className="text-blue-600 hover:bg-blue-50 rounded-full p-1 transition-colors"
                      aria-label={openSections.personalInfo ? 'Collapse section' : 'Expand section'}
                    >
                      {openSections.personalInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Your contact details will be used in your resume header.
                </p>
              </div>
              
              {openSections.personalInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={resume.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                  <div className="relative">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={resume.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                  />
                    <Mail className="h-4 w-4 text-gray-400 absolute right-3 bottom-3" />
                  </div>
                  <div className="relative">
                  <Input
                    label="Phone"
                    name="phone"
                    value={resume.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                  />
                    <Phone className="h-4 w-4 text-gray-400 absolute right-3 bottom-3" />
                  </div>
                  <div className="relative">
                  <Input
                    label="Location"
                    name="address"
                    value={resume.address}
                    onChange={handleChange}
                    placeholder="San Francisco, CA"
                  />
                    <MapPin className="h-4 w-4 text-gray-400 absolute right-3 bottom-3" />
                  </div>
                </div>
              )}
            </GlassCard>
          );
          
        case 'summary':
          return (
            <GlassCard key="summary" className="mb-6 overflow-hidden border-blue-100/50 shadow-lg">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 -mx-6 -mt-6 px-6 py-5 mb-6 border-b border-blue-100/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                      <line x1="4" y1="22" x2="4" y2="15"></line>
                    </svg>
                    <h2 className="text-xl font-semibold text-blue-700">Professional Summary</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Group the up/down arrows vertically */}
                    <div className="flex flex-col border border-gray-200 rounded overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => moveSectionUp('summary')} 
                        className="text-blue-600 hover:bg-blue-50 p-1 transition-colors border-b border-gray-200"
                        aria-label="Move section up"
                        disabled={sectionOrder.indexOf('summary') === 0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`h-4 w-4 ${sectionOrder.indexOf('summary') === 0 ? 'text-gray-300' : ''}`}>
                          <path d="m18 15-6-6-6 6"></path>
                        </svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => moveSectionDown('summary')} 
                        className="text-blue-600 hover:bg-blue-50 p-1 transition-colors"
                        aria-label="Move section down"
                        disabled={sectionOrder.indexOf('summary') === sectionOrder.length - 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`h-4 w-4 ${sectionOrder.indexOf('summary') === sectionOrder.length - 1 ? 'text-gray-300' : ''}`}>
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleSection('summary')} 
                      className="text-blue-600 hover:bg-blue-50 rounded-full p-1 transition-colors"
                      aria-label={openSections.summary ? 'Collapse section' : 'Expand section'}
                    >
                      {openSections.summary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Write a brief summary of your professional background and goals.
                </p>
              </div>
              
              {openSections.summary && (
                <div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Summary
                    </label>
                    <textarea
                      name="summary"
                      rows={4}
                      className="input-field w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors resize-none"
                      value={resume.summary}
                      onChange={handleChange}
                      placeholder="Summarize your professional background and key strengths..."
                    />
                    <p className="text-xs text-gray-500 mt-1">A concise 3-4 sentence summary of your professional background, skills, and career goals.</p>
                  </div>
                </div>
              )}
            </GlassCard>
          );
          
        case 'skills':
          return (
            <GlassCard key="skills" className="mb-6 overflow-hidden border-blue-100/50 shadow-lg">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 -mx-6 -mt-6 px-6 py-5 mb-6 border-b border-blue-100/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-blue-700">
                    <Briefcase className="h-5 w-5 mr-2" />
                    <h2 className="text-xl font-semibold text-blue-700">Skills</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Group the up/down arrows vertically */}
                    <div className="flex flex-col border border-gray-200 rounded overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => moveSectionUp('skills')} 
                        className="text-blue-600 hover:bg-blue-50 p-1 transition-colors border-b border-gray-200"
                        aria-label="Move section up"
                        disabled={sectionOrder.indexOf('skills') === 0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`h-4 w-4 ${sectionOrder.indexOf('skills') === 0 ? 'text-gray-300' : ''}`}>
                          <path d="m18 15-6-6-6 6"></path>
                        </svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => moveSectionDown('skills')} 
                        className="text-blue-600 hover:bg-blue-50 p-1 transition-colors"
                        aria-label="Move section down"
                        disabled={sectionOrder.indexOf('skills') === sectionOrder.length - 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`h-4 w-4 ${sectionOrder.indexOf('skills') === sectionOrder.length - 1 ? 'text-gray-300' : ''}`}>
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleSection('skills')} 
                      className="text-blue-600 hover:bg-blue-50 rounded-full p-1 transition-colors"
                      aria-label={openSections.skills ? 'Collapse section' : 'Expand section'}
                    >
                      {openSections.skills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  List the skills relevant to the positions you're applying for.
                </p>
              </div>
              
              {openSections.skills && (
                <div>
                  <div className="flex gap-2">
                    <Input
                      containerClassName="flex-1"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill (e.g., JavaScript)"
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {resume.skills.length === 0 ? (
                      <p className="text-gray-500 italic text-sm">Add your key skills to make your resume stand out</p>
                    ) : (
                      resume.skills.map((skill, index) => (
                      <div 
                        key={index} 
                          className="group flex items-center gap-1 py-1 px-3 bg-blue-50 text-blue-700 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                      >
                          <span>{skill}</span>
                        <button 
                            type="button"
                          onClick={() => removeSkill(index)} 
                            className="h-4 w-4 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors ml-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                      </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </GlassCard>
          );
          
        case 'experience':
          return (
            <GlassCard key="experience" className="mb-6 overflow-hidden border-blue-100/50 shadow-lg">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 -mx-6 -mt-6 px-6 py-5 mb-6 border-b border-blue-100/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-blue-700">
                    <Briefcase className="h-5 w-5 mr-2" />
                    <h2 className="text-xl font-semibold text-blue-700">Work Experience</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Group the up/down arrows vertically */}
                    <div className="flex flex-col border border-gray-200 rounded overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => moveSectionUp('experience')} 
                        className="text-blue-600 hover:bg-blue-50 p-1 transition-colors border-b border-gray-200"
                        aria-label="Move section up"
                        disabled={sectionOrder.indexOf('experience') === 0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`h-4 w-4 ${sectionOrder.indexOf('experience') === 0 ? 'text-gray-300' : ''}`}>
                          <path d="m18 15-6-6-6 6"></path>
                        </svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => moveSectionDown('experience')} 
                        className="text-blue-600 hover:bg-blue-50 p-1 transition-colors"
                        aria-label="Move section down"
                        disabled={sectionOrder.indexOf('experience') === sectionOrder.length - 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`h-4 w-4 ${sectionOrder.indexOf('experience') === sectionOrder.length - 1 ? 'text-gray-300' : ''}`}>
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleSection('experience')} 
                      className="text-blue-600 hover:bg-blue-50 rounded-full p-1 transition-colors"
                      aria-label={openSections.experience ? 'Collapse section' : 'Expand section'}
                    >
                      {openSections.experience ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <Button onClick={addExperience} size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Job
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Add your relevant work experience, starting with the most recent position.
                </p>
              </div>
              
              {openSections.experience && (
                <div>
                  {resume.experience.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 mb-3">No work experience added yet</p>
                      <Button onClick={addExperience} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Work Experience
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {resume.experience.map((exp, index) => (
                        <div 
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors relative"
                        >
                            <button 
                              onClick={() => removeExperience(index)}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Input
                              label="Job Title"
                              value={exp.title}
                              onChange={(e) => updateExperience(index, 'title', e.target.value)}
                              placeholder="Software Developer"
                            />
                            <Input
                              label="Company"
                              value={exp.company}
                              onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              placeholder="Acme Inc."
                            />
                            <Input
                              label="Location"
                              value={exp.location}
                              onChange={(e) => updateExperience(index, 'location', e.target.value)}
                              placeholder="San Francisco, CA"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                label="Start Date"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                placeholder="Jan 2020"
                              />
                              <Input
                                label="End Date"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                placeholder="Present"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Description
                            </label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              rows={3}
                              className="input-field w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors resize-none"
                              placeholder="Describe your responsibilities and achievements..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          );
          
        case 'education':
          return (
            <GlassCard key="education" className="mb-6 overflow-hidden border-blue-100/50 shadow-lg">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 -mx-6 -mt-6 px-6 py-5 mb-6 border-b border-blue-100/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-blue-700">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    <h2 className="text-xl font-semibold text-blue-700">Education</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Group the up/down arrows vertically */}
                    <div className="flex flex-col border border-gray-200 rounded overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => moveSectionUp('education')} 
                        className="text-blue-600 hover:bg-blue-50 p-1 transition-colors border-b border-gray-200"
                        aria-label="Move section up"
                        disabled={sectionOrder.indexOf('education') === 0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`h-4 w-4 ${sectionOrder.indexOf('education') === 0 ? 'text-gray-300' : ''}`}>
                          <path d="m18 15-6-6-6 6"></path>
                        </svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => moveSectionDown('education')} 
                        className="text-blue-600 hover:bg-blue-50 p-1 transition-colors"
                        aria-label="Move section down"
                        disabled={sectionOrder.indexOf('education') === sectionOrder.length - 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`h-4 w-4 ${sectionOrder.indexOf('education') === sectionOrder.length - 1 ? 'text-gray-300' : ''}`}>
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleSection('education')} 
                      className="text-blue-600 hover:bg-blue-50 rounded-full p-1 transition-colors"
                      aria-label={openSections.education ? 'Collapse section' : 'Expand section'}
                    >
                      {openSections.education ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <Button onClick={addEducation} size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Education
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  List your educational qualifications, including degrees, certifications, and courses.
                </p>
              </div>
              
              {openSections.education && (
                <div>
                  {resume.education.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <GraduationCap className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 mb-3">No education added yet</p>
                      <Button onClick={addEducation} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Education
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {resume.education.map((edu, index) => (
                        <div 
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors relative"
                        >
                            <button 
                              onClick={() => removeEducation(index)}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Degree"
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              placeholder="Bachelor of Science in Computer Science"
                            />
                            <Input
                              label="Institution"
                              value={edu.institution}
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                              placeholder="University of California, Berkeley"
                            />
                            <Input
                              label="Location"
                              value={edu.location}
                              onChange={(e) => updateEducation(index, 'location', e.target.value)}
                              placeholder="Berkeley, CA"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                label="Graduation Date"
                                value={edu.graduationDate}
                                onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                                placeholder="May 2019"
                              />
                              <Input
                                label="GPA"
                                value={edu.gpa}
                                onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                placeholder="3.8/4.0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          );
          
        default:
          return null;
      }
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-light/20 to-background pb-20">
        <Navbar />
        
        <div className="container mx-auto px-4 md:px-6 pt-28">
          <div className="flex flex-col md:flex-row justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Resume Builder</h1>
              <p className="text-muted-foreground max-w-2xl">
                Create a professional resume that highlights your skills and experience. Your resume will be used to automatically apply to jobs.
              </p>
            </div>
          </div>
          
          {/* Template Selection Section */}
          <GlassCard className="mb-10 overflow-hidden border-blue-100/50 shadow-lg">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 -mx-6 -mt-6 px-6 py-5 mb-6 border-b border-blue-100/50">
              <div className="flex items-center mb-2 text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="2" width="12" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12" y2="18.01"></line>
                  <line x1="9" y1="6" x2="15" y2="6"></line>
                  <line x1="9" y1="10" x2="15" y2="10"></line>
                  <line x1="9" y1="14" x2="15" y2="14"></line>
                </svg>
                <h2 className="text-2xl font-semibold text-blue-700">Choose resume template</h2>
              </div>
              <p className="text-muted-foreground">
                Select a template that best represents your professional style. Your resume will be formatted accordingly.
              </p>
            </div>
            
            <div className="relative">
              {/* Left navigation button */}
              <button 
                onClick={() => scrollTemplates('left')}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-3 shadow-md transition-all duration-200 ${currentTemplate > 0 ? 'hover:scale-110 hover:shadow-lg' : ''}`}
                aria-label="Previous template"
                style={{ 
                  opacity: currentTemplate === 0 ? 0.5 : 1, 
                  cursor: currentTemplate === 0 ? 'not-allowed' : 'pointer' 
                }}
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>

              {/* Right navigation button */}
              <button 
                onClick={() => scrollTemplates('right')}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-3 shadow-md transition-all duration-200 ${currentTemplate < templates.length - 1 ? 'hover:scale-110 hover:shadow-lg' : ''}`}
                aria-label="Next template"
                style={{ 
                  opacity: currentTemplate === templates.length - 1 ? 0.5 : 1, 
                  cursor: currentTemplate === templates.length - 1 ? 'not-allowed' : 'pointer' 
                }}
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>

              {/* Templates container */}
              <div 
                ref={templateScrollRef}
                className="overflow-x-auto py-4 hide-scrollbar"
                style={{
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none'
                }}
              >
                <div className="flex gap-6 px-4 min-w-max">
                  {templates.map((template) => (
                    <div key={template.id} className="w-64 md:w-72 flex-shrink-0">
                      <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full group">
                        <div className={`relative h-80 bg-gradient-to-r ${template.bgColor} p-4 flex items-center justify-center overflow-hidden`}>
                          {template.popular && (
                            <div className="absolute top-3 right-3 bg-yellow-400 text-xs font-semibold text-yellow-900 px-2 py-1 rounded-full">
                              Popular
                            </div>
                          )}
                          {template.new && (
                            <div className="absolute top-3 right-3 bg-blue-400 text-xs font-semibold text-blue-900 px-2 py-1 rounded-full">
                              New
                            </div>
                          )}
                          {template.featured && (
                            <div className="absolute top-3 right-3 bg-orange-400 text-xs font-semibold text-orange-900 px-2 py-1 rounded-full z-10">
                              Featured
                            </div>
                          )}
                          <div className="w-48 h-64 bg-white rounded-lg shadow-md p-4 flex flex-col gap-2 group-hover:scale-105 transition-transform">
                            {/* Template preview - simplified versions */}
                            {template.id === 1 && (
                              <>
                                <div className="h-6 bg-blue-500 rounded w-full"></div>
                                <div className="h-4 bg-gray-800 rounded w-3/4 mt-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6 mt-1"></div>
                                <div className="h-4 bg-gray-800 rounded w-1/2 mt-4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
                              </>
                            )}
                            {template.id === 2 && (
                              <>
                                <div className="flex gap-2 mb-2">
                                  <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
                                  <div className="flex flex-col justify-center">
                                    <div className="h-4 bg-gray-800 rounded w-24"></div>
                                    <div className="h-3 bg-gray-400 rounded w-20 mt-1"></div>
                                  </div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
                                <div className="h-4 bg-gray-800 rounded w-1/2 mt-3"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                              </>
                            )}
                            {template.id === 3 && (
                              <>
                                <div className="flex justify-between items-start">
                                  <div className="h-10 w-32 bg-green-600 rounded"></div>
                                  <div className="h-6 w-6 bg-green-400 rounded-full"></div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6 mt-1"></div>
                                <div className="h-4 bg-green-600 rounded w-1/3 mt-3"></div>
                                <div className="flex gap-1 mt-2">
                                  <div className="h-2 bg-green-200 rounded-full w-8"></div>
                                  <div className="h-2 bg-green-200 rounded-full w-8"></div>
                                  <div className="h-2 bg-green-200 rounded-full w-8"></div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-3"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                              </>
                            )}
                            {template.id === 4 && (
                              <>
                                <div className="h-8 bg-purple-600 rounded-r-full w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-3"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6 mt-1"></div>
                                <div className="h-4 bg-purple-600 rounded-r-full w-1/2 mt-3"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
                                <div className="h-4 bg-purple-600 rounded-r-full w-1/3 mt-3"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6 mt-2"></div>
                              </>
                            )}
                            {template.id === 5 && (
                              <>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="h-6 w-32 bg-orange-500 rounded"></div>
                                  <div className="h-6 w-6 bg-orange-300 rounded-full"></div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6 mt-1"></div>
                                <div className="mt-3 flex gap-1">
                                  <div className="flex-1">
                                    <div className="h-4 bg-orange-500 rounded w-full"></div>
                                    <div className="h-2 bg-orange-200 rounded-full w-full mt-1"></div>
                                    <div className="h-2 bg-orange-100 rounded-full w-3/4 mt-1"></div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="h-4 bg-orange-500 rounded w-full"></div>
                                    <div className="h-2 bg-orange-200 rounded-full w-full mt-1"></div>
                                    <div className="h-2 bg-orange-100 rounded-full w-3/4 mt-1"></div>
                                  </div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-3"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
                              </>
                            )}
                            {template.id === 6 && (
                              <>
                                <div className="h-8 w-8 bg-sky-600 rounded-lg mb-2"></div>
                                <div className="flex gap-1">
                                  <div className="h-4 w-1 bg-sky-600"></div>
                                  <div>
                                    <div className="h-3 bg-gray-800 rounded w-24"></div>
                                    <div className="h-2 bg-gray-400 rounded w-20 mt-1"></div>
                                  </div>
                                </div>
                                <div className="flex gap-1 mt-2">
                                  <div className="h-4 w-1 bg-sky-400"></div>
                                  <div>
                                    <div className="h-3 bg-gray-800 rounded w-28"></div>
                                    <div className="h-2 bg-gray-400 rounded w-20 mt-1"></div>
                                  </div>
                                </div>
                                <div className="flex gap-1 mt-2">
                                  <div className="h-4 w-1 bg-sky-300"></div>
                                  <div>
                                    <div className="h-3 bg-gray-800 rounded w-32"></div>
                                    <div className="h-2 bg-gray-400 rounded w-20 mt-1"></div>
                                  </div>
                                </div>
                                <div className="h-1 bg-gray-200 w-full my-2"></div>
                                <div className="grid grid-cols-2 gap-1 mt-1">
                                  <div className="h-2 bg-sky-200 rounded-full"></div>
                                  <div className="h-2 bg-sky-200 rounded-full"></div>
                                  <div className="h-2 bg-sky-200 rounded-full"></div>
                                  <div className="h-2 bg-sky-200 rounded-full"></div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{template.name}</h3>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < template.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                          <button 
                            onClick={() => selectTemplate(template)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <File className="h-4 w-4" /> Use This Template
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
          
            <div className="flex justify-center mt-6 gap-2">
              {templates.map((_, index) => (
                <button
                  key={index}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    currentTemplate === index ? 'bg-blue-600 w-5' : 'bg-gray-300 hover:bg-blue-300'
                  }`}
                  aria-label={`Go to template ${index + 1}`}
                  onClick={() => {
                    setCurrentTemplate(index);
                    if (templateScrollRef.current) {
                      templateScrollRef.current.scrollTo({
                        left: index * 300,
                        behavior: 'smooth'
                      });
                    }
                  }}
                />
              ))}
            </div>
          </GlassCard>
          
          {/* Selected template indicator */}
          {selectedTemplate && (
            <div className="mb-8 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center text-blue-700">
              <File className="h-5 w-5 mr-2" />
              <span className="font-medium">Selected template: </span>
              <span className="ml-1">{selectedTemplate.name}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="md:col-span-2 space-y-8">
              {renderFormSections()}
            </div>
            
            {/* Preview Section */}
            <div className="md:col-span-1">
              <div className="sticky top-28">
                <GlassCard className="border-blue-100/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-blue-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                      <h2 className="text-xl font-semibold">Resume Preview</h2>
                    </div>
                    <div className="relative group">
                      <button 
                        className={`flex items-center gap-1 ${isDownloading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'} px-3 py-1.5 rounded-md border border-blue-200 transition-colors`}
                        aria-label="Download resume"
                        disabled={isDownloading || !selectedTemplate}
                      >
                        {isDownloading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-1"></div>
                            <span className="text-sm font-medium">Downloading...</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span className="text-sm font-medium">Download</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </>
                        )}
                      </button>
                      
                      {!isDownloading && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <ul className="py-1">
                            <li>
                              <button 
                                onClick={handleDownloadPDF}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                  <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/>
                                </svg>
                                PDF Format
                              </button>
                            </li>
                            <li>
                              <button 
                                onClick={handleDownloadWord}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                  <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/>
                                </svg>
                                Word Document
                              </button>
                            </li>
                            <li>
                              <button 
                                onClick={handleDownloadGoogleDocs}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                  <polyline points="14 2 14 8 20 8"/>
                                  <path d="M8 13h2"/>
                                  <path d="M8 17h2"/>
                                  <path d="M14 13h2"/>
                                  <path d="M14 17h2"/>
                                </svg>
                                Google Docs
                              </button>
                            </li>
                            <li>
                              <button 
                                onClick={handleDownloadText}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                  <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/>
                                </svg>
                                Plain Text
                              </button>
                            </li>
                            <li>
                              <button 
                                onClick={handleDownloadPNG}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                  <circle cx="8.5" cy="8.5" r="1.5"/>
                                  <polyline points="21 15 16 10 5 21"/>
                                </svg>
                                PNG Image
                              </button>
                            </li>
                            <li>
                              <button 
                                onClick={handleDownloadSVG}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                                  <line x1="12" y1="22" x2="12" y2="15.5"/>
                                  <polyline points="22 8.5 12 15.5 2 8.5"/>
                                </svg>
                                SVG Vector
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md bg-white p-4 shadow-inner overflow-auto max-h-[600px]">
                    {/* Dynamic Template Preview */}
                    {!selectedTemplate && (
                      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <File className="h-12 w-12 mb-2" />
                        <p className="text-center text-sm">Select a template to see a preview</p>
                      </div>
                    )}
                    
                    {selectedTemplate && (
                      <>
                        {selectedTemplate.id === 1 && <ModernProfessionalTemplate resume={resume} sectionOrder={sectionOrder} />}
                        {selectedTemplate.id === 2 && <ExecutiveBriefTemplate resume={resume} sectionOrder={sectionOrder} />}
                        {selectedTemplate.id === 3 && <CreativeImpactTemplate resume={resume} sectionOrder={sectionOrder} />}
                        {selectedTemplate.id === 4 && <TechInnovatorTemplate resume={resume} sectionOrder={sectionOrder} />}
                        {selectedTemplate.id === 5 && <TimelineFocusTemplate resume={resume} sectionOrder={sectionOrder} />}
                        {selectedTemplate.id === 6 && <MinimalistProTemplate resume={resume} sectionOrder={sectionOrder} />}
                      </>
                    )}
                    
                    {/* Empty state - show if no template selected and no data entered */}
                    {!selectedTemplate && 
                     !resume.fullName && !resume.summary && resume.skills.length === 0 && 
                     resume.experience.length === 0 && resume.education.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <File className="h-12 w-12 mb-2" />
                        <p className="text-center text-sm">Select a template and fill out your information</p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
          
          {/* Save Resume Button - Bottom */}
          <div className="flex justify-end mt-8">
            <Button 
              onClick={handleSaveResume} 
              isLoading={isSaving}
              size="lg"
              className="px-10 py-3 shadow-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-300"
            >
              <Save className="mr-2 h-5 w-5" />
              Save Resume
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResumeBuilder;
