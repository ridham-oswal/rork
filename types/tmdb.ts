export interface Movie {
    id: number;
    title: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    genre_ids: number[];
    media_type?: 'movie' | 'tv';
  }
  
  export interface MovieDetails extends Movie {
    genres: { id: number; name: string }[];
    runtime?: number;
    status: string;
    tagline: string;
    vote_count: number;
    popularity: number;
    original_language: string;
    number_of_seasons?: number;
    number_of_episodes?: number;
  }
  
  export interface TVShowDetails extends MovieDetails {
    seasons: Season[];
    episode_run_time: number[];
    last_air_date: string;
    networks: { id: number; name: string; logo_path: string }[];
  }
  
  export interface Season {
    id: number;
    name: string;
    overview: string;
    season_number: number;
    episode_count: number;
    air_date: string;
    poster_path: string | null;
  }
  
  export interface Episode {
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    season_number: number;
    still_path: string | null;
    vote_average: number;
    air_date: string;
    runtime: number;
  }
  
  export interface Genre {
    id: number;
    name: string;
  }
  
  export interface ContinueWatchingItem {
    id: number;
    title: string;
    type: 'movie' | 'tv';
    backdrop_path: string | null;
    progress: number;
    season?: number;
    episode?: number;
  }
  