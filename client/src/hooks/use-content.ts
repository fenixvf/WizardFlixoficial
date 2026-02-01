import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// Trending Content
export function useTrending() {
  return useQuery({
    queryKey: [api.content.trending.path],
    queryFn: async () => {
      const res = await fetch(api.content.trending.path);
      if (!res.ok) throw new Error("Failed to fetch trending spells");
      return api.content.trending.responses[200].parse(await res.json());
    },
  });
}

// New Releases
export function useNewReleases() {
  return useQuery({
    queryKey: [api.content.newReleases.path],
    queryFn: async () => {
      const res = await fetch(api.content.newReleases.path);
      if (!res.ok) throw new Error("Failed to fetch new releases");
      return api.content.newReleases.responses[200].parse(await res.json());
    },
  });
}

// Search Content
export function useSearch(query: string) {
  return useQuery({
    queryKey: [api.content.search.path, query],
    enabled: query.length > 0,
    queryFn: async () => {
      // Note: GET request with body is unusual, standard practice is query params for search.
      // But adhering to the route definition if it expects a body, otherwise assuming query params for GET
      // Based on the schema input: z.object({ query: z.string() }), for a GET request this usually maps to querystring.
      const url = `${api.content.search.path}?query=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to cast search spell");
      return api.content.search.responses[200].parse(await res.json());
    },
  });
}

// Content Details
export function useContentDetails(type: 'movie' | 'tv', id: number) {
  return useQuery({
    queryKey: [api.content.details.path, type, id],
    queryFn: async () => {
      const url = buildUrl(api.content.details.path, { type, id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to read the grimoire page");
      return await res.json();
    },
  });
}

// Fandub Content
export function useFandubList() {
  return useQuery({
    queryKey: ['/api/fandub'],
    queryFn: async () => {
      const res = await fetch('/api/fandub');
      if (!res.ok) throw new Error("Failed to fetch fandub content");
      return await res.json();
    },
  });
}

// Fandub Details
export function useFandubDetails(id: number) {
  return useQuery({
    queryKey: ['/api/fandub', id],
    enabled: id > 0,
    queryFn: async () => {
      const res = await fetch(`/api/fandub/${id}`);
      if (!res.ok) throw new Error("Failed to fetch fandub details");
      return await res.json();
    },
  });
}

// Fandub Episode URL
export function useFandubEpisode(id: number, season: number, episode: number) {
  return useQuery({
    queryKey: ['/api/fandub', id, 'episode', season, episode],
    enabled: id > 0 && season > 0 && episode > 0,
    queryFn: async () => {
      const res = await fetch(`/api/fandub/${id}/episode?season=${season}&episode=${episode}`);
      if (!res.ok) throw new Error("Failed to fetch fandub episode");
      return await res.json();
    },
  });
}
