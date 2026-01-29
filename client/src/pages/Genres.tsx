import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimeCard } from "@/components/AnimeCard";
import { Loader2, Sparkles, Sword, Ghost, Wand2, Heart, Search, Flame } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";

const GENRES = [
  { id: 16, name: "Animação", icon: Sparkles },
  { id: 10759, name: "Ação & Aventura", icon: Sword },
  { id: 35, name: "Comédia", icon: Ghost },
  { id: 10765, name: "Fantasia", icon: Wand2 },
  { id: 10762, name: "Kids", icon: Heart },
  { id: 9648, name: "Mistério", icon: Search },
  { id: 18, name: "Drama", icon: Flame },
];

export default function Genres() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const selectedId = searchParams.get('id') ? Number(searchParams.get('id')) : null;

  const filteredGenres = selectedId 
    ? GENRES.filter(g => g.id === selectedId)
    : GENRES;

  const handleGenreClick = (genreId: number) => {
    setLocation(`/genres?id=${genreId}`);
  };

  const handleClear = () => {
    setLocation('/genres');
  };

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 className="text-4xl font-rune text-white">Gêneros Mágicos</h1>
        
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Button
              key={g.id}
              variant={selectedId === g.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleGenreClick(g.id)}
              className="rounded-full"
              data-testid={`button-genre-${g.id}`}
            >
              <g.icon className="w-4 h-4 mr-2" />
              {g.name}
            </Button>
          ))}
          {selectedId && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear}
              className="text-muted-foreground"
              data-testid="button-clear-genre"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filteredGenres.map((genre) => (
          <GenreItems key={genre.id} genreId={genre.id} />
        ))}
      </div>
    </div>
  );
}

function GenreItems({ genreId }: { genreId: number }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/content/genre/${genreId}`],
  });

  if (isLoading) {
    return Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="aspect-[2/3] rounded-xl bg-zinc-900 animate-pulse" />
    ));
  }

  return data?.results?.map((item: any) => (
    <AnimeCard
      key={item.id}
      id={item.id}
      title={item.title}
      name={item.name}
      posterPath={item.poster_path}
      rating={item.vote_average}
      type={item.title ? 'movie' : 'tv'}
    />
  ));
}