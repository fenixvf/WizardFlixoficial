import { useFavorites } from "@/hooks/use-favorites";
import { useUser } from "@/hooks/use-auth";
import { AnimeCard } from "@/components/AnimeCard";
import { Loader2, ScrollText, Ghost } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Grimoire() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const { data: favorites, isLoading: isFavLoading } = useFavorites();

  if (isUserLoading || isFavLoading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <ScrollText className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-rune text-white mb-4">Grimoire Locked</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          To keep a personal grimoire of spells, you must first register with the grand wizard guild.
        </p>
        <Link href="/auth">
          <Button size="lg" className="bg-primary hover:bg-primary/90">Join Guild / Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-900/30 rounded-xl border border-purple-500/20">
          <ScrollText className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <h1 className="text-4xl font-rune text-white">Your Grimoire</h1>
          <p className="text-muted-foreground">The spells you have collected.</p>
        </div>
      </div>

      {favorites && favorites.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
        >
          {favorites.map((fav) => (
            <AnimeCard
              key={fav.tmdbId}
              id={fav.tmdbId}
              title={fav.title}
              posterPath={fav.posterPath}
              type={fav.type as 'movie' | 'tv'}
              isFandub={fav.isFandub ?? false}
            />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-zinc-900/30 rounded-2xl border border-white/5 border-dashed">
          <Ghost className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-xl font-rune mb-2">Empty Pages</h3>
          <p>You haven't added any spells to your grimoire yet.</p>
          <Link href="/search">
            <Button variant="link" className="text-primary mt-4">Discover Spells</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
