import { useState, useEffect, useMemo } from "react";
import { useTrending, useNewReleases } from "@/hooks/use-content";
import { AnimeCard } from "@/components/AnimeCard";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Search() {
  const [query, setQuery] = useState("");
  const { data: trendingData, isLoading: loadingTrending } = useTrending();
  const { data: newReleasesData, isLoading: loadingNew } = useNewReleases();

  // Consolida todas as obras do catálogo disponíveis localmente nas queries iniciais
  const localCatalog = useMemo(() => {
    const trending = trendingData?.results || [];
    const newReleases = newReleasesData?.results || [];
    
    // Remove duplicatas por ID
    const uniqueMap = new Map();
    [...trending, ...newReleases].forEach(item => {
      uniqueMap.set(item.id, item);
    });
    
    return Array.from(uniqueMap.values());
  }, [trendingData, newReleasesData]);

  // Filtra as obras com base na pesquisa (suporta busca parcial e apenas o que está no catálogo)
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return localCatalog.filter(item => {
      const title = (item.title || item.name || "").toLowerCase();
      return title.includes(searchTerm);
    });
  }, [query, localCatalog]);

  const isLoading = loadingTrending || loadingNew;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 container mx-auto">
      <div className="max-w-2xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-rune text-white mb-2">Conjurando Busca no Catálogo</h1>
        <p className="text-muted-foreground mb-8">Procure entre os pergaminhos disponíveis no Wizard Flix.</p>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg group-hover:bg-primary/30 transition-all duration-500" />
          <div className="relative flex items-center bg-zinc-900/90 border border-primary/30 rounded-2xl overflow-hidden shadow-xl p-2">
            <SearchIcon className="w-6 h-6 text-primary ml-3 mr-2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquise por nome (ex: One Piece)..."
              className="border-none bg-transparent text-lg focus-visible:ring-0 placeholder:text-zinc-600 h-12"
              autoFocus
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      )}

      {!isLoading && filteredResults.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {filteredResults.map((item) => (
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
        </motion.div>
      )}

      {!isLoading && query && filteredResults.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
          <p>Nenhuma obra encontrada no catálogo com este nome.</p>
        </div>
      )}
    </div>
  );
}
