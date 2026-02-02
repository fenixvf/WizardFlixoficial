import { useState, useEffect } from "react";
import { useTrending, useNewReleases, useDailyGenres, useFandubList } from "@/hooks/use-content";
import { AnimeCard } from "@/components/AnimeCard";
import { Carousel } from "@/components/Carousel";
import { Loader2, Flame, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const { data, isLoading, error } = useTrending();
  const { data: newReleasesData, isLoading: newReleasesLoading } = useNewReleases();
  const { data: dailyGenresData, isLoading: dailyGenresLoading } = useDailyGenres();
  const { data: fandubData, isLoading: fandubLoading } = useFandubList();
  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredList = data?.results?.slice(0, 10) || [];
  const newReleases = newReleasesData?.results || [];
  const fandubs = fandubData?.results || [];

  const [heroItems, setHeroItems] = useState<any[]>([]);

  useEffect(() => {
    if (!data?.results) return;
    
    const trending = data.results.slice(0, 10);
    const recentFandubs = fandubs.filter((f: any) => {
      if (!f.addedAt) return false;
      const addedDate = new Date(f.addedAt);
      const diffTime = Math.abs(new Date().getTime() - addedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 5;
    });

    const merged = [...recentFandubs, ...trending];
    const unique = merged.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, 12);
    setHeroItems(unique);
  }, [data, fandubs]);

  useEffect(() => {
    if (heroItems.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroItems.length]);

  const nextFeatured = () => setCurrentIndex((prev) => (prev + 1) % heroItems.length);
  const prevFeatured = () => setCurrentIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length);

  if (isLoading || dailyGenresLoading || fandubLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-primary font-rune animate-pulse">Invocando o Catálogo...</p>
        </div>
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
          {heroItems.length > 0 && heroItems[currentIndex] && (
            <motion.div 
              key={heroItems[currentIndex].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0">
                <img 
                  src={`https://image.tmdb.org/t/p/original${heroItems[currentIndex].backdrop_path}`} 
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
                    {heroItems[currentIndex].isFandub ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-200 text-sm font-bold mb-4 backdrop-blur-sm animate-pulse">
                        ✨ Novo Fã Dublagem ✨
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary-foreground text-sm font-bold mb-4 backdrop-blur-sm">
                        #{currentIndex + 1} Obras em Alta
                      </span>
                    )}
                    <h1 className="text-5xl md:text-7xl font-rune text-white mb-4 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] leading-tight">
                      {heroItems[currentIndex].title || heroItems[currentIndex].name}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 line-clamp-3 mb-8 font-light leading-relaxed">
                      {heroItems[currentIndex].overview}
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                      <Link href={heroItems[currentIndex].isFandub ? `/details/fandub/${heroItems[currentIndex].id}` : `/details/${heroItems[currentIndex].title ? 'movie' : 'tv'}/${heroItems[currentIndex].id}`}>
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-[0_0_20px_-5px_rgba(139,92,246,0.6)] border border-white/10">
                          Detalhes
                        </Button>
                      </Link>
                      <Link href={heroItems[currentIndex].isFandub ? `/watch/fandub/${heroItems[currentIndex].id}` : `/watch/${heroItems[currentIndex].title ? 'movie' : 'tv'}/${heroItems[currentIndex].id}`}>
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

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroItems.map((_, idx) => (
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
          <h2 className="text-3xl font-rune text-white">Obras em Alta</h2>
        </div>

        <Carousel>
          {others.map((item: any) => (
            <div key={item.id} className="flex-shrink-0 w-80">
              <AnimeCard 
                id={item.id}
                title={item.title}
                name={item.name}
                posterPath={item.poster_path}
                backdropPath={item.backdrop_path}
                rating={item.vote_average}
                type={item.title ? 'movie' : 'tv'}
                variant="horizontal"
              />
            </div>
          ))}
        </Carousel>
      </section>

      {/* Novidades Section */}
      {newReleases.length > 0 && (
        <section className="container mx-auto px-4 mt-12 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-7 h-7 text-purple-400" />
            <h2 className="text-2xl font-rune text-white">Novidades</h2>
          </div>

          <Carousel>
            {newReleasesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 h-60 bg-zinc-800/50 rounded-lg animate-pulse" />
              ))
            ) : (
              newReleases.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-40">
                  <AnimeCard 
                    id={item.id}
                    title={item.title}
                    name={item.name}
                    posterPath={item.poster_path}
                    rating={item.vote_average}
                    type={item.title ? 'movie' : 'tv'}
                  />
                </div>
              ))
            )}
          </Carousel>
        </section>
      )}

      {/* Daily Genres Sections */}
      {dailyGenresData?.map((genre: any) => (
        <section key={genre.id} className="container mx-auto px-4 mt-12 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-rune text-white">{genre.name}</h2>
          </div>
          <Carousel>
            {genre.results.map((item: any) => (
              <div key={item.id} className="flex-shrink-0 w-40">
                <AnimeCard 
                  id={item.id}
                  title={item.title}
                  name={item.name}
                  posterPath={item.poster_path}
                  rating={item.vote_average}
                  type={item.title ? 'movie' : 'tv'}
                />
              </div>
            ))}
          </Carousel>
        </section>
      ))}

      {/* Fandub Section - Permanent */}
      {fandubs.length > 0 && (
        <section className="container mx-auto px-4 mt-12 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-7 h-7 text-blue-400" />
            <h2 className="text-2xl font-rune text-white font-black tracking-widest uppercase">Fã dublagem</h2>
          </div>
          <Carousel>
            {fandubs.map((item: any) => (
              <div key={item.id} className="flex-shrink-0 w-40">
                <AnimeCard 
                  id={item.id}
                  title={item.title}
                  name={item.name}
                  posterPath={item.poster_path}
                  rating={item.vote_average}
                  type={item.title ? 'movie' : 'tv'}
                  isFandub={true}
                />
              </div>
            ))}
          </Carousel>
        </section>
      )}
    </div>
  );
}
