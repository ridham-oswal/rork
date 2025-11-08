import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VideoPlayer from '@/components/VideoPlayer';



export default function PlayerScreen() {
  const { id, type, title, season, episode } = useLocalSearchParams<{
    id: string;
    type: 'movie' | 'tv';
    title: string;
    season?: string;
    episode?: string;
  }>();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);

  const getVideoUrl = () => {
    if (type === 'movie') {
      return `https://player.videasy.net/movie/${id}`;
    }
    return `https://player.videasy.net/tv/${id}/${season || 1}/${episode || 1}`;
  };

  const currentUrl = getVideoUrl();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            {type === 'tv' && season && episode && (
              <Text style={styles.episodeInfo}>
                S{season} E{episode}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.playerContainer}>
        <VideoPlayer
          url={currentUrl}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </View>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          Tap the play button in the player to start watching
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#000',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  episodeInfo: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },

  playerContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },

  infoBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 9, 20, 0.2)',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },

});
