import { useState } from "react";
import { Link } from "wouter";
import { 
  Plus, 
  Home, 
  Sparkles, 
  Search, 
  ChevronRight,
  Flame,
  Ghost,
  Sword,
  Wand2,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

const GENRES = [
  { id: 16, name: "Animação", icon: Sparkles },
  { id: 10759, name: "Ação & Aventura", icon: Sword },
  { id: 35, name: "Comédia", icon: Ghost },
  { id: 10765, name: "Fantasia", icon: Wand2 },
  { id: 10762, name: "Kids", icon: Heart },
  { id: 9648, name: "Mistério", icon: Search },
  { id: 18, name: "Drama", icon: Flame },
];

export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      whileDrag={{ scale: 1.1 }}
      className="fixed bottom-6 right-6 z-[100] md:hidden"
    >
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            size="icon" 
            className={`
              w-14 h-14 rounded-full shadow-2xl transition-all duration-500
              ${isOpen ? 'rotate-45 bg-zinc-800' : 'bg-primary hover:scale-110'}
              border-2 border-white/10
            `}
            data-testid="button-fab"
          >
            <Plus className="w-8 h-8 text-white" />
            {!isOpen && (
              <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={15}
          className="w-56 bg-zinc-950/95 backdrop-blur-xl border-primary/20 text-purple-100 p-2"
        >
          <Link href="/">
            <DropdownMenuItem className="cursor-pointer py-3 rounded-lg focus:bg-primary/20 focus:text-white">
              <Home className="w-5 h-5 mr-3 text-primary" />
              <span className="font-rune tracking-wider">Início</span>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer py-3 rounded-lg focus:bg-primary/20 focus:text-white">
              <Sparkles className="w-5 h-5 mr-3 text-primary" />
              <span className="font-rune tracking-wider">Gêneros</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-zinc-950/95 backdrop-blur-xl border-primary/20 text-purple-100 min-w-[180px] p-2">
                {GENRES.map((genre) => (
                  <Link key={genre.id} href={`/genres?id=${genre.id}`}>
                    <DropdownMenuItem className="cursor-pointer py-2.5 rounded-lg focus:bg-primary/20 focus:text-white group">
                      <genre.icon className="w-4 h-4 mr-3 text-purple-400 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">{genre.name}</span>
                    </DropdownMenuItem>
                  </Link>
                ))}
                <div className="border-t border-white/10 my-1 pt-1">
                  <Link href="/genres">
                    <DropdownMenuItem className="cursor-pointer py-2.5 rounded-lg focus:bg-primary/20 focus:text-white">
                      <ChevronRight className="w-4 h-4 mr-3 text-primary" />
                      <span className="text-sm">Ver Todos</span>
                    </DropdownMenuItem>
                  </Link>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <Link href="/search">
            <DropdownMenuItem className="cursor-pointer py-3 rounded-lg focus:bg-primary/20 focus:text-white">
              <Search className="w-5 h-5 mr-3 text-primary" />
              <span className="font-rune tracking-wider">Explorar</span>
            </DropdownMenuItem>
          </Link>
          
          <div className="border-t border-white/10 mt-2 pt-2">
            <Link href="/grimoire">
              <DropdownMenuItem className="cursor-pointer py-3 rounded-lg focus:bg-primary/20 focus:text-white">
                <Heart className="w-5 h-5 mr-3 text-red-500" />
                <span className="font-rune tracking-wider">Favoritos</span>
              </DropdownMenuItem>
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
