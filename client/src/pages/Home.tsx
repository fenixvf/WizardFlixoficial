import { useTrending } from "@/hooks/use-content";
import { AnimeCard } from "@/components/AnimeCard";
import { Loader2, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const { data, isLoading, error } = useTrending();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-rune text-destructive mb-2">Dark Magic Interference</h2>
        <p className="text-muted-foreground">Could not summon the list of spells.</p>
      </div>
    );
  }

  const featured = data.results[0];
  const others = data.results.slice(1);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        {featured && (
          <>
            <div className="absolute inset-0">
              <img 
                src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`} 
                alt="Hero"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
            </div>

            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-2xl"
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary-foreground text-sm font-bold mb-4 backdrop-blur-sm">
                    #1 Magia em Alta
                  </span>
                  <h1 className="text-5xl md:text-7xl font-rune text-white mb-4 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] leading-tight">
                    {featured.title || featured.name}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-200 line-clamp-3 mb-8 font-light leading-relaxed">
                    {featured.overview}
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <Link href={`/details/${featured.title ? 'movie' : 'tv'}/${featured.id}`}>
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-[0_0_20px_-5px_rgba(139,92,246,0.6)] border border-white/10">
                        Abrir Grimório
                      </Button>
                    </Link>
                    <Link href={`/watch/${featured.title ? 'movie' : 'tv'}/${featured.id}`}>
                      <Button size="lg" variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/20 font-bold px-8 py-6 text-lg rounded-xl backdrop-blur-sm">
                        Lançar Visão
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Trending Section */}
      <section className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-pulse" />
          <h2 className="text-3xl font-rune text-white">Magias em Alta</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {others.map((item) => (
            <AnimeCard 
              key={item.id}
              id={item.id}
              title={item.title}
              name={item.name}
              posterPath={item.poster_path}
              rating={item.vote_average}
              type={item.title ? 'movie' : 'tv'}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
