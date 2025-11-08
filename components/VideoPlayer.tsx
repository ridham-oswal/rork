import React, { useState, useRef } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface VideoPlayerProps {
  url: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  onLoadStart,
  onLoadEnd,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const iosVideoScript = `
    (function() {
      // Enhanced iOS video handling
      const style = document.createElement('style');
      style.innerHTML = \`
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        body, html {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: #000 !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        
        video {
          -webkit-playsinline: true !important;
          playsinline: true !important;
          webkit-playsinline: true !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
        
        video::-webkit-media-controls {
          display: none !important;
        }
        
        video::-webkit-media-controls-enclosure {
          display: none !important;
        }
        
        iframe {
          border: none !important;
          outline: none !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        .video-container, .player-container {
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
        }
      \`;
      document.head.appendChild(style);
      
      // Force inline playback for all videos
      function setupVideo(video) {
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.playsInline = true;
        video.webkitPlaysInline = true;
        video.controls = true;
        
        // Prevent fullscreen on iOS
        video.addEventListener('webkitbeginfullscreen', function(e) {
          e.preventDefault();
          return false;
        });
        
        video.addEventListener('webkitendfullscreen', function(e) {
          e.preventDefault();
          return false;
        });
      }
      
      // Setup existing videos
      document.addEventListener('DOMContentLoaded', function() {
        const videos = document.querySelectorAll('video');
        videos.forEach(setupVideo);
      });
      
      // Monitor for new videos
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.tagName === 'VIDEO') {
              setupVideo(node);
            } else if (node.querySelectorAll) {
              const videos = node.querySelectorAll('video');
              videos.forEach(setupVideo);
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Block ads
      const ads = [
        'googlesyndication.com',
        'doubleclick.net',
        'ads-twitter.com',
        'adservice.google.com',
        'pagead2.googlesyndication.com',
        'popads.net',
        'popcash.net',
        'clickadu.com',
        'propellerads.com',
        'adsterra.com'
      ];
      
      const originalFetch = window.fetch;
      window.fetch = function() {
        const url = arguments[0];
        if (typeof url === 'string' && ads.some(ad => url.includes(ad))) {
          return Promise.reject(new Error('Blocked'));
        }
        return originalFetch.apply(this, arguments);
      };
      
      // Remove ad elements
      setInterval(function() {
        const adElements = document.querySelectorAll('ins.adsbygoogle, .ad, .ads, .advertisement, [class*="ad-"], [id*="ad-"], [class*="ads-"]');
        adElements.forEach(function(el) {
          el.remove();
        });
      }, 1000);
      
      return true;
    })();
  `;

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  const handleError = () => {
    setIsLoading(false);
    onError?.();
  };

  if (Platform.OS === 'web') {
    return (
      <iframe
        src={url}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#000',
        }}
        allowFullScreen
        onLoad={handleLoadEnd}
      />
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        allowsBackForwardNavigationGestures={false}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        injectedJavaScript={iosVideoScript}
        onShouldStartLoadWithRequest={(request) => {
          const blockedDomains = [
            'googlesyndication.com',
            'doubleclick.net',
            'adservice.google.com',
            'popads.net',
            'popcash.net',
            'clickadu.com',
            'propellerads.com',
            'adsterra.com'
          ];
          return !blockedDomains.some(domain => request.url.includes(domain));
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Loading player...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
});

export default VideoPlayer;