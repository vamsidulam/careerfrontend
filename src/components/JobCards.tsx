import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Loader2, MapPin, Building, Clock, DollarSign, Briefcase, Star, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Job {
  id: string | number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  posted_date: string;
  experience_level: string;
  remote_friendly: boolean;
  job_url?: string;
  company_logo?: string;
  job_highlights?: any;
  job_benefits?: string[];
  job_required_skills?: string[];
  job_required_qualifications?: string[];
}

interface JobCardsProps {
  limit?: number;
  darkTheme?: boolean;
}

const JobCards: React.FC<JobCardsProps> = ({ limit = 10, darkTheme = false }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [roadmapDialogOpen, setRoadmapDialogOpen] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<any>(null);

  useEffect(() => {
    fetchLatestJobs();
  }, [limit]);

  const fetchLatestJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/jobprofiles/recent?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data.profiles);
        toast.success(`Found ${data.data.profiles.length} job opportunities!`);
      } else {
        toast.error('Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmap = async (job: Job) => {
    try {
      setRoadmapLoading(true);
      setSelectedJob(job);
      setRoadmapDialogOpen(true);

      const params = new URLSearchParams({
        job_title: job.title,
        description: job.description,
        skills: job.skills.join(', '),
        requirements: job.requirements.join(', ')
      });

      const response = await fetch(`http://localhost:8000/jobprofiles/roadmap/image?${params}`);
      const data = await response.json();

      if (data.success) {
        setRoadmapData(data.data);
      } else {
        toast.error('Failed to generate roadmap');
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      toast.error('Failed to generate roadmap');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'mid-level': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time': return 'bg-blue-100 text-blue-800';
      case 'part-time': return 'bg-orange-100 text-orange-800';
      case 'contract': return 'bg-red-100 text-red-800';
      case 'internship': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading latest jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${darkTheme ? 'text-white' : 'text-gray-900'}`}>
            {darkTheme ? 'Recommended Jobs' : 'Latest Jobs from India'}
          </h2>
          <p className={`mt-1 ${darkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
            {darkTheme ? 'Discover opportunities matching your profile' : 'Discover the most recent job opportunities based on your resume'}
          </p>
        </div>
        <Button 
          onClick={fetchLatestJobs} 
          variant="outline" 
          size="sm"
          className={`flex items-center space-x-2 ${darkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}
        >
          <Loader2 className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className={`mb-4 ${darkTheme ? 'text-gray-400' : 'text-gray-400'}`}>
            <Briefcase className="h-12 w-12 mx-auto" />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${darkTheme ? 'text-white' : 'text-gray-900'}`}>No jobs found</h3>
          <p className={darkTheme ? 'text-gray-300' : 'text-gray-600'}>Try refreshing or check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
                darkTheme 
                  ? 'bg-gray-700 border-gray-600 hover:border-blue-400 text-white' 
                  : 'hover:border-blue-200'
              }`}
              onClick={() => fetchRoadmap(job)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`text-lg font-semibold line-clamp-2 transition-colors ${
                      darkTheme 
                        ? 'text-white group-hover:text-blue-400' 
                        : 'text-gray-900 group-hover:text-blue-600'
                    }`}>
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Building className={`h-4 w-4 ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${darkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                        {job.company}
                      </span>
                    </div>
                  </div>
                  {job.company_logo && (
                    <img 
                      src={job.company_logo} 
                      alt={job.company}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Location and Type */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className={`h-4 w-4 ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${darkTheme ? 'text-gray-300' : 'text-gray-600'}`}>{job.location}</span>
                  </div>
                  <Badge className={getTypeColor(job.type)}>
                    {job.type}
                  </Badge>
                </div>

                {/* Salary */}
                {job.salary && job.salary !== "Not specified" && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">{job.salary}</span>
                  </div>
                )}

                {/* Experience Level */}
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-gray-500" />
                  <Badge className={getExperienceColor(job.experience_level)}>
                    {job.experience_level}
                  </Badge>
                  {job.remote_friendly && (
                    <Badge className="bg-green-100 text-green-800">
                      Remote
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className={`text-sm line-clamp-3 ${darkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                    {job.description}
                  </p>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${darkTheme ? 'text-white' : 'text-gray-900'}`}>Required Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${darkTheme ? 'text-white' : 'text-gray-900'}`}>Requirements:</h4>
                    <ul className={`text-sm space-y-1 ${darkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="line-clamp-2">{req}</span>
                        </li>
                      ))}
                      {job.requirements.length > 3 && (
                        <li className={`text-xs ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                          +{job.requirements.length - 3} more requirements
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Posted Date */}
                <div className={`flex items-center justify-between pt-2 border-t ${darkTheme ? 'border-gray-600' : ''}`}>
                  <div className="flex items-center space-x-2">
                    <Clock className={`h-4 w-4 ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-xs ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                      Posted: {new Date(job.posted_date).toLocaleDateString()}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className={`text-xs ${darkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (job.job_url) {
                        window.open(job.job_url, '_blank');
                      }
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Roadmap Dialog */}
      <Dialog open={roadmapDialogOpen} onOpenChange={setRoadmapDialogOpen}>
        <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${darkTheme ? 'bg-gray-800 border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center space-x-2 ${darkTheme ? 'text-white' : ''}`}>
              <Star className="h-5 w-5 text-blue-600" />
              <span>Career Roadmap for {selectedJob?.title}</span>
            </DialogTitle>
          </DialogHeader>

          {roadmapLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Generating career roadmap...</span>
              </div>
            </div>
          ) : roadmapData ? (
            <div className="space-y-6">
              {/* Job Info */}
              <div className={`rounded-lg p-4 ${darkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-2 ${darkTheme ? 'text-white' : 'text-gray-900'}`}>Job Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className={darkTheme ? 'text-gray-300' : ''}>
                    <span className="font-medium">Title:</span> {selectedJob?.title}
                  </div>
                  <div className={darkTheme ? 'text-gray-300' : ''}>
                    <span className="font-medium">Company:</span> {selectedJob?.company}
                  </div>
                  <div className={darkTheme ? 'text-gray-300' : ''}>
                    <span className="font-medium">Location:</span> {selectedJob?.location}
                  </div>
                  <div className={darkTheme ? 'text-gray-300' : ''}>
                    <span className="font-medium">Type:</span> {selectedJob?.type}
                  </div>
                </div>
              </div>

              {/* Roadmap Image */}
              {roadmapData.flowchart_image_url && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Career Roadmap</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={roadmapData.flowchart_image_url} 
                      alt="Career Roadmap"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {/* Roadmap Text */}
              {roadmapData.roadmap_text && (
                <div>
                  <h3 className={`font-semibold mb-3 ${darkTheme ? 'text-white' : 'text-gray-900'}`}>Detailed Roadmap</h3>
                  <div className={`border rounded-lg p-4 ${darkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}>
                    <pre className={`whitespace-pre-wrap text-sm font-sans ${darkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                      {roadmapData.roadmap_text}
                    </pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setRoadmapDialogOpen(false)}
                >
                  Close
                </Button>
                {selectedJob?.job_url && (
                  <Button 
                    onClick={() => window.open(selectedJob.job_url, '_blank')}
                    className="flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Apply Now</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Failed to load roadmap</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobCards;

