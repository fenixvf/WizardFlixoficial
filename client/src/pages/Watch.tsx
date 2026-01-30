import { useRoute, Link } from "wouter";
import { ArrowLeft, Play, LayoutGrid } from "lucide-react";
import { useContentDetails } from "@/hooks/use-content";
import { Button } from "@/components/ui/button";

export default function Watch() {
  const [, params] = useRoute("/watch/:type/:id/:season?/:episode?");
  const type = (params as any)?.type as 'movie' | 'tv';
  const id = Number((params as any)?.id);
  const season = (params as any)?.season ? Number((params as any).season) : 1;
  const episode = (params as any)?.episode ? Number((params as any).episode) : 1;

  // We fetch details to get IMDB ID for movies or episode count for TV
  const { data: details } = useContentDetails(type, id);

  const getEmbedUrl = () => {
    if (type === 'movie') {
      const imdbId = details?.imdb_id;
      if (imdbId) return `https://playerflixapi.com/filme/${imdbId}`;
      return `https://playerflixapi.com/filme/${id}`;
    } else {
      return `https://playerflixapi.com/serie/${id}/${season}/${episode}`;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/10 bg-zinc-950">
        <Link href={`/details/${type}/${id}`}>
          <Button variant="ghost" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Detalhes
          </Button>
        </Link>
        <div className="ml-4 border-l border-white/10 pl-4">
          <h1 className="font-rune text-lg text-white">
            {details ? (details.title || details.name) : "Carregando..."}
          </h1>
          {type === 'tv' && (
            <p className="text-xs text-primary">Temporada {season} • Episódio {episode}</p>
          )}
        </div>
      </div>

      {/* Player Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-6 bg-black/40">
        <div className="relative w-full max-w-[1400px] aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)] border border-white/10 group">
          <iframe
            src={getEmbedUrl()}
            title={details ? (details.title || details.name) : "Video Player"}
            className="absolute top-0 left-0 w-full h-full border-0 z-10"
            /* Atributos essenciais para funcionamento da API externa */
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          {/* Overlay de carregamento sutil */}
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 -z-0">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        </div>
        
        <div className="mt-4 w-full max-w-[1400px] flex flex-wrap gap-4 items-center justify-between text-zinc-500 text-xs px-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              Servidor Principal
            </span>
            <span className="hidden md:inline text-zinc-400">Dica: Use o menu de engrenagem ⚙️ no canto do player para trocar o Áudio ou Legenda</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-white/5 px-2 py-1 rounded border border-white/10">Full HD 1080p</span>
            <span className="bg-white/5 px-2 py-1 rounded border border-white/10">Auto-ajuste</span>
          </div>
        </div>
      </div>

      {/* Episode Navigation (TV Only) */}
      {type === 'tv' && details && (
        <div className="bg-zinc-950 border-t border-white/10 p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-rune text-xl text-white">Episódios</h3>
              <Link href={`/details/${type}/${id}`}>
                 <Button size="sm" variant="outline" className="text-xs border-white/10 hover:bg-white/5">
                   <LayoutGrid className="w-3 h-3 mr-2" /> Todas as Temporadas
                 </Button>
              </Link>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {Array.from({ length: 24 }).map((_, i) => { // Mock episode count logic, normally from season details
                const epNum = i + 1;
                const isCurrent = epNum === episode;
                return (
                  <Link key={epNum} href={`/watch/${type}/${id}/${season}/${epNum}`}>
                    <div 
                      className={`
                        flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-all border
                        ${isCurrent 
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                          : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-white'}
                      `}
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
