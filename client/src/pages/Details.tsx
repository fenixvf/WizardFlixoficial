import { useRoute, Link, useLocation } from "wouter";
import { useContentDetails, useFandubDetails } from "@/hooks/use-content";
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/hooks/use-favorites";
import { useUser } from "@/hooks/use-auth";
import { Loader2, Star, Calendar, Clock, BookOpen, Play, Check, Plus, Mic, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { detectSocialMedia } from "@/lib/socialMedia";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Details() {
  const [location] = useLocation();
  const isFandubRoute = location.startsWith('/details/fandub/');
  
  const [, fandubParams] = useRoute("/details/fandub/:id");
  const [, regularParams] = useRoute("/details/:type/:id");
  
  let type: 'movie' | 'tv' = 'tv';
  let id = 0;
  
  if (isFandubRoute && fandubParams) {
    type = 'tv';
    id = Number(fandubParams.id);
  } else if (regularParams) {
    type = regularParams.type as 'movie' | 'tv';
    id = Number(regularParams.id);
  }

  const { data: regularAnime, isLoading: regularLoading } = useContentDetails(type, id);
  const { data: fandubAnime, isLoading: fandubLoading } = useFandubDetails(isFandubRoute ? id : 0);
  
  const anime = isFandubRoute ? fandubAnime : regularAnime;
  const isLoading = isFandubRoute ? fandubLoading : regularLoading;

  const { data: user } = useUser();
  const { data: favorites } = useFavorites();
  const { mutate: addFavorite, isPending: isAdding } = useAddFavorite();
  const { mutate: removeFavorite, isPending: isRemoving } = useRemoveFavorite();
  const { toast } = useToast();

  const isFavorite = favorites?.some(f => f.tmdbId === id);

  const handleToggleFavorite = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Você precisa estar logado para gerenciar seu grimório.", variant: "destructive" });
      return;
    }

    if (isFavorite) {
      removeFavorite(id);
    } else if (anime) {
      addFavorite({
        tmdbId: id,
        type,
        title: anime.title || anime.name,
        posterPath: anime.poster_path,
      });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
  if (!anime) return <div className="min-h-screen flex items-center justify-center">Anime not found</div>;

  const title = anime.title || anime.name;
  const releaseDate = anime.release_date || anime.first_air_date;
  const runtime = anime.runtime || (anime.episode_run_time?.length > 0 ? anime.episode_run_time[0] : null);
  const isFandub = anime.isFandub || isFandubRoute;
  const studio = anime.studio;
  const fandubCast = anime.fandubCast || [];

  return (
    <div className="min-h-screen pb-20">
      {/* Backdrop */}
      <div className="absolute inset-0 h-[70vh] w-full overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10" />
        <img 
          src={`https://image.tmdb.org/t/p/original${anime.backdrop_path}`} 
          alt="Backdrop"
          className="w-full h-full object-cover opacity-40 blur-sm scale-105"
        />
      </div>

      <div className="container mx-auto px-4 pt-[20vh] relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-64 md:w-80 flex-shrink-0 mx-auto md:mx-0"
          >
            <div className="relative rounded-xl overflow-hidden shadow-[0_0_30px_-10px_rgba(139,92,246,0.5)] border border-white/10 ring-1 ring-white/5">
              {isFandub && (
                <div className="absolute top-3 right-3 z-10 bg-purple-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white">Fandub</span>
                </div>
              )}
              <img 
                src={`https://image.tmdb.org/t/p/w500${anime.poster_path}`} 
                alt={title}
                className="w-full h-auto"
              />
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <Link href={isFandub ? `/watch/fandub/${id}` : `/watch/${type}/${id}`}>
                <Button className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl" data-testid="button-watch">
                  <Play className="w-5 h-5 mr-2 fill-white" />
                  Assistir agora
                </Button>
              </Link>
              
              <Button 
                variant={isFavorite ? "secondary" : "outline"}
                className={`w-full h-12 rounded-xl border-2 ${isFavorite ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30' : 'border-white/20 hover:bg-white/5 text-white'}`}
                onClick={handleToggleFavorite}
                disabled={isAdding || isRemoving}
                data-testid="button-favorite"
              >
                {isFavorite ? (
                  <>
                    <Check className="w-5 h-5 mr-2" /> No Grimório
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" /> Adicionar ao Grimório
                  </>
                )}
              </Button>

              {/* Studio Button for Fandub */}
              {isFandub && studio && studio.socialLink && (
                <StudioButton studio={studio} />
              )}
            </div>
          </motion.div>

          {/* Details */}
          <div className="flex-1 text-white space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-6xl font-rune mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white">{title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 font-medium">
                {isFandub && (
                  <div className="flex items-center gap-1 text-purple-400">
                    <Mic className="w-5 h-5" />
                    <span className="font-bold">Dublagem por Fãs</span>
                  </div>
                )}
                {anime.vote_average && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-yellow-200 font-bold">{anime.vote_average.toFixed(1)}</span>
                  </div>
                )}
                {releaseDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(releaseDate).getFullYear()}</span>
                  </div>
                )}
                {runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{runtime} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>{anime.genres?.map((g: any) => g.name).join(", ")}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold font-rune mb-2 text-purple-300">Sinopse</h2>
              <p className="text-lg leading-relaxed text-gray-300/90">{anime.overview}</p>
            </motion.div>

            {/* Fandub Cast Section */}
            {isFandub && fandubCast.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="pt-6"
              >
                <h2 className="text-2xl font-rune mb-4 text-white flex items-center gap-2">
                  <Mic className="w-6 h-6 text-purple-400" />
                  Elenco de Dublagem
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {fandubCast.map((cast: any, index: number) => (
                    <div 
                      key={index} 
                      className="bg-zinc-900/60 border border-white/10 rounded-xl p-4 text-center hover:bg-zinc-800/60 transition-colors"
                    >
                      <Avatar className="w-20 h-20 mx-auto mb-3 border-2 border-primary/30">
                        <AvatarImage 
                          src={cast.characterImage ? `https://image.tmdb.org/t/p/w185${cast.characterImage}` : undefined} 
                          alt={cast.character} 
                        />
                        <AvatarFallback className="bg-primary/20 text-primary text-xl font-rune">
                          {cast.character?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-white text-sm truncate">{cast.character}</h3>
                      <p className="text-xs text-purple-400 mt-1 font-medium">{cast.voiceActor}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Temporadas (Seasons) */}
            {type === 'tv' && anime.seasons && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-6"
              >
                <h2 className="text-2xl font-rune mb-4 text-white">Crônicas (Temporadas)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {anime.seasons.filter((s: any) => s.season_number > 0).map((season: any) => (
                    <Link key={season.id} href={isFandub ? `/watch/fandub/${id}/${season.season_number}/1` : `/watch/${type}/${id}/${season.season_number}/1`}>
                      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-colors cursor-pointer group">
                        {season.poster_path ? (
                          <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2 relative">
                            <img 
                              src={`https://image.tmdb.org/t/p/w300${season.poster_path}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[2/3] bg-zinc-800 rounded-lg mb-2 flex items-center justify-center text-zinc-500">
                            No Image
                          </div>
                        )}
                        <h3 className="font-bold text-sm truncate">{season.name}</h3>
                        <p className="text-xs text-muted-foreground">{season.episode_count} Episodes</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudioButton({ studio }: { studio: { name: string; socialLink: string } }) {
  const socialInfo = detectSocialMedia(studio.socialLink);
  const IconComponent = socialInfo.icon;
  
  return (
    <a 
      href={studio.socialLink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block"
    >
      <Button 
        variant="outline" 
        className="w-full h-12 rounded-xl border-2 border-purple-500/50 hover:bg-purple-500/20 text-white gap-2"
        data-testid="button-studio"
      >
        <IconComponent className="w-5 h-5" style={{ color: socialInfo.color }} />
        <span className="font-bold">Estúdio</span>
        <span className="text-sm text-muted-foreground">({studio.name})</span>
        <ExternalLink className="w-4 h-4 ml-auto opacity-50" />
      </Button>
    </a>
  );
}
