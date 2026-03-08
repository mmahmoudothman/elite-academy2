import React, { useState } from 'react';

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
const VIDEO_PATTERNS = ['youtube.com', 'youtu.be', 'vimeo.com'];

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (VIDEO_EXTENSIONS.some(ext => lower.includes(ext))) return true;
  if (VIDEO_PATTERNS.some(p => lower.includes(p))) return true;
  return false;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|.*[?&]v=))([^&#?]+)/);
  return match?.[1] ?? null;
}

interface MediaDisplayProps {
  src: string;
  alt?: string;
  className?: string;
  videoClassName?: string;
  /** Show play overlay on video thumbnails */
  showPlayOverlay?: boolean;
  /** Called when play overlay is clicked */
  onPlay?: () => void;
  /** Render as thumbnail only (no autoplay) */
  thumbnail?: boolean;
  /** Fallback icon when src is empty */
  fallbackIcon?: 'image' | 'user' | 'video';
}

const FALLBACK_ICONS = {
  image: (
    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  user: (
    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  video: (
    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
};

const MediaDisplay: React.FC<MediaDisplayProps> = ({
  src,
  alt = '',
  className = '',
  videoClassName = '',
  showPlayOverlay = true,
  onPlay,
  thumbnail = true,
  fallbackIcon = 'image',
}) => {
  const [imgError, setImgError] = useState(false);

  // Empty or broken src
  if (!src || imgError) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 ${className}`}>
        {FALLBACK_ICONS[fallbackIcon]}
      </div>
    );
  }

  const isVideo = isVideoUrl(src);

  // YouTube embed
  const ytId = getYouTubeId(src);
  if (ytId) {
    if (thumbnail) {
      return (
        <div
          className={`relative cursor-pointer group ${className}`}
          onClick={onPlay}
        >
          <img
            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
          {showPlayOverlay && <PlayOverlay />}
        </div>
      );
    }
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
        className={videoClassName || className}
        allow="autoplay; encrypted-media"
        allowFullScreen
        title={alt}
      />
    );
  }

  // Video file
  if (isVideo) {
    if (thumbnail) {
      return (
        <div
          className={`relative cursor-pointer group bg-slate-900 ${className}`}
          onClick={onPlay}
        >
          <video
            src={src}
            className="w-full h-full object-cover opacity-80"
            muted
            preload="metadata"
          />
          {showPlayOverlay && <PlayOverlay />}
        </div>
      );
    }
    return (
      <video
        src={src}
        className={videoClassName || className}
        controls
        autoPlay
      />
    );
  }

  // Regular image
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
    />
  );
};

const PlayOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 group-hover:bg-slate-900/50 transition-colors">
    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
      <svg className="w-5 h-5 text-slate-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  </div>
);

export default MediaDisplay;
