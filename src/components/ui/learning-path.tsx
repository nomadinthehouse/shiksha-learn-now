
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface LearningPath {
  id: string;
  current_topic: string;
  recommended_topics: string[];
  difficulty_level: string;
  created_at: string;
}

interface LearningPathProps {
  currentTopic?: string;
  onTopicSelect: (topic: string) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ currentTopic, onTopicSelect }) => {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && currentTopic) {
      fetchOrCreateLearningPath(currentTopic);
    }
  }, [user, currentTopic]);

  const fetchOrCreateLearningPath = async (topic: string) => {
    setLoading(true);
    try {
      // First, try to find existing learning path
      const { data: existingPath } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('current_topic', topic.toLowerCase())
        .single();

      if (existingPath) {
        setLearningPath(existingPath);
      } else {
        // Generate recommendations based on the topic
        const recommendations = generateRecommendations(topic);
        
        // Create new learning path
        const { data: newPath, error } = await supabase
          .from('learning_paths')
          .insert({
            current_topic: topic.toLowerCase(),
            recommended_topics: recommendations,
            difficulty_level: 'beginner'
          })
          .select()
          .single();

        if (error) throw error;
        setLearningPath(newPath);
      }
    } catch (error) {
      console.error('Error with learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (topic: string): string[] => {
    const topicRecommendations: { [key: string]: string[] } = {
      'java': ['Java Basics', 'Object-Oriented Programming', 'Data Structures', 'Spring Framework', 'Java Streams'],
      'python': ['Python Basics', 'Data Structures', 'Object-Oriented Programming', 'Web Development', 'Data Science'],
      'javascript': ['JavaScript Fundamentals', 'DOM Manipulation', 'Async Programming', 'React.js', 'Node.js'],
      'react': ['React Basics', 'Components & Props', 'State Management', 'Hooks', 'Advanced Patterns'],
      'ai': ['Machine Learning Basics', 'Neural Networks', 'Deep Learning', 'Natural Language Processing', 'Computer Vision']
    };

    const lowerTopic = topic.toLowerCase();
    for (const [key, recommendations] of Object.entries(topicRecommendations)) {
      if (lowerTopic.includes(key)) {
        return recommendations;
      }
    }

    // Default recommendations
    return [
      `${topic} Fundamentals`,
      `Advanced ${topic}`,
      `${topic} Best Practices`,
      `${topic} Projects`,
      `${topic} Career Path`
    ];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!learningPath) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Learning Path
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="capitalize">
            {learningPath.difficulty_level}
          </Badge>
          <span className="text-sm text-gray-600">
            Current: {learningPath.current_topic}
          </span>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommended Next Topics
          </h4>
          
          {learningPath.recommended_topics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <span className="text-sm">{topic}</span>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onTopicSelect(topic)}
                className="h-8 px-3"
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
