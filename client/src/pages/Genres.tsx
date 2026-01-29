import { useQuery } from "@tanstack/react-query";
import { AnimeCard } from "@/components/AnimeCard";
import { Loader2 } from "lucide-react";

const GENRES = [
  { id: 16, name: "Animação" },
  { id: 10759, name: "Ação & Aventura" },
  { id: 35, name: "Comédia" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Família" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mistério" },
  { id: 10765, name: "Sci-Fi & Fantasia" },
];

export default function Genres() {
  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
      <h1 className="text-4xl font-rune text-white mb-8">Gêneros de Anime</h1>
      <div className="space-y-12">
        {GENRES.map((genre) => (
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