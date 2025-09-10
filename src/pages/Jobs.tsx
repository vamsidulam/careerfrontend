import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  Briefcase, 
  MapPin, 
  Building, 
  Clock, 
  DollarSign, 
  Star, 
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import JobCards from '@/components/JobCards';

interface ResumeData {
  "Full Name"?: string;
  "Email"?: string;
  "Phone Number"?: string;
  "Skills"?: string[];
  "Education"?: string[];
  "Work Experience"?: string[];
  "Projects"?: string[];
  raw_extraction?: string;
  note?: string;
}

const Jobs = () => {
  const [activeTab, setActiveTab] = useState('resume');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'text/plain') {
        setResumeFile(file);
        toast.success('Resume uploaded successfully!');
      } else {
        toast.error('Please upload a PDF, DOCX, or TXT file');
      }
    }
  };

  const analyzeResume = async () => {
    if (!resumeFile) {
      toast.error('Please upload a resume first');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', resumeFile);

      // Send to resume parser service
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setResumeData(data.resume_data);
        toast.success('Resume analyzed successfully! Fetching job recommendations...');
        
        // Automatically switch to jobs tab after successful analysis
        setActiveTab('jobs');
      } else {
        toast.error(data.error || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'txt': return '📄';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resume Analysis & Job Discovery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your resume to get personalized job recommendations and career roadmaps
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="resume" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Resume Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Latest Jobs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Resume Upload Section */}
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    <span>Upload Resume</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        id="resume"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="resume" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">
                          PDF, DOCX, or TXT (max 10MB)
                        </p>
                      </label>
                    </div>
                  </div>

                  {resumeFile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium text-green-800">
                            {getFileTypeIcon(resumeFile.name)} {resumeFile.name}
                          </p>
                          <p className="text-sm text-green-600">
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={analyzeResume}
                    disabled={!resumeFile || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Resume Analysis Results */}
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>Analysis Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resumeData ? (
                    <div className="space-y-4">
                      {/* Basic Info */}
                      {resumeData["Full Name"] && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Name</h4>
                          <p className="text-gray-600">{resumeData["Full Name"]}</p>
                        </div>
                      )}

                      {resumeData["Email"] && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Email</h4>
                          <p className="text-gray-600">{resumeData["Email"]}</p>
                        </div>
                      )}

                      {resumeData["Phone Number"] && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Phone</h4>
                          <p className="text-gray-600">{resumeData["Phone Number"]}</p>
                        </div>
                      )}

                      {/* Skills */}
                      {resumeData["Skills"] && resumeData["Skills"].length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {resumeData["Skills"].map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Work Experience */}
                      {resumeData["Work Experience"] && resumeData["Work Experience"].length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Work Experience</h4>
                          <div className="space-y-2">
                            {resumeData["Work Experience"].slice(0, 3).map((exp, index) => (
                              <div key={index} className="text-sm">
                                <p className="font-medium text-gray-800">{exp}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {resumeData["Education"] && resumeData["Education"].length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                          <div className="space-y-2">
                            {resumeData["Education"].slice(0, 2).map((edu, index) => (
                              <div key={index} className="text-sm">
                                <p className="font-medium text-gray-800">{edu}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {resumeData["Projects"] && resumeData["Projects"].length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Projects</h4>
                          <div className="space-y-2">
                            {resumeData["Projects"].slice(0, 2).map((project, index) => (
                              <div key={index} className="text-sm">
                                <p className="font-medium text-gray-800">{project}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Note */}
                      {resumeData.note && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Note</h4>
                          <p className="text-sm text-gray-600">{resumeData.note}</p>
                        </div>
                      )}

                      <Separator />

                      <div className="text-center">
                        <Button 
                          onClick={() => setActiveTab('jobs')}
                          className="w-full"
                        >
                          <Briefcase className="h-4 w-4 mr-2" />
                          View Recommended Jobs
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Upload and analyze your resume to see detailed results
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <JobCards limit={12} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Jobs;

