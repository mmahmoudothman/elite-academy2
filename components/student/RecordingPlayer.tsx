import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Recording, RecordingProgress } from '../../types';
import { setRecordingProgress } from '../../services/firestoreService';

interface RecordingPlayerProps {
  recording: Recording;
  progress?: RecordingProgress;
  onBack: () => void;
  onComplete?: () => void;
}

const RecordingPlayer: React.FC<RecordingPlayerProps> = ({ recording, progress, onBack, onComplete }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const s = t.student;
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [watchedSeconds, setWatchedSeconds] = useState(progress?.watchedSeconds || 0);
  const [isComplete, setIsComplete] = useState(progress?.completed || false);

  const saveProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!user) return;
    const completed = duration > 0 && (currentTime / duration) >= 0.9;
    const progressId = `${user.id}_${recording.id}`;
    await setRecordingProgress(progressId, {
      recordingId: recording.id,
      userId: user.id,
      courseId: recording.courseId,
      watchedSeconds: Math.floor(currentTime),
      totalSeconds: Math.floor(duration),
      percentWatched: duration > 0 ? Math.round((currentTime / duration) * 100) : 0,
      completed,
      lastWatchedAt: Date.now(),
      updatedAt: Date.now(),
    });
    setWatchedSeconds(Math.floor(currentTime));
    if (completed && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [user, recording.id, recording.courseId, isComplete, onComplete]);

  useEffect(() => {
    if (recording.storageType !== 'firebase_storage') return;
    const video = videoRef.current;
    if (!video) return;

    if (progress?.watchedSeconds && progress.watchedSeconds > 0) {
      video.currentTime = progress.watchedSeconds;
    }

    progressIntervalRef.current = setInterval(() => {
      if (video && !video.paused && video.duration > 0) {
        saveProgress(video.currentTime, video.duration);
      }
    }, 15000);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (video && video.duration > 0) {
        saveProgress(video.currentTime, video.duration);
      }
    };
  }, [recording.storageType, progress?.watchedSeconds, saveProgress]);

  const handleVideoEnd = () => {
    const video = videoRef.current;
    if (video) {
      saveProgress(video.duration, video.duration);
    }
  };

  const getYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? match[1] : url;
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPct = recording.durationSeconds && recording.durationSeconds > 0
    ? Math.min(100, Math.round((watchedSeconds / recording.durationSeconds) * 100))
    : 0;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-[#0da993] transition-colors mb-4"
      >
        <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {s.back}
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="aspect-video bg-black">
          {recording.storageType === 'firebase_storage' && (
            <video
              ref={videoRef}
              src={recording.url}
              controls
              className="w-full h-full"
              onEnded={handleVideoEnd}
              controlsList="nodownload"
            />
          )}
          {recording.storageType === 'youtube_unlisted' && (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(recording.url)}?rel=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={recording.title}
            />
          )}
          {recording.storageType === 'external_url' && (
            <iframe
              src={recording.url}
              className="w-full h-full"
              allowFullScreen
              title={recording.title}
            />
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{recording.title}</h2>
              {recording.description && (
                <p className="text-slate-600 mt-1">{recording.description}</p>
              )}
            </div>
            {isComplete && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {s.recording_completed}
              </span>
            )}
          </div>

          {recording.durationSeconds && recording.durationSeconds > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{s.recording_progress}: {formatDuration(watchedSeconds)} / {formatDuration(recording.durationSeconds)}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0da993] rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingPlayer;
