import React from 'react';
import { CheckCircle, Circle, ArrowRight, BookOpen, Code, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'certification';
  completed: boolean;
  estimated_time: string;
}

interface RoadmapDisplayProps {
  roadmapData?: RoadmapStep[];
  isVisible: boolean;
}

const mockRoadmapData: RoadmapStep[] = [
  {
    id: '1',
    title: 'Master React Fundamentals',
    description: 'Learn component-based architecture, hooks, and state management',
    type: 'course',
    completed: false,
    estimated_time: '4 weeks'
  },
  {
    id: '2',
    title: 'Build a Portfolio Website',
    description: 'Create a responsive portfolio showcasing your projects',
    type: 'project',
    completed: false,
    estimated_time: '2 weeks'
  },
  {
    id: '3',
    title: 'AWS Cloud Practitioner',
    description: 'Get certified in cloud computing fundamentals',
    type: 'certification',
    completed: false,
    estimated_time: '6 weeks'
  },
  {
    id: '4',
    title: 'Full-Stack E-commerce App',
    description: 'Build a complete application with React, Node.js, and database',
    type: 'project',
    completed: false,
    estimated_time: '8 weeks'
  }
];

const RoadmapDisplay = ({ roadmapData = mockRoadmapData, isVisible }: RoadmapDisplayProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return BookOpen;
      case 'project':
        return Code;
      case 'certification':
        return Award;
      default:
        return Circle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'text-blue-400';
      case 'project':
        return 'text-green-400';
      case 'certification':
        return 'text-purple-400';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!isVisible) return null;

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gradient animate-slide-up">
            Your Personalized Career Roadmap
          </h2>
          <p className="text-xl text-muted-foreground animate-slide-up" style={{ animationDelay: '200ms' }}>
            Follow this step-by-step path to reach your career goals
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary opacity-30"></div>

          <div className="space-y-8">
            {roadmapData.map((step, index) => {
              const Icon = getTypeIcon(step.type);
              const StatusIcon = step.completed ? CheckCircle : Circle;
              
              return (
                <div 
                  key={step.id}
                  className="relative flex items-start gap-6 animate-slide-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Timeline node */}
                  <div className="relative z-10 w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                    <StatusIcon className={`w-6 h-6 ${step.completed ? 'text-success' : 'text-primary-foreground'}`} />
                  </div>

                  {/* Content card */}
                  <div className="flex-1 gradient-card border border-border rounded-xl p-6 shadow-card hover:shadow-glow transition-smooth group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${getTypeColor(step.type)}`} />
                        <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                          {step.type}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{step.estimated_time}</span>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-gradient transition-smooth">
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {!step.completed && (
                        <Button size="sm">
                          Start Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-card border border-border">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-sm text-muted-foreground">
              Roadmap updates automatically based on your progress
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapDisplay;