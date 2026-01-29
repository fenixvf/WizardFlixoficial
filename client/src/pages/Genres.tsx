import { useQuery } from "@tanstack/react-query";
import { AnimeCard } from "@/components/AnimeCard";
import { Loader2, Sparkles, Sword, Ghost, Wand2, Heart, Search, Flame } from "lucide-react";
import { useLocation } from "wouter";
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
  const searchParams = new URLSearchParams(window.location.search);
  const selectedId = searchParams.get('id') ? Number(searchParams.get('id')) : null;

  const filteredGenres = selectedId 
    ? GENRES.filter(g => g.id === selectedId)
    : GENRES;

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
              onClick={() => setLocation(`/genres?id=${g.id}`)}
              className="rounded-full"
            >
              <g.icon className="w-4 h-4 mr-2" />
              {g.name}
            </Button>
          ))}
          {selectedId && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/genres')}
              className="text-muted-foreground"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-12">
        {filteredGenres.map((genre) => (
          <GenreSection key={genre.id} genre={genre} />
        ))}
      </div>
    </div>
  );
}

function GenreSection({ genre }: { genre: { id: number; name: string } }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/content/genre/${genre.id}`],
  });

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-primary" />;

  return (
    <section>
      <h2 className="text-2xl font-rune text-purple-300 mb-6">{genre.name}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {data?.results?.slice(0, 6).map((item: any) => (
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
  );
}