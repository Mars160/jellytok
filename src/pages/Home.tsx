import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import 'swiper/css';
import { useStore } from '../store/useStore';
import { jellyfinApi } from '../services/jellyfin';
import type { MediaItem } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedLibraryId, filters } = useStore();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!user || !selectedLibraryId) {
      navigate('/settings');
      return;
    }
    loadItems(0, true);
  }, [user, selectedLibraryId, filters]);

  const loadItems = async (startIndex: number, reset = false) => {
    if (loading || !user || !selectedLibraryId) return;
    setLoading(true);
    try {
      const newItems = await jellyfinApi.getItems(
        user.Id,
        selectedLibraryId,
        filters,
        startIndex
      );
      
      if (newItems.length < 20) setHasMore(false);
      
      setItems((prev) => (reset ? newItems : [...prev, ...newItems]));
    } catch (err) {
      console.error('Failed to load items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlideChange = (swiper: any) => {
    setActiveIndex(swiper.activeIndex);
    // Load more when nearing the end
    if (swiper.activeIndex >= items.length - 5 && hasMore && !loading) {
      loadItems(items.length);
    }
  };

  if (!items.length && loading) {
    return <div className="h-screen w-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (!items.length && !loading) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <p className="text-xl text-gray-400">No videos found</p>
        <button 
          onClick={() => navigate('/settings')}
          className="px-6 py-3 bg-gray-800 rounded-full font-semibold hover:bg-gray-700 transition-colors"
        >
          Open Settings
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black">
      <Swiper
        direction="vertical"
        className="h-full w-full"
        onSlideChange={handleSlideChange}
        modules={[Mousewheel]}
        mousewheel={true}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.Id}>
            <VideoPlayer 
              item={item} 
              isActive={index === activeIndex} 
              shouldLoad={index === activeIndex || index === activeIndex - 1 || index === activeIndex + 1}
              onToggleSettings={() => navigate('/settings')}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
