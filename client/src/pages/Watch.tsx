import { useRoute, Link, useLocation } from "wouter";
import { ArrowLeft, Play, LayoutGrid, Mic } from "lucide-react";
import { useContentDetails, useFandubDetails, useFandubEpisode } from "@/hooks/use-content";
import { Button } from "@/components/ui/button";

export default function Watch() {
  const [location] = useLocation();
  const isFandubRoute = location.startsWith('/watch/fandub/');
  
  const [, fandubParams] = useRoute("/watch/fandub/:id/:season?/:episode?");
  const [, regularParams] = useRoute("/watch/:type/:id/:season?/:episode?");
  
  let type: 'movie' | 'tv' = 'tv';
  let id = 0;
  let season = 1;
  let episode = 1;
  
  if (isFandubRoute && fandubParams) {
    type = 'tv';
    id = Number((fandubParams as any).id);
    season = (fandubParams as any).season ? Number((fandubParams as any).season) : 1;
    episode = (fandubParams as any).episode ? Number((fandubParams as any).episode) : 1;
  } else if (regularParams) {
    type = (regularParams as any).type as 'movie' | 'tv';
    id = Number((regularParams as any).id);
    season = (regularParams as any).season ? Number((regularParams as any).season) : 1;
    episode = (regularParams as any).episode ? Number((regularParams as any).episode) : 1;
  }

  const { data: regularDetails } = useContentDetails(type, id);
  const { data: fandubDetails } = useFandubDetails(isFandubRoute ? id : 0);
  const { data: fandubEpisodeData } = useFandubEpisode(
    isFandubRoute ? id : 0, 
    isFandubRoute ? season : 0, 
    isFandubRoute ? episode : 0
  );
  
  const details = isFandubRoute ? fandubDetails : regularDetails;
  const isFandub = isFandubRoute || details?.isFandub;

  const getEmbedUrl = () => {
    if (isFandub) {
      if (fandubEpisodeData?.embedUrl) {
        return fandubEpisodeData.embedUrl;
      }
      if (details?.embedUrl) {
        return details.embedUrl;
      }
    }
    
    if (type === 'movie') {
      const imdbId = details?.imdb_id || details?.external_ids?.imdb_id;
      if (imdbId) return `https://playerflixapi.com/filme/${imdbId}`;
      return `https://playerflixapi.com/filme/${id}`;
    } else {
      const tmdbId = id;
      return `https://playerflixapi.com/serie/${tmdbId}/${season}/${episode}`;
    }
  };

  const videoUrl = getEmbedUrl();
  const detailsUrl = isFandub ? `/details/fandub/${id}` : `/details/${type}/${id}`;

  const fandubSeasons = details?.seasons || [];
  const currentSeasonData = fandubSeasons.find((s: any) => s.season === season);
  const episodeCount = currentSeasonData?.episodes?.length || 24;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="h-16 flex items-center px-4 border-b border-white/10 bg-zinc-950">
        <Link href={detailsUrl}>
          <Button variant="ghost" className="text-zinc-400 hover:text-white" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Detalhes
          </Button>
        </Link>
        <div className="ml-4 border-l border-white/10 pl-4">
          <div className="flex items-center gap-2">
            <h1 className="font-rune text-lg text-white">
              {details ? (details.title || details.name) : "Carregando..."}
            </h1>
            {isFandub && (
              <div className="bg-purple-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                <Mic className="w-3 h-3 text-white" />
                <span className="text-xs font-bold text-white">Fandub</span>
              </div>
            )}
          </div>
          {type === 'tv' && (
            <p className="text-xs text-primary">Temporada {season} - Episódio {episode}</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-6 bg-black/40">
        <div className="relative w-full max-w-[1400px] aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)] border border-white/10 group">
          <iframe
            key={`${videoUrl}-${season}-${episode}`}
            src={videoUrl}
            title={details ? (details.title || details.name) : "Video Player"}
            className="absolute top-0 left-0 w-full h-full border-0 z-10"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 -z-0">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        </div>
        
        <div className="mt-4 w-full max-w-[1400px] flex flex-wrap gap-4 items-center justify-between text-zinc-500 text-xs px-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              {isFandub ? 'Fandub Player' : 'Servidor Principal'}
            </span>
            {!isFandub && (
              <span className="hidden md:inline text-zinc-400">Dica: Use o menu de engrenagem no canto do player para trocar o Áudio ou Legenda</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-white/5 px-2 py-1 rounded border border-white/10">Full HD 1080p</span>
            <span className="bg-white/5 px-2 py-1 rounded border border-white/10">Auto-ajuste</span>
          </div>
        </div>
      </div>

      {type === 'tv' && details && (
        <div className="bg-zinc-950 border-t border-white/10 p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-rune text-xl text-white">Episódios</h3>
              <Link href={detailsUrl}>
                 <Button size="sm" variant="outline" className="text-xs border-white/10 hover:bg-white/5" data-testid="button-all-seasons">
                   <LayoutGrid className="w-3 h-3 mr-2" /> Todas as Temporadas
                 </Button>
              </Link>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {Array.from({ length: episodeCount }).map((_, i) => {
                const epNum = i + 1;
                const isCurrent = epNum === episode;
                const watchUrl = isFandub ? `/watch/fandub/${id}/${season}/${epNum}` : `/watch/${type}/${id}/${season}/${epNum}`;
                return (
                  <Link key={epNum} href={watchUrl}>
                    <div 
                      className={`
                        flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-all border
                        ${isCurrent 
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                          : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-white'}
                      `}
                      data-testid={`button-episode-${epNum}`}
                    >
                      {epNum}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
