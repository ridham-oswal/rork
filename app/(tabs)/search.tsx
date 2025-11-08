import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Movie } from '@/types/tmdb';
import { tmdbApi, getImageUrl } from '@/services/tmdb';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_WIDTH = (width - 48) / NUM_COLUMNS;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => tmdbApi.search(query),
    enabled: query.length > 0,
  });

  const { data: trending } = useQuery({
    queryKey: ['trending-all'],
    queryFn: () => tmdbApi.getTrending('movie', 'week'),
    enabled: query.length === 0,
  });

  const openDetail = (item: Movie) => {
    const type = item.media_type || 'movie';
    router.push({
      pathname: '/detail',
      params: { id: item.id, type },
    } as any);
  };

  const results = query.length > 0 ? searchResults : trending;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies & TV shows"
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading && query.length > 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E50914" />
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {query.length > 0 ? 'Results' : 'Trending Now'}
            </Text>
            <View style={styles.grid}>
              {results?.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.gridItem}
                  onPress={() => openDetail(item)}
                >
                  <Image
                    source={{ uri: getImageUrl(item.poster_path, 'w500') }}
                    style={styles.poster}
                  />
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title || item.name}
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
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
