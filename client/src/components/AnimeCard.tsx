import { Link } from "wouter";
import { Star, Mic } from "lucide-react";
import { motion } from "framer-motion";

interface AnimeCardProps {
  id: number;
  title?: string;
  name?: string;
  posterPath: string | null;
  backdropPath?: string | null;
  rating?: number;
  type: 'movie' | 'tv';
  isFandub?: boolean;
  variant?: 'vertical' | 'horizontal';
}

export function AnimeCard({ id, title, name, posterPath, backdropPath, rating, type, isFandub, variant = 'vertical' }: AnimeCardProps) {
  const displayTitle = title || name || "Unknown Spell";
  const imageUrl = variant === 'horizontal' && backdropPath
    ? `https://image.tmdb.org/t/p/w780${backdropPath}`
    : (posterPath 
        ? `https://image.tmdb.org/t/p/w500${posterPath}` 
        : "https://placehold.co/500x750/1a1a1a/8B5CF6?text=No+Poster");
  
  const detailsUrl = isFandub ? `/details/fandub/${id}` : `/details/${type}/${id}`;

  return (
    <Link href={detailsUrl}>
      <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        className="group relative cursor-pointer w-full"
      >
        {/* Card Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/50 to-purple-900/50 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
        
        <div className={cn(
          "relative rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl",
          variant === 'horizontal' ? "aspect-video" : "aspect-[2/3]"
        )}>
          <img 
            src={imageUrl} 
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Fandub Badge */}
          {isFandub && (
            <div className="absolute top-2 right-2 z-10 bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
              <Mic className="w-3 h-3 text-white" />
              <span className="text-xs font-bold text-white">Fandub</span>
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className={cn(
              "font-rune text-white leading-tight line-clamp-2 drop-shadow-md mb-1",
              variant === 'horizontal' ? "text-xl" : "text-lg"
            )}>
              {displayTitle}
            </h3>
            
            {rating !== undefined && (
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold font-sans text-yellow-200">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
