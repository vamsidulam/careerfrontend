import React from 'react';
import { motion } from 'framer-motion';

interface ResumeDataDisplayProps {
  resumeData: any;
}

const ResumeDataDisplay: React.FC<ResumeDataDisplayProps> = ({ resumeData }) => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const parseResumeData = () => {
    console.log('Raw resume data received:', resumeData);
    console.log('Resume data type:', typeof resumeData);
    console.log('Resume data keys:', Object.keys(resumeData || {}));
    
    // If resumeData is already an object with the expected structure, return it
    if (resumeData && typeof resumeData === 'object') {
      // Check if it has the expected keys
      const hasExpectedKeys = resumeData['Full Name'] || resumeData.full_name || resumeData.name || 
                             resumeData.Email || resumeData.email ||
                             resumeData.Skills || resumeData.skills ||
                             resumeData.Education || resumeData.education;
      
      if (hasExpectedKeys) {
        console.log('Resume data already in correct format');
        return resumeData;
      }
    }
    
    // Try to parse raw_extraction if it exists
    if (resumeData && resumeData.raw_extraction) {
      try {
        let jsonString = resumeData.raw_extraction;
        
        // Remove markdown formatting if present
        if (jsonString.includes('```json')) {
          jsonString = jsonString.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonString.includes('```')) {
          jsonString = jsonString.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        
        console.log('Cleaned JSON string:', jsonString);
        const parsed = JSON.parse(jsonString);
        console.log('Parsed from raw_extraction:', parsed);
        return parsed;
      } catch (error) {
        console.log('Failed to parse raw_extraction:', error);
        console.log('Raw extraction content:', resumeData.raw_extraction);
        return resumeData;
      }
    }
    
    // If resumeData is a string, try to parse it
    if (typeof resumeData === 'string') {
      try {
        let jsonString = resumeData;
        
        // Remove markdown formatting if present
        if (jsonString.includes('```json')) {
          jsonString = jsonString.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonString.includes('```')) {
          jsonString = jsonString.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        
        const parsed = JSON.parse(jsonString);
        console.log('Parsed from string:', parsed);
        return parsed;
      } catch (error) {
        console.log('Failed to parse string:', error);
        return resumeData;
      }
    }
    
    console.log('Returning original resumeData');
    return resumeData;
  };

  const data = parseResumeData();

  // Extract data with fallbacks
  const name = data['Full Name'] || data.full_name || data.name || 'Not Available';
  const email = data.Email || data.email || 'Not Available';
  const phone = data['Phone Number'] || data.phone || data.phone_number || 'Not Available';
  const skills = data.Skills || data.skills || [];
  const education = data.Education || data.education || [];
  const experience = data['Work Experience'] || data.work_experience || data.experience || [];
  const projects = data.Projects || data.projects || [];

  // Debug extracted values
  console.log('Extracted values:', {
    name,
    email,
    phone,
    skills,
    education,
    experience,
    projects
  });

  // Create about section from available data
  const aboutText = `Experienced professional with expertise in ${skills.slice(0, 5).join(', ')}. 
  ${experience.length > 0 ? `Has ${experience.length} years of work experience.` : 'Currently seeking opportunities.'} 
  ${projects.length > 0 ? `Completed ${projects.length} projects demonstrating technical skills.` : ''}`;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Section - More Compact */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex items-center space-x-4">
            {/* Profile Picture Placeholder - Smaller */}
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            
            {/* Name and Contact Info - More Compact */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold mb-1 truncate">{name}</h1>
              <div className="space-y-0.5 text-blue-100 text-sm">
                <div className="flex items-center space-x-2 truncate">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span className="truncate">{email}</span>
                </div>
                <div className="flex items-center space-x-2 truncate">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span className="truncate">{phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections - More Compact */}
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left Column */}
            <div className="space-y-4">
              
              {/* About Section - More Compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                  About
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {aboutText}
                </p>
              </motion.div>

              {/* Education Section - More Compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                  Education
                </h2>
                <div className="space-y-2">
                  {education.length > 0 ? (
                    education.slice(0, 2).map((edu: any, index: number) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-md p-2">
                        {typeof edu === 'string' ? (
                          <p className="text-xs text-gray-900 dark:text-white font-medium">{edu}</p>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="text-xs text-gray-900 dark:text-white font-semibold">{edu.Degree}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{edu.Institution}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{edu.Years}</p>
                            {edu.CGPA && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">CGPA: {edu.CGPA}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No education information available</p>
                  )}
                </div>
              </motion.div>

              {/* Skills Section - More Compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-1">
                  {skills.length > 0 ? (
                    skills.slice(0, 8).map((skill: string, index: number) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium"
                      >
                        {skill}
                      </motion.span>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No skills information available</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              
              {/* Experience Section - More Compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                  Experience
                </h2>
                <div className="space-y-2">
                  {experience.length > 0 ? (
                    experience.slice(0, 2).map((exp: any, index: number) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-md p-2">
                        {typeof exp === 'string' ? (
                          <p className="text-xs text-gray-900 dark:text-white font-medium">{exp}</p>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="text-xs text-gray-900 dark:text-white font-semibold">{exp.Title || exp.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{exp.Company || exp.company}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{exp.Duration || exp.duration}</p>
                            {exp.Description && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{exp.Description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No work experience available</p>
                  )}
                </div>
              </motion.div>

              {/* Projects Section - More Compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                  Projects
                </h2>
                <div className="space-y-2">
                  {projects.length > 0 ? (
                    projects.slice(0, 2).map((project: any, index: number) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-md p-2">
                        {typeof project === 'string' ? (
                          <p className="text-xs text-gray-900 dark:text-white font-medium">{project}</p>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-900 dark:text-white font-semibold">{project.Name || project.name}</p>
                              {project['Live Demo'] && (
                                <span className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">
                                  Live Demo
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{project.Description || project.description}</p>
                            {project.Link && (
                              <a 
                                href={project.Link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
                              >
                                View Project →
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No projects information available</p>
                  )}
                </div>
              </motion.div>

              {/* Languages Section (if available) - More Compact */}
              {data.Languages || data.languages ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                    Languages
                  </h2>
                  <div className="flex flex-wrap gap-1">
                    {(data.Languages || data.languages || []).slice(0, 4).map((lang: string, index: number) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full font-medium"
                      >
                        {lang}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumeDataDisplay;
