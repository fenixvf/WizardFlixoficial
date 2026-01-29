import { useState, useEffect } from "react";
import { useTrending } from "@/hooks/use-content";
import { AnimeCard } from "@/components/AnimeCard";
import { Loader2, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const { data, isLoading, error } = useTrending();
  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredList = data?.results?.slice(0, 10) || [];

  useEffect(() => {
    if (featuredList.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredList.length]);

  const nextFeatured = () => setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  const prevFeatured = () => setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);

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
        <h2 className="text-2xl font-rune text-destructive mb-2">Interferência de Magia Negra</h2>
        <p className="text-muted-foreground">Não foi possível conjurar a lista de obras.</p>
      </div>
    );
  }

  const featured = featuredList[currentIndex];
  const others = data.results.slice(featuredList.length);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {featured && (
            <motion.div 
              key={featured.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
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
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-2xl"
                  >
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary-foreground text-sm font-bold mb-4 backdrop-blur-sm">
                      #{currentIndex + 1} Obras em Alta
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
                          Detalhes
                        </Button>
                      </Link>
                      <Link href={`/watch/${featured.title ? 'movie' : 'tv'}/${featured.id}`}>
                        <Button size="lg" variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/20 font-bold px-8 py-6 text-lg rounded-xl backdrop-blur-sm">
                          Assistir Agora
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Indicators - Moved to bottom of Hero */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {featuredList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-primary' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="container mx-auto px-4 mt-8 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-pulse" />
          <h2 className="text-3xl font-rune text-white">Mais Obras em Alta</h2>
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
