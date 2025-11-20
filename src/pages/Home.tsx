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
    let lastBackTime = 0;
    
    const handlePopState = () => {
      const now = Date.now();
      // 如果距离上次返回操作小于2秒，则允许返回（不做拦截）
      if (now - lastBackTime < 2000) {
        return;
      }
      
      // 第一次返回，进行拦截
      lastBackTime = now;
      
      // 显示提示
      const toast = document.createElement('div');
      toast.textContent = '再按一次退出';
      toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-2 rounded-full text-sm z-50 backdrop-blur-md transition-opacity duration-300 pointer-events-none';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
      
      // 重新推入当前状态，抵消浏览器的后退操作
      window.history.pushState(null, '', window.location.pathname);
    };

    // 组件挂载时，推入一个状态作为缓冲
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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
