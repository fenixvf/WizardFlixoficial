import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";

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
    <div className="relative min-h-screen font-sans">
      <Navbar />
      <main>
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
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
