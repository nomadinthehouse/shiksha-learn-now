
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, BookOpen, Trophy } from 'lucide-react';

interface LearningLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLevelSelect: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  topic: string;
}

export const LearningLevelModal: React.FC<LearningLevelModalProps> = ({
  isOpen,
  onClose,
  onLevelSelect,
  topic
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);

  const levels = [
    {
      id: 'beginner' as const,
      title: 'Beginner',
      description: 'New to this topic, looking for basics and fundamentals',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'intermediate' as const,
      title: 'Intermediate',
      description: 'Have some knowledge, want to build upon existing skills',
      icon: <GraduationCap className="h-8 w-8" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'advanced' as const,
      title: 'Advanced',
      description: 'Experienced learner seeking advanced concepts and techniques',
      icon: <Trophy className="h-8 w-8" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    }
  ];

  const handleConfirm = () => {
    if (selectedLevel) {
      onLevelSelect(selectedLevel);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            What's your learning level for "{topic}"?
          </DialogTitle>
          <p className="text-center text-sm text-gray-600 mt-2">
            This helps us show you the most relevant content for your skill level
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {levels.map((level) => (
            <Card
              key={level.id}
              className={`cursor-pointer transition-all duration-200 border-2 ${
                selectedLevel === level.id
                  ? level.color
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedLevel(level.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${level.color}`}>
                    {level.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{level.title}</h3>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedLevel === level.id
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedLevel === level.id && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedLevel}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
