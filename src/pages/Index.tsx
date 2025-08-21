import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/FeatureCard';
import RoadmapDisplay from '@/components/RoadmapDisplay';
import { 
  Brain, 
  Search, 
  Route, 
  MessageCircle, 
  Sparkles,
  ArrowRight,
  Github,
  Linkedin,
  Code2
} from 'lucide-react';

const Index = () => {
  const [showRoadmap] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'Intelligent Career Guidance',
      description: 'AI-powered recommendations based on your skills, experience, and market trends to suggest the perfect career path.',
      delay: 0
    },
    {
      icon: Search,
      title: 'Profile Analyzer',
      description: 'Automatically extracts and analyzes data from your LinkedIn, GitHub, and CodeChef profiles to understand your strengths.',
      delay: 200
    },
    {
      icon: Route,
      title: 'Smart Roadmaps',
      description: 'Generates personalized, step-by-step career workflows with courses, projects, and certifications tailored to your goals.',
      delay: 400
    },
    {
      icon: MessageCircle,
      title: 'Interactive Chat Experience',
      description: 'Conversational AI interface that adapts to your needs and provides real-time guidance throughout your career journey.',
      delay: 600
    }
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-16 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Floating elements */}
            <div className="absolute top-20 left-10 opacity-20">
              <Code2 className="w-8 h-8 text-primary animate-float" />
            </div>
            <div className="absolute top-32 right-16 opacity-20">
              <Github className="w-6 h-6 text-accent animate-float" style={{ animationDelay: '2s' }} />
            </div>
            <div className="absolute top-40 left-1/4 opacity-20">
              <Linkedin className="w-7 h-7 text-primary-glow animate-float" style={{ animationDelay: '4s' }} />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-card border border-border mb-8 animate-slide-up">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">AI-Powered Career Mentorship</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                Meet Your Personalized{' '}
                <span className="text-gradient">Career Mentor</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '400ms' }}>
                Enter your LinkedIn, GitHub, and CodeChef profiles, and let our AI mentor guide your career path step by step.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '600ms' }}>
                <Button 
                  variant="hero" 
                  size="lg"
                  asChild
                  className="text-lg px-8 py-4 h-auto"
                >
                  <a href="/chat">
                    Start Your Career Journey
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </div>

              <div className="mt-12 flex items-center justify-center gap-8 opacity-60 animate-slide-up" style={{ animationDelay: '800ms' }}>
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  <span className="text-sm">GitHub</span>
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5" />
                  <span className="text-sm">LinkedIn</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  <span className="text-sm">CodeChef</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-slide-up">
              Powered by <span className="text-gradient">Advanced AI</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
              Our intelligent system combines machine learning with industry insights to provide personalized career guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={feature.delay}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      {showRoadmap && (
        <RoadmapDisplay 
          isVisible={showRoadmap} 
        />
      )}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="gradient-card border border-border rounded-2xl p-8 md:p-12 shadow-glow animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of developers who've accelerated their career growth with our AI mentor.
            </p>
            <Button 
              variant="cta" 
              size="lg"
              asChild
              className="text-lg px-8 py-4 h-auto"
            >
              <a href="/chat">
                Get Started Now
                <Sparkles className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      
      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            Trusted by developers. Privacy-first: Your data is secure.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;