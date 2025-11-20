import React, { useRef, useState, useEffect } from 'react';
import { Heart, Play, Pause, Settings } from 'lucide-react';
import Hls from 'hls.js';
import type { MediaItem } from '../types';
import { jellyfinApi } from '../services/jellyfin';
import { useStore } from '../store/useStore';

interface VideoPlayerProps {
  item: MediaItem;
  isActive: boolean;
  onToggleSettings: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ item, isActive, onToggleSettings }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(item.UserData?.IsFavorite || false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const user = useStore((state) => state.user);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const mediaSourceId = item.MediaSources?.[0]?.Id;
    const hlsUrl = jellyfinApi.getHlsUrl(item.Id, mediaSourceId);
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        xhrSetup: (xhr) => {
          if (user?.AccessToken) {
            xhr.setRequestHeader('X-Emby-Token', user.AccessToken);
          }
        },
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
    } else {
      video.src = jellyfinApi.getStreamUrl(item.Id);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [item.Id]);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => {
        // Auto-play might be blocked
        setIsPlaying(false);
      });
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleLike = async () => {
    if (!user) return;
    const newStatus = !isLiked;
    setIsLiked(newStatus);
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
    
    try {
      await jellyfinApi.toggleFavorite(user.Id, item.Id, newStatus);
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      setIsLiked(!newStatus); // Revert on error
    }
  };

  // Double tap handler
  const lastTap = useRef<number>(0);
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      toggleLike();
    } else {
      togglePlay();
    }
    lastTap.current = now;
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Background Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-xl opacity-50"
        style={{ backgroundImage: `url(${jellyfinApi.getImageUrl(item.Id, item.ImageTags?.Primary)})` }}
      />

      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain z-10"
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onClick={handleTap}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-20 pointer-events-none" />

      {/* Controls & Metadata */}
      <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 pointer-events-none">
        <div className="flex justify-end pt-4 pointer-events-auto">
           <button onClick={onToggleSettings} className="p-2 bg-black/20 rounded-full backdrop-blur-md">
             <Settings className="text-white" />
           </button>
        </div>

        <div className="flex flex-col gap-4 pb-8">
          {/* Right Side Actions */}
          <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center pointer-events-auto">
            <button onClick={toggleLike} className="flex flex-col items-center gap-1">
              <Heart 
                size={32} 
                className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
              />
              <span className="text-xs font-bold text-white shadow-black drop-shadow-md">Like</span>
            </button>
          </div>

          {/* Metadata */}
          <div className="flex flex-col gap-1 pr-16">
            <h3 className="text-white font-bold text-lg drop-shadow-md">{item.Name}</h3>
            <p className="text-gray-200 text-sm drop-shadow-md">
              {item.SeriesName ? `${item.SeriesName} • ` : ''}
              {item.ProductionYear}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full pointer-events-auto flex items-center gap-2">
             <button onClick={togglePlay} className="text-white">
               {isPlaying ? <Pause size={20} /> : <Play size={20} />}
             </button>
             <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>

      {/* Like Animation */}
      {showHeartAnim && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-bounce">
          <Heart size={100} className="fill-red-500 text-red-500 opacity-80" />
        </div>
      )}
    </div>
  );
};
