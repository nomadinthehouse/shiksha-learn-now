
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, ArrowRight } from 'lucide-react';

interface RecommendationsSectionProps {
  currentTopic: string;
  learningLevel: string;
  onTopicSelect: (topic: string) => void;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  currentTopic,
  learningLevel,
  onTopicSelect
}) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    generateRecommendations();
  }, [currentTopic, learningLevel]);

  const generateRecommendations = () => {
    const topicRecommendations: { [key: string]: { [key: string]: string[] } } = {
      'cooking': {
        'beginner': ['Basic Knife Skills', 'Food Safety Basics', 'Essential Cooking Methods', 'Kitchen Equipment Guide', 'Meal Planning'],
        'intermediate': ['Advanced Knife Techniques', 'Sauce Making', 'Baking Fundamentals', 'Flavor Pairing', 'International Cuisines'],
        'advanced': ['Molecular Gastronomy', 'Professional Plating', 'Menu Development', 'Restaurant Management', 'Culinary Innovation']
      },
      'programming': {
        'beginner': ['Variables and Data Types', 'Control Structures', 'Functions', 'Debugging Basics', 'Version Control'],
        'intermediate': ['Object-Oriented Programming', 'Database Design', 'API Development', 'Testing', 'Design Patterns'],
        'advanced': ['System Architecture', 'Performance Optimization', 'Security', 'DevOps', 'Machine Learning']
      },
      'javascript': {
        'beginner': ['Variables and Operators', 'DOM Manipulation', 'Event Handling', 'Functions', 'Arrays and Objects'],
        'intermediate': ['Async Programming', 'ES6+ Features', 'Module Systems', 'Error Handling', 'Testing'],
        'advanced': ['Performance Optimization', 'Design Patterns', 'Node.js', 'Framework Architecture', 'TypeScript']
      },
      'react': {
        'beginner': ['JSX Syntax', 'Components and Props', 'State Management', 'Event Handling', 'Conditional Rendering'],
        'intermediate': ['Hooks', 'Context API', 'Routing', 'Form Handling', 'Performance Optimization'],
        'advanced': ['Custom Hooks', 'Advanced Patterns', 'Testing', 'Server-Side Rendering', 'State Management Libraries']
      }
    };

    const lowerTopic = currentTopic.toLowerCase();
    let topicRecs: string[] = [];

    // Find matching topic recommendations
    for (const [key, levels] of Object.entries(topicRecommendations)) {
      if (lowerTopic.includes(key)) {
        topicRecs = levels[learningLevel] || levels['beginner'];
        break;
      }
    }

    // Fallback to generic recommendations
    if (topicRecs.length === 0) {
      const genericRecs = {
        'beginner': [`${currentTopic} Fundamentals`, `Getting Started with ${currentTopic}`, `${currentTopic} Best Practices`, `Common ${currentTopic} Mistakes`, `${currentTopic} Resources`],
        'intermediate': [`Advanced ${currentTopic}`, `${currentTopic} Patterns`, `${currentTopic} Optimization`, `${currentTopic} Projects`, `${currentTopic} Testing`],
        'advanced': [`${currentTopic} Architecture`, `${currentTopic} Performance`, `${currentTopic} Security`, `${currentTopic} Scaling`, `${currentTopic} Innovation`]
      };
      topicRecs = genericRecs[learningLevel as keyof typeof genericRecs] || genericRecs['beginner'];
    }

    setRecommendations(topicRecs.slice(0, 5));
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              Continue Your Learning Journey
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Based on your current topic "{currentTopic}", here are some recommended next steps
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge className={getDifficultyColor(learningLevel)}>
                {learningLevel.charAt(0).toUpperCase() + learningLevel.slice(1)} Level
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Personalized
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((recommendation, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{recommendation}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Next recommended topic for your learning path
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onTopicSelect(recommendation)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => onTopicSelect(recommendations[0])}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700"
              >
                Start Next Recommended Topic
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
