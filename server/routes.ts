import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertUserSchema, insertFavoriteSchema } from "@shared/schema";
import { z } from "zod";

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  params.api_key = process.env.VITE_TMDB_API_KEY || ''; 
  params.language = 'pt-BR'; 
  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const options: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const res = await fetch(url.toString(), options);
  if (!res.ok) {
    throw new Error(`TMDB API Error: ${res.statusText}`);
  }
  return res.json();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid input" });
    }
    
    const existing = await storage.getUserByUsername(result.data.username);
    if (existing) {
      return res.status(400).json({ message: "Username taken" });
    }

    const user = await storage.createUser(result.data);
    res.status(201).json({ id: user.id, username: user.username });
  });

  app.post(api.auth.login.path, async (req, res) => {
     // Simple login for demo - in prod use sessions/passport
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const user = await storage.getUserByUsername(result.data.username);
    if (!user || user.password !== result.data.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ id: user.id, username: user.username });
  });

  // Content Routes (TMDB Proxy)
  app.get(api.content.trending.path, async (req, res) => {
    try {
      const data = await fetchTMDB('/discover/tv', {
        with_genres: '16',
        with_original_language: 'ja',
        sort_by: 'popularity.desc'
      });
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.get(api.content.newReleases.path, async (req, res) => {
    try {
      const data = await fetchTMDB('/discover/tv', {
        with_genres: '16',
        with_original_language: 'ja',
        sort_by: 'first_air_date.desc',
        'first_air_date.lte': new Date().toISOString().split('T')[0],
        'vote_count.gte': '10'
      });
      const results = data.results?.slice(0, 10) || [];
      res.json({ results });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch new releases" });
    }
  });

  app.get("/api/content/genre/:id", async (req, res) => {
    try {
      const data = await fetchTMDB('/discover/movie', {
        with_genres: `16,${req.params.id}`,
        with_original_language: 'ja',
        sort_by: 'popularity.desc'
      });
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch genre content" });
    }
  });

  app.post("/api/user/avatar", async (req, res) => {
    // Basic implementation for avatar update
    const { userId, avatarUrl } = req.body;
    if (!userId || !avatarUrl) return res.status(400).json({ message: "Missing data" });
    try {
      const user = await storage.updateUserAvatar(userId, avatarUrl);
      res.json(user);
    } catch (err) {
      res.status(404).json({ message: "User not found" });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Não autorizado" });
    const { username, nameColor } = req.body;
    
    try {
      const [updatedUser] = await db.update(users)
        .set({ username, nameColor })
        .where(eq(users.id, req.user!.id))
        .returning();
      
      if (!updatedUser) return res.status(404).json({ message: "Usuário não encontrado" });
      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Nome de usuário já em uso ou dados inválidos" });
    }
  });

  app.get(api.content.search.path, async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query) return res.status(400).json({ message: "Query required" });

      // Fuzzy search by fetching popular and searching multi with the query
      // TMDB search is already somewhat fuzzy, but we can combine results if needed.
      // For partial names, TMDB search usually handles it well.
      const data = await fetchTMDB('/search/multi', { 
        query: String(query),
        include_adult: 'false'
      });
      
      // If no results, try searching for anime specific (genre 16)
      if (data.results.length === 0) {
        const animeData = await fetchTMDB('/discover/tv', {
          with_genres: '16',
          with_original_language: 'ja',
          sort_by: 'popularity.desc'
        });
        // Simple client side filter mock-up if needed, but usually search/multi is better
        res.json(data);
      } else {
        res.json(data);
      }
    } catch (err) {
      res.status(500).json({ message: "Failed to search content" });
    }
  });

  app.get('/api/content/:type/:id', async (req, res) => {
    try {
      const { type, id } = req.params;
      // Get Details + IMDB ID (External IDs)
      const data = await fetchTMDB(`/${type}/${id}`, {
        append_to_response: 'external_ids,videos,credits'
      });
      res.json(data);
    } catch (err) {
      res.status(404).json({ message: "Content not found" });
    }
  });

  // Favorites Routes
  app.get(api.favorites.list.path, async (req, res) => {
    // Mock user ID 1 for MVP (since no session/cookie auth implemented fully yet)
    // In real app, get userId from session
    const userId = 1; 
    const favs = await storage.getFavorites(userId);
    res.json(favs);
  });

  app.post(api.favorites.add.path, async (req, res) => {
    const userId = 1; // Mock
    const result = insertFavoriteSchema.omit({ userId: true }).safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid data" });

    // Check if exists
    const existing = await storage.getFavorites(userId);
    const found = existing.find(f => f.tmdbId === result.data.tmdbId);
    if (found) return res.json(found);

    const fav = await storage.addFavorite({ ...result.data, userId });
    res.status(201).json(fav);
  });

  app.delete(api.favorites.remove.path, async (req, res) => {
    const userId = 1; // Mock
    const tmdbId = parseInt(req.params.tmdbId as string);
    await storage.removeFavorite(userId, tmdbId);
    res.status(204).send();
  });

  return httpServer;
}
