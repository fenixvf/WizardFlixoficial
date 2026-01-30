import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookOpen, User, LogOut, LogIn } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import logoPng from "@assets/Design_sem_nome_20260129_132959_0000_(1)_1769734186849.png";
import { cn } from "@/lib/utils";

// Pages
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Details from "@/pages/Details";
import Watch from "@/pages/Watch";
import Grimoire from "@/pages/Grimoire";
import Genres from "@/pages/Genres";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
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
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function MainLayout() {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <TooltipProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <AppSidebar />
          <div className="relative flex flex-1 flex-col overflow-hidden">
            <header className="flex h-16 items-center justify-between border-b-0 bg-background/80 px-4 backdrop-blur-xl z-20 shadow-sm transition-all duration-300">
              <div className="flex items-center gap-4">
                <SidebarTrigger data-testid="button-sidebar-toggle" className="hover:bg-primary/10 transition-colors" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center overflow-hidden rounded-lg bg-primary/10 shadow-inner">
                    <img 
                      src={logoPng} 
                      alt="Wizard Flix Logo" 
                      className="h-full w-full object-cover scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
                    />
                  </div>
                  <span className="text-xl font-extrabold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent tracking-tight">
                    Wizard Flix
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {user && (
                  <span className={cn(
                    "text-sm font-bold transition-all duration-300",
                    user.nameColor === 'rgb-pulse' && "animate-rgb",
                    user.nameColor === 'rgb-fire' && "animate-rgb-fire",
                    user.nameColor === 'rgb-ice' && "animate-rgb-ice",
                    user.nameColor === 'rgb-nature' && "animate-rgb-nature"
                  )}>
                    {user.username.length > 12 ? `${user.username.substring(0, 12)}...` : user.username}
                  </span>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-all duration-300">
                      <User className="h-5 w-5 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 border-primary/20 bg-background/95 backdrop-blur-lg">
                    <DropdownMenuLabel className="font-bold text-primary">Minha Conta Mágica</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-primary/10" />
                    
                    {user ? (
                      <>
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
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer" onClick={() => logout()}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sair da sessão
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10">
                          <Link href="/auth" className="w-full flex items-center">
                            <LogIn className="mr-2 h-4 w-4" />
                            <span>Entrar / Registrar</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout />
    </QueryClientProvider>
  );
}
