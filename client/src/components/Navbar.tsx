import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { ScrollText, Search, User, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => location === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/50 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src="/logo.jpg" 
              alt="Wizard Flix" 
              className="w-10 h-10 rounded-lg relative z-10 border border-primary/30"
            />
          </div>
          <span className="font-rune text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 tracking-wider group-hover:to-purple-200 transition-all hidden sm:inline">
            Wizard Flix
          </span>
        </Link>

        {/* Search Bar - Center */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar animes..."
            className="bg-white/5 border-white/10 pl-10 h-9 rounded-full focus:bg-white/10 transition-all"
          />
        </form>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0">
          <NavLink href="/" active={isActive("/")} icon={<Sparkles className="w-4 h-4" />}>
            Início
          </NavLink>
          <NavLink href="/grimoire" active={isActive("/grimoire")} icon={<ScrollText className="w-4 h-4" />}>
            Grimório
          </NavLink>
          <NavLink href="/genres" active={isActive("/genres")} icon={<Sparkles className="w-4 h-4" />}>
            Gêneros
          </NavLink>
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full w-10 h-10 p-0 border border-primary/20 hover:bg-primary/10 hover:border-primary/50 overflow-hidden">
                  {(user as any).avatarUrl ? (
                    <img src={(user as any).avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-purple-300" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-950 border-primary/20 text-purple-100">
                <div className="px-2 py-1.5 text-sm font-semibold text-purple-400 border-b border-white/10 mb-1">
                  {user.username}
                </div>
                <Link href="/grimoire">
                  <DropdownMenuItem className="cursor-pointer">
                    <ScrollText className="w-4 h-4 mr-2" />
                    Minha Lista
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => logout()} className="text-red-400 focus:text-red-300 focus:bg-red-950/30 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button size="sm" className="font-rune tracking-wide bg-primary/20 hover:bg-primary/40 text-primary-foreground border border-primary/50 hover:border-primary">
                Entrar na Guilda
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children, icon }: { href: string; active: boolean; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <div
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer
          ${active 
            ? "bg-primary/20 text-purple-200 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)] border border-primary/30" 
            : "text-zinc-400 hover:text-white hover:bg-white/5"}
        `}
      >
        {icon}
        {children}
      </div>
    </Link>
  );
}