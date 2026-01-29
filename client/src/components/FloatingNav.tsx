import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  X,
  Home, 
  Sparkles, 
  Search, 
  ChevronRight,
  Flame,
  Ghost,
  Sword,
  Wand2,
  Heart,
  ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [genresOpen, setGenresOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const closeSheet = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            variant="ghost"
            className="fixed top-4 left-4 z-[100] w-10 h-10 rounded-lg bg-zinc-900/80 backdrop-blur-sm border border-white/10 hover:bg-zinc-800"
            data-testid="button-mobile-menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-zinc-950/98 backdrop-blur-xl border-r border-primary/20 p-0">
          <SheetHeader className="p-4 border-b border-white/10">
            <SheetTitle className="flex items-center gap-3">
              <img 
                src="/logo.jpg" 
                alt="Wizard Flix" 
                className="w-10 h-10 rounded-lg border border-primary/30"
              />
              <span className="font-rune text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                Wizard Flix
              </span>
            </SheetTitle>
          </SheetHeader>
          
          <nav className="flex flex-col p-3 gap-1">
            <Link href="/" onClick={closeSheet}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/") 
                  ? "bg-primary/20 text-purple-200 border border-primary/30" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}>
                <Home className="w-5 h-5 text-primary" />
                <span className="font-rune tracking-wider">Início</span>
              </div>
            </Link>
            
            <Collapsible open={genresOpen} onOpenChange={setGenresOpen}>
              <CollapsibleTrigger className="w-full">
                <div className={`flex items-center justify-between px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all`}>
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-rune tracking-wider">Gêneros</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${genresOpen ? 'rotate-90' : ''}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-1 mt-1">
                {GENRES.map((genre) => (
                  <Link key={genre.id} href={`/genres?id=${genre.id}`} onClick={closeSheet}>
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                      <genre.icon className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">{genre.name}</span>
                    </div>
                  </Link>
                ))}
                <Link href="/genres" onClick={closeSheet}>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-primary hover:bg-primary/10 transition-all">
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-sm font-medium">Ver Todos</span>
                  </div>
                </Link>
              </CollapsibleContent>
            </Collapsible>

            <Link href="/search" onClick={closeSheet}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/search") 
                  ? "bg-primary/20 text-purple-200 border border-primary/30" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}>
                <Search className="w-5 h-5 text-primary" />
                <span className="font-rune tracking-wider">Explorar</span>
              </div>
            </Link>
            
            <div className="border-t border-white/10 my-2 pt-2">
              <Link href="/grimoire" onClick={closeSheet}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive("/grimoire") 
                    ? "bg-primary/20 text-purple-200 border border-primary/30" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}>
                  <ScrollText className="w-5 h-5 text-red-500" />
                  <span className="font-rune tracking-wider">Favoritos</span>
                </div>
              </Link>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
