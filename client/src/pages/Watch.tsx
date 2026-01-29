import { useRoute, Link } from "wouter";
import { ArrowLeft, Play, LayoutGrid } from "lucide-react";
import { useContentDetails } from "@/hooks/use-content";
import { Button } from "@/components/ui/button";

export default function Watch() {
  const [, params] = useRoute("/watch/:type/:id/:season?/:episode?");
  const type = params?.type as 'movie' | 'tv';
  const id = Number(params?.id);
  const season = params?.season ? Number(params.season) : 1;
  const episode = params?.episode ? Number(params.episode) : 1;

  // We fetch details to get IMDB ID for movies or episode count for TV
  const { data: details } = useContentDetails(type, id);

  const getEmbedUrl = () => {
    if (type === 'movie') {
      // Prefer IMDB ID if available, otherwise fallback might be needed but API usually takes IMDB
      // Assuming details has external_ids or we use TMDB ID if supported by this specific player API variant
      // The prompt says: https://playerflixapi.com/filme/{imdb_id}
      // Often these APIs support TMDB ID too or we need to rely on the passed param.
      // Let's try to use the IMDB ID from details if available.
      const imdbId = details?.imdb_id;
      if (imdbId) return `https://playerflixapi.com/filme/${imdbId}`;
      return `https://playerflixapi.com/filme/${id}`; // Fallback, might not work depending on API strictness
    } else {
      // Series: https://playerflixapi.com/serie/{tmdb_id}/{season}/{episode}
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
            Back to Details
          </Button>
        </Link>
        <div className="ml-4 border-l border-white/10 pl-4">
          <h1 className="font-rune text-lg text-white">
            {details ? (details.title || details.name) : "Loading..."}
          </h1>
          {type === 'tv' && (
            <p className="text-xs text-primary">Season {season} • Episode {episode}</p>
          )}
        </div>
      </div>

      {/* Player Container */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        <iframe
          src={getEmbedUrl()}
          className="w-full h-full absolute inset-0"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      </div>

      {/* Episode Navigation (TV Only) */}
      {type === 'tv' && details && (
        <div className="bg-zinc-950 border-t border-white/10 p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-rune text-xl text-white">Episodes</h3>
              <Link href={`/details/${type}/${id}`}>
                 <Button size="sm" variant="outline" className="text-xs border-white/10 hover:bg-white/5">
                   <LayoutGrid className="w-3 h-3 mr-2" /> All Seasons
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
