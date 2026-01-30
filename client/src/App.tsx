import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookOpen, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Pages
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Details from "@/pages/Details";
import Watch from "@/pages/Watch";
import Grimoire from "@/pages/Grimoire";
import Genres from "@/pages/Genres";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/search" component={Search} />
      <Route path="/grimoire" component={Grimoire} />
      <Route path="/genres" component={Genres} />
      <Route path="/details/:type/:id" component={Details} />
      <Route path="/watch/:type/:id/:season?/:episode?" component={Watch} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full overflow-hidden bg-background">
            <AppSidebar />
            <div className="relative flex flex-1 flex-col overflow-hidden">
              <header className="flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl z-20 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-4">
                  <SidebarTrigger data-testid="button-sidebar-toggle" className="hover:bg-primary/10 transition-colors" />
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                    <span className="text-xl font-extrabold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent tracking-tight">
                      Wizard Flix
                    </span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-all duration-300">
                      <User className="h-5 w-5 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 border-primary/20 bg-background/95 backdrop-blur-lg">
                    <DropdownMenuLabel className="font-bold text-primary">Minha Conta Mágica</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-primary/10" />
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10">
                      <Link href="/profile" className="w-full flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10">
                      <Link href="/grimoire" className="w-full flex items-center">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Meu Grimório (Lista)</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-primary/10" />
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer">
                      Sair da sessão
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </header>
              <main className="flex-1 overflow-y-auto">
                <Router />
              </main>
              {/* Sidebar Blur Overlay when expanded */}
              <div className="fixed inset-0 z-10 bg-background/20 backdrop-blur-sm transition-opacity duration-300 pointer-events-none opacity-0 group-has-data-[state=expanded]/sidebar-wrapper:opacity-100" />
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
