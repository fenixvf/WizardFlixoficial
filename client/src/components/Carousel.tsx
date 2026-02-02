import { useRef, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselProps {
  children: ReactNode;
  className?: string;
}

export function Carousel({ children, className = "" }: CarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      <Button
        size="icon"
        variant="ghost"
        onClick={scrollLeft}
        className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/70 hover:bg-primary/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-110"
        data-testid="button-carousel-left"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </Button>

      <div 
        ref={scrollContainerRef}
        className={`flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth ${className}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      <Button
        size="icon"
        variant="ghost"
        onClick={scrollRight}
        className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/70 hover:bg-primary/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-110"
        data-testid="button-carousel-right"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}
