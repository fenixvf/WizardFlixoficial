import { useState } from "react";
import { useSearch } from "@/hooks/use-content";
import { AnimeCard } from "@/components/AnimeCard";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Search() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useSearch(query);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 container mx-auto">
      <div className="max-w-2xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-rune text-white mb-2">Cast a Summoning Spell</h1>
        <p className="text-muted-foreground mb-8">Find the anime you seek within the archives.</p>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg group-hover:bg-primary/30 transition-all duration-500" />
          <div className="relative flex items-center bg-zinc-900/90 border border-primary/30 rounded-2xl overflow-hidden shadow-xl p-2">
            <SearchIcon className="w-6 h-6 text-primary ml-3 mr-2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter anime name..."
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

      {!isLoading && data?.results && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {data.results.map((item) => (
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

      {!isLoading && query && data?.results.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
          <p>The archives contain no knowledge of this spell.</p>
        </div>
      )}
    </div>
  );
}
