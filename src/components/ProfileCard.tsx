import React from 'react';
import { motion } from 'framer-motion';

interface ProfileCardProps {
  title: string;
  icon: string;
  color: string;
  data: any;
  delay?: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ title, icon, color, data, delay = 0 }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const renderLinkedInData = () => (
    <div className="space-y-3">
      {data.full_name && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Name:</span>
          <span className="text-sm text-gray-900">{data.full_name}</span>
        </div>
      )}
      {data.headline && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Headline:</span>
          <span className="text-sm text-gray-900">{data.headline}</span>
        </div>
      )}
      {data.bio && (
        <div className="flex items-start space-x-2">
          <span className="text-sm font-medium text-gray-600">Bio:</span>
          <span className="text-sm text-gray-900 line-clamp-2">{data.bio}</span>
        </div>
      )}
      {data.certifications && data.certifications.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Certifications:</span>
          <span className="text-sm text-gray-900">{data.certifications.length} found</span>
        </div>
      )}
      {data.achievements && data.achievements.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Achievements:</span>
          <span className="text-sm text-gray-900">{data.achievements.length} found</span>
        </div>
      )}
    </div>
  );

  const renderGitHubData = () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Repositories:</span>
        <span className="text-sm text-gray-900">{data.length} found</span>
      </div>
      {data.length > 0 && (
        <>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Top Languages:</span>
            <span className="text-sm text-gray-900">
              {[...new Set(data.map((repo: any) => repo.language).filter(Boolean))].slice(0, 3).join(', ') || 'None'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Live Projects:</span>
            <span className="text-sm text-gray-900">{data.filter((repo: any) => repo.live_link).length} with live links</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Total Stars:</span>
            <span className="text-sm text-gray-900">{data.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Total Forks:</span>
            <span className="text-sm text-gray-900">{data.reduce((sum: number, repo: any) => sum + (repo.forks_count || 0), 0)}</span>
          </div>
        </>
      )}
    </div>
  );

  const renderCodeChefData = () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Handle:</span>
        <span className="text-sm text-gray-900">{data.handle}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Current Rating:</span>
        <span className="text-sm text-gray-900">{data.rating || 'N/A'} {data.stars || ''}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Highest Rating:</span>
        <span className="text-sm text-gray-900">{data.highest_rating || 'N/A'}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Global Rank:</span>
        <span className="text-sm text-gray-900">{data.global_rank || 'N/A'}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Country Rank:</span>
        <span className="text-sm text-gray-900">{data.country_rank || 'N/A'}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Problems Solved:</span>
        <span className="text-sm text-gray-900">{data.solved_count || 'N/A'}</span>
      </div>
      {data.certificates && data.certificates.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Certificates:</span>
          <span className="text-sm text-gray-900">{data.certificates.length} earned</span>
        </div>
      )}
    </div>
  );

  const renderData = () => {
    if (title === 'LinkedIn Profile') {
      return renderLinkedInData();
    } else if (title === 'GitHub Profile') {
      return renderGitHubData();
    } else if (title === 'CodeChef Profile') {
      return renderCodeChefData();
    }
    return null;
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-300`}
    >
      <div className={`${color} px-4 py-3`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">{icon}</span>
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
      </div>
      <div className="p-4">
        {renderData()}
      </div>
    </motion.div>
  );
};

export default ProfileCard;
