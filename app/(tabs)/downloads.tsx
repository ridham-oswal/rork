import { router, Stack } from 'expo-router';
import { BookmarkCheck } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStreaming } from '@/contexts/StreamingContext';
import { getImageUrl } from '@/services/tmdb';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_WIDTH = (width - 48) / NUM_COLUMNS;

export default function DownloadsScreen() {
  const insets = useSafeAreaInsets();
  const { myList } = useStreaming();

  const openDetail = (id: number, type: 'movie' | 'tv') => {
    router.push({
      pathname: '/detail',
      params: { id, type },
    } as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Watchlist</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {myList.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <BookmarkCheck size={48} color="#666" />
            </View>
            <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
            <Text style={styles.emptyText}>
              Save movies and TV shows to your watchlist to keep track of what you want to watch
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>My List ({myList.length})</Text>
            <View style={styles.grid}>
              {myList.map((item) => (
                <TouchableOpacity
                  key={`${item.type}-${item.id}`}
                  style={styles.gridItem}
                  onPress={() => openDetail(item.id, item.type)}
                >
                  <Image
                    source={{ uri: getImageUrl(item.poster_path, 'w500') }}
                    style={styles.poster}
                  />
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  gridItem: {
    width: ITEM_WIDTH,
    marginHorizontal: 4,
    marginBottom: 20,
  },
  poster: {
    width: '100%',
    height: ITEM_WIDTH * 1.5,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 13,
    color: '#ccc',
    fontWeight: '500',
  },
});
