import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ContinueWatchingItem } from '@/types/tmdb';

interface SavedItem {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  poster_path: string | null;
  backdrop_path: string | null;
}

export const [StreamingProvider, useStreaming] = createContextHook(() => {
  const [myList, setMyList] = useState<SavedItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [listData, watchingData] = await Promise.all([
        AsyncStorage.getItem('myList'),
        AsyncStorage.getItem('continueWatching'),
      ]);

      if (listData) setMyList(JSON.parse(listData));
      if (watchingData) setContinueWatching(JSON.parse(watchingData));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToMyList = useCallback(async (item: SavedItem) => {
    try {
      const exists = myList.find(i => i.id === item.id && i.type === item.type);
      if (exists) return;

      const updated = [...myList, item];
      setMyList(updated);
      await AsyncStorage.setItem('myList', JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding to list:', error);
    }
  }, [myList]);

  const removeFromMyList = useCallback(async (id: number, type: 'movie' | 'tv') => {
    try {
      const updated = myList.filter(i => !(i.id === id && i.type === type));
      setMyList(updated);
      await AsyncStorage.setItem('myList', JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing from list:', error);
    }
  }, [myList]);

  const isInMyList = useCallback((id: number, type: 'movie' | 'tv') => {
    return myList.some(i => i.id === id && i.type === type);
  }, [myList]);

  const addToContinueWatching = useCallback(async (item: ContinueWatchingItem) => {
    try {
      const filtered = continueWatching.filter(i => !(i.id === item.id && i.type === item.type));
      const updated = [item, ...filtered].slice(0, 10);
      setContinueWatching(updated);
      await AsyncStorage.setItem('continueWatching', JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating continue watching:', error);
    }
  }, [continueWatching]);

  return useMemo(() => ({
    myList,
    continueWatching,
    isLoading,
    addToMyList,
    removeFromMyList,
    isInMyList,
    addToContinueWatching,
  }), [myList, continueWatching, isLoading, addToMyList, removeFromMyList, isInMyList, addToContinueWatching]);
});
