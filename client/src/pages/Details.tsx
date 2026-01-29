import { useRoute, Link } from "wouter";
import { useContentDetails } from "@/hooks/use-content";
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/hooks/use-favorites";
import { useUser } from "@/hooks/use-auth";
import { Loader2, Star, Calendar, Clock, BookOpen, Play, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Details() {
  const [, params] = useRoute("/details/:type/:id");
  const type = params?.type as 'movie' | 'tv';
  const id = Number(params?.id);

  const { data: anime, isLoading } = useContentDetails(type, id);
  const { data: user } = useUser();
  const { data: favorites } = useFavorites();
  const { mutate: addFavorite, isPending: isAdding } = useAddFavorite();
  const { mutate: removeFavorite, isPending: isRemoving } = useRemoveFavorite();
  const { toast } = useToast();

  const isFavorite = favorites?.some(f => f.tmdbId === id);

  const handleToggleFavorite = () => {
    if (!user) {
      toast({ title: "Login Required", description: "You must be logged in to manage your grimoire.", variant: "destructive" });
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
            <div className="rounded-xl overflow-hidden shadow-[0_0_30px_-10px_rgba(139,92,246,0.5)] border border-white/10 ring-1 ring-white/5">
              <img 
                src={`https://image.tmdb.org/t/p/w500${anime.poster_path}`} 
                alt={title}
                className="w-full h-auto"
              />
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <Link href={`/watch/${type}/${id}`}>
                <Button className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl">
                  <Play className="w-5 h-5 mr-2 fill-white" />
                  Cast Vision
                </Button>
              </Link>
              
              <Button 
                variant={isFavorite ? "secondary" : "outline"}
                className={`w-full h-12 rounded-xl border-2 ${isFavorite ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30' : 'border-white/20 hover:bg-white/5 text-white'}`}
                onClick={handleToggleFavorite}
                disabled={isAdding || isRemoving}
              >
                {isFavorite ? (
                  <>
                    <Check className="w-5 h-5 mr-2" /> In Grimoire
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" /> Add to Grimoire
                  </>
                )}
              </Button>
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
              <h2 className="text-xl font-bold font-rune mb-2 text-purple-300">Synopsis</h2>
              <p className="text-lg leading-relaxed text-gray-300/90">{anime.overview}</p>
            </motion.div>

            {/* TV Show Seasons */}
            {type === 'tv' && anime.seasons && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-6"
              >
                <h2 className="text-2xl font-rune mb-4 text-white">Chronicles (Seasons)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {anime.seasons.filter((s: any) => s.season_number > 0).map((season: any) => (
                    <Link key={season.id} href={`/watch/${type}/${id}/${season.season_number}/1`}>
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
