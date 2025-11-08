import { Movie, MovieDetails, TVShowDetails, Episode, Genre } from '@/types/tmdb';

const API_KEY = '08c748f7d51cbcbf3189168114145568';
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdbApi = {
  getTrending: async (type: 'movie' | 'tv' = 'movie', timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> => {
    const response = await fetch(`${BASE_URL}/trending/${type}/${timeWindow}?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results;
  },

  getPopular: async (type: 'movie' | 'tv'): Promise<Movie[]> => {
    const response = await fetch(`${BASE_URL}/${type}/popular?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results;
  },

  getTopRated: async (type: 'movie' | 'tv'): Promise<Movie[]> => {
    const response = await fetch(`${BASE_URL}/${type}/top_rated?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results;
  },

  getMovieDetails: async (id: number): Promise<MovieDetails> => {
    const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
    return response.json();
  },

  getTVShowDetails: async (id: number): Promise<TVShowDetails> => {
    const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
    return response.json();
  },

  getSeasonDetails: async (tvId: number, seasonNumber: number): Promise<{ episodes: Episode[] }> => {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
    return response.json();
  },

  search: async (query: string): Promise<Movie[]> => {
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
  },

  getGenres: async (type: 'movie' | 'tv'): Promise<Genre[]> => {
    const response = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`);
    const data = await response.json();
    return data.genres;
  },

  getByGenre: async (genreId: number, type: 'movie' | 'tv'): Promise<Movie[]> => {
    const response = await fetch(
      `${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
    );
    const data = await response.json();
    return data.results;
  },
};

export const getImageUrl = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string => {
  if (!path) return '';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};
