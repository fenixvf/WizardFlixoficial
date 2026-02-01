export interface EpisodeEmbed {
  episode: number;
  url: string;
  title?: string;
}

export interface SeasonEmbed {
  season: number;
  episodes: EpisodeEmbed[];
}

export interface FandubEmbed {
  tmdbId: number;
  type: 'tv' | 'movie';
  title: string;
  studio: {
    name: string;
    socialLink?: string;
  };
  embedUrl?: string;
  seasons?: Record<string, Record<string, string>>;
  cast?: Array<{
    character: string;
    voiceActor: string;
    characterImage?: string;
  }>;
}

export function formatDriveUrl(url: string): string {
  if (!url) return url;
  
  if (url.includes('drive.google.com')) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    
    if (url.includes('/view')) {
      return url.replace(/\/view(\?.*)?$/, '/preview');
    }
    
    if (!url.endsWith('/preview')) {
      return url + '/preview';
    }
  }
  
  return url;
}

export function formatYoutubeUrl(url: string): string {
  if (!url) return url;
  
  if (url.includes('youtube.com/watch')) {
    const videoIdMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
  }
  
  if (url.includes('youtu.be/')) {
    const videoIdMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
  }
  
  return url;
}

export function formatEmbedUrl(url: string): string {
  if (!url) return url;
  
  if (url.includes('drive.google.com')) {
    return formatDriveUrl(url);
  }
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return formatYoutubeUrl(url);
  }
  
  return url;
}

export function organizeSeasons(seasons: Record<string, Record<string, string>>): SeasonEmbed[] {
  const organized: SeasonEmbed[] = [];
  
  const sortedSeasonKeys = Object.keys(seasons).sort((a, b) => parseInt(a) - parseInt(b));
  
  for (const seasonKey of sortedSeasonKeys) {
    const seasonNumber = parseInt(seasonKey);
    const episodesObj = seasons[seasonKey];
    
    const episodes: EpisodeEmbed[] = [];
    const sortedEpisodeKeys = Object.keys(episodesObj).sort((a, b) => parseInt(a) - parseInt(b));
    
    for (const episodeKey of sortedEpisodeKeys) {
      episodes.push({
        episode: parseInt(episodeKey),
        url: formatEmbedUrl(episodesObj[episodeKey])
      });
    }
    
    organized.push({
      season: seasonNumber,
      episodes
    });
  }
  
  return organized;
}

export function getEpisodeUrl(
  seasons: Record<string, Record<string, string>>,
  seasonNumber: number,
  episodeNumber: number
): string | null {
  const season = seasons[seasonNumber.toString()];
  if (!season) return null;
  
  const episode = season[episodeNumber.toString()];
  if (!episode) return null;
  
  return formatEmbedUrl(episode);
}

export function getTotalEpisodes(seasons: Record<string, Record<string, string>>): number {
  let total = 0;
  for (const seasonKey in seasons) {
    total += Object.keys(seasons[seasonKey]).length;
  }
  return total;
}

export function getSeasonEpisodeCount(
  seasons: Record<string, Record<string, string>>,
  seasonNumber: number
): number {
  const season = seasons[seasonNumber.toString()];
  return season ? Object.keys(season).length : 0;
}
