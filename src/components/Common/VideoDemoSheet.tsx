import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getExerciseVideoCue, getExerciseYoutubeUrl, VIDEO_SOURCES } from '../../data/exerciseDatabase';

interface VideoDemoSheetProps {
  exerciseId: string | null;
  exerciseName?: string;
  onClose: () => void;
}

/**
 * Plays the verified demo clip inside the app, starting at the exercise.
 * referrerPolicy "strict-origin" avoids YouTube's Error 153 in Android WebView.
 * Exercises without a verified clip open a YouTube search instead.
 */
export const VideoDemoSheet: React.FC<VideoDemoSheetProps> = ({ exerciseId, exerciseName, onClose }) => {
  if (!exerciseId) return null;
  const cue = getExerciseVideoCue(exerciseId);
  const external = getExerciseYoutubeUrl(exerciseId, exerciseName);
  const source = cue ? VIDEO_SOURCES[cue.source] : undefined;

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 flex items-end sm:items-center justify-center p-3" role="dialog" aria-modal="true" aria-label="Exercise demo video">
      <div className="w-full max-w-lg rounded-3xl bg-hy-elevated border border-hy-border overflow-hidden">
        <div className="flex items-center justify-between p-3">
          <div className="min-w-0">
            <div className="text-sm font-bold text-hy-text truncate">{exerciseName}</div>
            {cue && source && (
              <div className="text-xs text-hy-text-2 truncate">
                {cue.match === 'exact' ? '' : 'Similar: '}{cue.label} · {source.channel}
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Close video" className="w-11 h-11 rounded-xl bg-hy-surface flex items-center justify-center text-hy-text-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        {cue && source ? (
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${source.id}?start=${cue.start}&autoplay=1&playsinline=1&rel=0`}
              title={`${exerciseName} demo`}
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="px-4 pb-2 text-sm text-hy-text-2">
            There's no verified clip for this exercise yet. Open a YouTube search for a form tutorial instead.
          </p>
        )}
        <a
          href={external}
          target="_blank"
          rel="noopener noreferrer"
          className="m-3 min-h-[44px] rounded-2xl bg-hy-surface border border-hy-border text-hy-text text-sm font-bold flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          {cue ? 'Open in YouTube' : 'Search YouTube'}
        </a>
      </div>
    </div>
  );
};
