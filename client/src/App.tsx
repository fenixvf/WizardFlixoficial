import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "./components/ThemeToggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookOpen } from "lucide-react";

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
              <header className="flex h-16 items-center justify-between border-b bg-background/50 px-4 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                      Wizard Flix
                    </span>
                  </div>
                </div>
                <ThemeToggle />
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
