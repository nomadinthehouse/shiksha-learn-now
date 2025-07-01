
import React from 'react';
import { Card } from '@/components/ui/card';
import { ProgressTracker } from './progress-tracker';
import { LearningPath } from './learning-path';
import { NotesPanel } from './notes-panel';

interface DashboardSidebarProps {
  currentTopic?: string;
  contentUrl?: string;
  onTopicSelect: (topic: string) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentTopic,
  contentUrl,
  onTopicSelect
}) => {
  return (
    <div className="space-y-6">
      <LearningPath currentTopic={currentTopic} onTopicSelect={onTopicSelect} />
      <ProgressTracker />
      <NotesPanel currentTopic={currentTopic} contentUrl={contentUrl} />
    </div>
  );
};
