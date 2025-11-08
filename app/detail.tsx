import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, Play, ChevronDown } from 'lucide-react-native';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tmdbApi, getImageUrl } from '@/services/tmdb';
import { useStreaming } from '@/contexts/StreamingContext';

const { width } = Dimensions.get('window');

export default function DetailScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: 'movie' | 'tv' }>();
  const insets = useSafeAreaInsets();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);
  const { addToMyList, removeFromMyList, isInMyList, addToContinueWatching } = useStreaming();

  const itemId = parseInt(id || '0', 10);
  const itemType = (type || 'movie') as 'movie' | 'tv';

  const { data: details, isLoading } = useQuery({
    queryKey: ['details', itemId, itemType],
    queryFn: () => itemType === 'movie' ? tmdbApi.getMovieDetails(itemId) : tmdbApi.getTVShowDetails(itemId),
    enabled: !!itemId,
  });

  const { data: seasonData } = useQuery({
    queryKey: ['season', itemId, selectedSeason],
    queryFn: () => tmdbApi.getSeasonDetails(itemId, selectedSeason),
    enabled: itemType === 'tv' && !!itemId,
  });

  const inList = isInMyList(itemId, itemType);

  const handleSave = () => {
    if (inList) {
      removeFromMyList(itemId, itemType);
    } else if (details) {
      addToMyList({
        id: itemId,
        title: details.title || details.name || '',
        type: itemType,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
      });
    }
  };

  const handlePlay = (season?: number, episode?: number) => {
    if (details) {
      addToContinueWatching({
        id: itemId,
        title: details.title || details.name || '',
        type: itemType,
        backdrop_path: details.backdrop_path,
        progress: 0,
        season: season || (itemType === 'tv' ? selectedSeason : undefined),
        episode: episode || (itemType === 'tv' ? 1 : undefined),
      });
      
      router.push({
        pathname: '/player',
        params: {
          id: itemId.toString(),
          type: itemType,
          title: details.title || details.name || '',
          season: season?.toString() || (itemType === 'tv' ? selectedSeason.toString() : undefined),
          episode: episode?.toString() || (itemType === 'tv' ? '1' : undefined),
        },
      } as any);
    }
  };

  if (isLoading || !details) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  const matchScore = Math.round(details.vote_average * 10);
  const year = details.release_date?.substring(0, 4) || details.first_air_date?.substring(0, 4) || '';
  const isTVShow = 'number_of_seasons' in details;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image
            source={{ uri: getImageUrl(details.backdrop_path || details.poster_path, 'original') }}
            style={styles.backdrop}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)', '#000']}
            style={styles.gradient}
          />
          
          <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.topBarRight}>
              <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
                {inList ? (
                  <BookmarkCheck size={22} color="#fff" fill="#fff" />
                ) : (
                  <Bookmark size={22} color="#fff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Share2 size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.seriesBadge}>
              <View style={styles.nBadge}>
                <Text style={styles.nBadgeText}>N</Text>
              </View>
              <Text style={styles.seriesText}>SERIES</Text>
            </View>
            <Text style={styles.title}>{details.title || details.name}</Text>
            <Text style={styles.genres}>
              {details.genres?.slice(0, 3).map(g => g.name).join(' • ')}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.playButton} onPress={() => handlePlay()}>
            <Play size={20} color="#000" fill="#000" />
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>

          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.overview}>{details.overview}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{matchScore}% Match</Text>
              </View>
              <Text style={styles.metaText}>{year}</Text>
              {isTVShow && (
                <>
                  <Text style={styles.metaText}>
                    {(details as any).number_of_seasons} Season{(details as any).number_of_seasons > 1 ? 's' : ''}
                  </Text>
                  <View style={styles.hdBadge}>
                    <Text style={styles.hdBadgeText}>HD</Text>
                  </View>
                </>
              )}
              {!isTVShow && details.runtime && (
                <Text style={styles.metaText}>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</Text>
              )}
            </View>
          </View>

          {isTVShow && (details as any).seasons && (
            <View style={styles.seasonsSection}>
              <View style={styles.seasonHeader}>
                <Text style={styles.sectionTitle}>
                  Season {selectedSeason}
                </Text>
                {(details as any).seasons.length > 1 && (
                  <TouchableOpacity 
                    style={styles.seasonPickerButton}
                    onPress={() => setShowSeasonPicker(!showSeasonPicker)}
                  >
                    <Text style={styles.seasonPickerText}>Select Season</Text>
                    <ChevronDown size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>

              {showSeasonPicker && (
                <View style={styles.seasonPicker}>
                  {(details as any).seasons
                    .filter((s: any) => s.season_number > 0)
                    .map((season: any) => (
                      <TouchableOpacity
                        key={season.id}
                        style={[
                          styles.seasonOption,
                          selectedSeason === season.season_number && styles.seasonOptionSelected
                        ]}
                        onPress={() => {
                          setSelectedSeason(season.season_number);
                          setShowSeasonPicker(false);
                        }}
                      >
                        <Text style={[
                          styles.seasonOptionText,
                          selectedSeason === season.season_number && styles.seasonOptionTextSelected
                        ]}>
                          Season {season.season_number}
                        </Text>
                        <Text style={styles.seasonEpisodeCount}>
                          {season.episode_count} Episodes
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}

              {seasonData?.episodes?.map((episode) => (
                <TouchableOpacity 
                  key={episode.id} 
                  style={styles.episodeItem} 
                  onPress={() => handlePlay(selectedSeason, episode.episode_number)}
                >
                  <Image
                    source={{ uri: getImageUrl(episode.still_path, 'w780') }}
                    style={styles.episodeImage}
                  />
                  <View style={styles.episodeInfo}>
                    <View style={styles.episodeHeader}>
                      <Text style={styles.episodeNumber}>
                        CHAPTER {episode.episode_number < 10 ? '0' : ''}{episode.episode_number}
                      </Text>
                      {episode.runtime && (
                        <Text style={styles.episodeRuntime}>{episode.runtime}m</Text>
                      )}
                    </View>
                    <Text style={styles.episodeTitle}>{episode.name}</Text>
                    {episode.overview && (
                      <Text style={styles.episodeOverview} numberOfLines={2}>
                        {episode.overview}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
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
  heroSection: {
    height: 500,
    width: '100%',
  },
  backdrop: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 12,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  genres: {
    fontSize: 14,
    color: '#ccc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  playButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  aboutSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  overview: {
    fontSize: 15,
    color: '#b3b3b3',
    lineHeight: 22,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#46d369',
  },
  metaBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  metaText: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  hdBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#666',
  },
  hdBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  seasonsSection: {
    marginBottom: 30,
  },
  seasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  seasonPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  seasonPickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  seasonPicker: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 8,
  },
  seasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  seasonOptionSelected: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
  },
  seasonOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
  },
  seasonOptionTextSelected: {
    color: '#E50914',
  },
  seasonEpisodeCount: {
    fontSize: 13,
    color: '#999',
  },
  episodeItem: {
    marginBottom: 20,
  },
  episodeImage: {
    width: '100%',
    height: width * 0.5,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    marginBottom: 12,
  },
  episodeInfo: {
    gap: 6,
  },
  episodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  episodeNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
  },
  episodeRuntime: {
    fontSize: 12,
    color: '#999',
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  episodeOverview: {
    fontSize: 14,
    color: '#b3b3b3',
    lineHeight: 20,
  },
});
