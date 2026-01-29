import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertFavorite } from "@shared/schema";

export function useFavorites() {
  return useQuery({
    queryKey: [api.favorites.list.path],
    queryFn: async () => {
      const res = await fetch(api.favorites.list.path);
      if (res.status === 401) return []; // Return empty if not logged in
      if (!res.ok) throw new Error("Failed to open grimoire");
      return api.favorites.list.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertFavorite, "userId">) => {
      const res = await fetch(api.favorites.add.path, {
        method: api.favorites.add.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (res.status === 401) throw new Error("Please login to use your Grimoire");
      if (!res.ok) throw new Error("Failed to add spell to grimoire");
      
      return api.favorites.add.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
      toast({
        title: "Spell Transcribed",
        description: "Added to your personal Grimoire.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Spell Fizzled",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tmdbId: number) => {
      const url = buildUrl(api.favorites.remove.path, { tmdbId });
      const res = await fetch(url, {
        method: api.favorites.remove.method,
      });
      
      if (!res.ok) throw new Error("Failed to remove spell");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
      toast({
        title: "Spell Erased",
        description: "Removed from your Grimoire.",
      });
    },
  });
}
