import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Movie } from '@/types/tmdb';
import { tmdbApi, getImageUrl } from '@/services/tmdb';
import { useStreaming } from '@/contexts/StreamingContext';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.32;
const CONTINUE_ITEM_WIDTH = width * 0.45;

export default function HomeScreen() {
  const [contentType, setContentType] = useState<'movie' | 'tv'>('tv');
  const { continueWatching } = useStreaming();

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending', contentType],
    queryFn: () => tmdbApi.getTrending(contentType, 'week'),
  });

  const { data: popular } = useQuery({
    queryKey: ['popular', contentType],
    queryFn: () => tmdbApi.getPopular(contentType),
  });

  const { data: topRated } = useQuery({
    queryKey: ['topRated', contentType],
    queryFn: () => tmdbApi.getTopRated(contentType),
  });

  const { data: action } = useQuery({
    queryKey: ['action', contentType],
    queryFn: () => tmdbApi.getByGenre(contentType === 'movie' ? 28 : 10759, contentType),
  });

  const heroItem = trending?.[0];

  const openDetail = (item: Movie) => {
    const type = item.media_type || contentType;
    router.push({
      pathname: '/detail',
      params: { id: item.id, type },
    } as any);
  };

  if (trendingLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {heroItem && (
          <TouchableOpacity activeOpacity={0.95} onPress={() => openDetail(heroItem)}>
            <View style={styles.heroContainer}>
              <Image
                source={{ uri: getImageUrl(heroItem.backdrop_path, 'original') }}
                style={styles.heroImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)', '#000']}
                style={styles.heroGradient}
              />
              
              <View style={styles.header}>
                <Image
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' }}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View style={styles.headerTabs}>
                  <TouchableOpacity onPress={() => setContentType('tv')}>
                    <Text style={[styles.headerTab, contentType === 'tv' && styles.headerTabActive]}>
                      TV Shows
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setContentType('movie')}>
                    <Text style={[styles.headerTab, contentType === 'movie' && styles.headerTabActive]}>
                      Movies
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.profileButton}>
                  <User size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.heroContent}>
                <View style={styles.seriesBadge}>
                  <View style={styles.nBadge}>
                    <Text style={styles.nBadgeText}>N</Text>
                  </View>
                  <Text style={styles.seriesText}>SERIES</Text>
                </View>
                <Text style={styles.heroTitle}>{heroItem.title || heroItem.name}</Text>
                <Text style={styles.heroGenres}>
                  {heroItem.genre_ids?.slice(0, 3).map((id) => {
                    const genreNames: Record<number, string> = {
                      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
                      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
                      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
                      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
                      10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
                      10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
                    };
                    return genreNames[id];
                  }).filter(Boolean).join(' • ')}
                </Text>
                <View style={styles.heroButtons}>
                  <TouchableOpacity style={styles.playButton}>
                    <Text style={styles.playButtonText}>▶ Play</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>+ Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {continueWatching.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue watching</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.continueRow}>
              {continueWatching.map((item, index) => (
                <TouchableOpacity
                  key={`${item.id}-${index}`}
                  style={styles.continueItem}
                  onPress={() => router.push({
                    pathname: '/detail',
                    params: { id: item.id, type: item.type },
                  } as any)}
                >
                  <Image
                    source={{ uri: getImageUrl(item.backdrop_path, 'w500') }}
                    style={styles.continueImage}
                  />
                  <View style={styles.continueInfo}>
                    <Text style={styles.continueTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.continueEpisode}>
                      {item.type === 'tv' ? `Episode ${item.episode} - Season ${item.season}` : 'Movie'}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {popular && <CategoryRow title="Popular Now" items={popular} onPress={openDetail} />}
        {topRated && <CategoryRow title="Top Rated" items={topRated} onPress={openDetail} />}
        {action && <CategoryRow title="Action" items={action} onPress={openDetail} />}

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoryButtons}>
            {['Trending', 'Top Rated', 'Action', 'Comedy', 'Drama', 'Horror'].map((cat) => (
              <TouchableOpacity key={cat} style={styles.categoryButton}>
                <Text style={styles.categoryButtonText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function CategoryRow({ title, items, onPress }: { title: string; items: Movie[]; onPress: (item: Movie) => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {items.slice(0, 10).map((item) => (
          <TouchableOpacity key={item.id} style={styles.item} onPress={() => onPress(item)}>
            <Image
              source={{ uri: getImageUrl(item.poster_path, 'w500') }}
              style={styles.poster}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: 600,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    zIndex: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  headerTabs: {
    flexDirection: 'row',
    gap: 24,
  },
  headerTab: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  headerTabActive: {
    color: '#fff',
    fontWeight: '600',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  seriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  nBadge: {
    width: 20,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#E50914',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  seriesText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroGenres: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  row: {
    paddingLeft: 16,
  },
  item: {
    marginRight: 8,
  },
  poster: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
    borderRadius: 6,
    backgroundColor: '#1a1a1a',
  },
  continueRow: {
    paddingLeft: 16,
  },
  continueItem: {
    marginRight: 12,
    width: CONTINUE_ITEM_WIDTH,
  },
  continueImage: {
    width: CONTINUE_ITEM_WIDTH,
    height: CONTINUE_ITEM_WIDTH * 0.56,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  continueInfo: {
    marginTop: 8,
  },
  continueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  continueEpisode: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
  },
  categoriesSection: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});
