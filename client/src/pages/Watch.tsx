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

  const openPlayer = () => {
    window.open(getEmbedUrl(), '_blank');
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
      <div className="flex-1 relative bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
            <Play className="w-12 h-12 text-primary fill-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-rune text-white mb-2">Pronto para Assistir</h2>
            <p className="text-zinc-400">Clique no botão abaixo para abrir o player mágico em uma nova aba e evitar anúncios intrusivos.</p>
          </div>
          <Button onClick={openPlayer} size="lg" className="w-full bg-primary hover:bg-primary/90 text-white py-8 text-xl font-bold rounded-2xl shadow-lg shadow-primary/20">
            <Play className="w-6 h-6 mr-3 fill-current" />
            Abrir Player Mágico
          </Button>
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
