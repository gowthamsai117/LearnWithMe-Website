import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTopicById } from '../curriculum/curriculumData';
import { TopicPanels } from '../components/TopicPanels';
import { useProgress } from '../context/ProgressContext';
import { ArrowLeft, Lock } from 'lucide-react';

export const PhasePage: React.FC = () => {
  const { phaseId, topicId } = useParams<{ phaseId?: string; topicId: string }>();
  const { completedTopics, toggleTopicCompletion } = useProgress();

  const activePhaseId = phaseId || 'dsa-track';

  const lookup = getTopicById(topicId || '');
  if (!lookup) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center font-mono select-none">
        <h3 className="text-xl font-bold text-text-primary">Topic Not Found</h3>
        <p className="text-xs text-text-muted">The requested topic ID does not exist in the curriculum.</p>
        <Link to="/" className="text-accent font-bold hover:underline flex items-center gap-1.5 text-xs">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const { topic, phase } = lookup;
  const topicsList = phase.topics;

  const currentTopicIdx = topicsList.findIndex((t) => t.id === topicId);
  const nextTopic = currentTopicIdx < topicsList.length - 1 ? topicsList[currentTopicIdx + 1] : null;

  const nextTopicPath = nextTopic
    ? activePhaseId === 'dsa-track'
      ? `/dsa/${nextTopic.id}`
      : `/phase/${activePhaseId}/${nextTopic.id}`
    : null;

  const handleToggleComplete = () => {
    toggleTopicCompletion(topic.id);
  };

  return (
    <div className="h-full overflow-hidden flex flex-col px-4 py-3 md:px-6 md:py-4 w-full max-w-full">
      {topic.buildFirst ? (
        <TopicPanels
          topic={topic}
          phase={phase}
          isCompleted={completedTopics.includes(topic.id)}
          onToggleComplete={handleToggleComplete}
          nextTopicPath={nextTopicPath}
        />
      ) : (
        // Preview placeholder for coming soon topics
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-8 bg-panel border border-panel-border rounded-xl max-w-md mx-auto font-mono">
          <div className="h-12 w-12 rounded-lg bg-[#0A0D18] border border-panel-border flex items-center justify-center mb-5">
            <Lock className="h-5 w-5 text-text-muted animate-pulse" />
          </div>
          <span className="px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase bg-[#0A0D18] border border-panel-border text-text-muted mb-4">
            Coming Soon
          </span>
          <h2 className="text-sm font-bold text-text-primary mb-1">{topic.name}</h2>
          <p className="text-[10px] text-text-muted font-sans leading-relaxed mb-6 max-w-xs">
            We are working hard to build high-fidelity interactive visualizations and code tests for this module. Try out completed modules in this track!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full text-[10px] font-bold">
            <Link
              to="/"
              className="flex-1 py-2 rounded-lg bg-panel border border-panel-border hover:bg-panel-border text-text-primary transition text-center"
            >
              Go to Dashboard
            </Link>
            {nextTopicPath && (
              <Link
                to={nextTopicPath}
                className="flex-1 py-2 rounded-lg bg-accent/10 text-accent border border-accent/25 hover:bg-accent/20 transition text-center"
              >
                Skip to Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default PhasePage;
