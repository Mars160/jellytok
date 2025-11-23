import React, { useRef, useState, useEffect } from 'react';
import { Heart, Play, Pause, Settings } from 'lucide-react';
import Hls from 'hls.js';
import type { MediaItem } from '../types';
import { jellyfinApi } from '../services/jellyfin';
import { useStore } from '../store/useStore';

interface VideoPlayerProps {
  item: MediaItem;
  isActive: boolean;
  shouldLoad: boolean;
  onToggleSettings: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ item, isActive, shouldLoad, onToggleSettings }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(item.UserData?.IsFavorite || false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [directPlayFailed, setDirectPlayFailed] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const { user, directPlayFirst } = useStore();

  // Reset failure state when item changes
  useEffect(() => {
    setDirectPlayFailed(false);
  }, [item.Id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    const mediaSourceId = item.MediaSources?.[0]?.Id;
    const hlsUrl = jellyfinApi.getHlsUrl(item.Id, mediaSourceId);
    let hls: Hls | null = null;

    const loadHls = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          enableWorker: true,
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
      }
    };

    const loadDirect = () => {
      const container = item.MediaSources?.[0]?.Container;
      video.src = jellyfinApi.getStreamUrl(item.Id, container);
      
      const handleError = () => {
        console.warn('Direct play failed, falling back to transcoding...');
        setDirectPlayFailed(true);
        video.removeEventListener('error', handleError);
      };
      video.addEventListener('error', handleError);
    };

    if (directPlayFirst && !directPlayFailed) {
      loadDirect();
    } else {
      loadHls();
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      // Clear video source to stop buffering
      video.removeAttribute('src');
      video.load();
    };
  }, [item.Id, shouldLoad, directPlayFailed]);

  // Report playback progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isPlaying) {
      interval = setInterval(() => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          const mediaSourceId = item.MediaSources?.[0]?.Id || item.Id;
          const ticks = Math.floor(currentTime * 10000000);
          jellyfinApi.reportPlaybackProgress(item.Id, mediaSourceId, ticks, false);
        }
      }, 1000);
    } else if (videoRef.current && videoRef.current.currentTime > 0) {
      // Report paused state
      const currentTime = videoRef.current.currentTime;
      const mediaSourceId = item.MediaSources?.[0]?.Id || item.Id;
      const ticks = Math.floor(currentTime * 10000000);
      jellyfinApi.reportPlaybackProgress(item.Id, mediaSourceId, ticks, true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, item.Id]);

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
    if (isSeeking) return;
    if (videoRef.current) {
      const duration = item.RunTimeTicks ? item.RunTimeTicks / 10000000 : videoRef.current.duration;
      const percent = (videoRef.current.currentTime / duration) * 100;
      setProgress(percent);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSeeking(true);
    setProgress(parseFloat(e.target.value));
  };

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const duration = item.RunTimeTicks ? item.RunTimeTicks / 10000000 : videoRef.current.duration;
      const val = parseFloat((e.currentTarget as HTMLInputElement).value);
      const time = (val / 100) * duration;
      videoRef.current.currentTime = time;
    }
    setIsSeeking(false);
  };

  const toggleLike = async () => {
    if (!user) return;
    const newStatus = !isLiked;
    setIsLiked(newStatus);
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
    
    try {
      await jellyfinApi.toggleFavorite(user.Id, item.Id, !newStatus);
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
              value={progress ? progress : 0}
              onChange={handleSeekChange}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>

      {/* Play Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Play size={80} className="fill-white/40 text-white/40" />
        </div>
      )}

      {/* Like Animation */}
      {showHeartAnim && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-bounce">
          <Heart size={100} className="fill-red-500 text-red-500 opacity-80" />
        </div>
      )}
    </div>
  );
};
