import type { Express } from "express";
import { createServer, type Server } from "http";
import { users, favorites, likes, comments, insertUserSchema, insertFavoriteSchema, insertLikeSchema, insertCommentSchema } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { formatEmbedUrl, organizeSeasons, getEpisodeUrl, getTotalEpisodes, type FandubEmbed } from "./embed-utils";
import { storage } from "./storage";

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  params.api_key = process.env.TMDB_API_KEY || ''; 
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
  app.post("/api/auth/register", async (req, res) => {
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

  app.post("/api/auth/login", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // Check VIP list
    try {
      const vipsPath = path.resolve(process.cwd(), 'vips.json');
      const vipsData = await fs.readFile(vipsPath, 'utf-8');
      const vips = JSON.parse(vipsData);
      const vip = vips.find((v: any) => v.username === result.data.username && v.password === result.data.password);
      
      if (vip) {
        let user = await storage.getUserByUsername(vip.username);
        if (!user) {
          user = await storage.createUser({
            username: vip.username,
            password: vip.password,
            avatarUrl: vip.avatarUrl,
            isVip: true,
            socialUrl: vip.socialUrl
          } as any);
        } else if (!user.isVip) {
          await db.update(users).set({ isVip: true, socialUrl: vip.socialUrl, avatarUrl: vip.avatarUrl }).where(eq(users.id, user.id));
          user = await storage.getUser(user.id);
        }
        req.session.userId = user!.id;
        return res.json({ 
          id: user!.id, 
          username: user!.username,
          avatarUrl: user!.avatarUrl,
          nameColor: user!.nameColor,
          isVip: user!.isVip,
          socialUrl: user!.socialUrl
        });
      }
    } catch (e) {
      // Ignore if vips.json missing
    }

    const user = await storage.getUserByUsername(result.data.username);
    if (!user || user.password !== result.data.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = user.id;
    res.json({ 
      id: user.id, 
      username: user.username,
      avatarUrl: user.avatarUrl,
      nameColor: user.nameColor,
      isVip: user.isVip,
      socialUrl: user.socialUrl
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json(null);
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json(null);
    }
    res.json({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      nameColor: user.nameColor,
      isVip: user.isVip,
      socialUrl: user.socialUrl
    });
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/avatars", async (req, res) => {
    try {
      const avatarsPath = path.resolve(process.cwd(), 'avatars.json');
      const avatarsData = await fs.readFile(avatarsPath, 'utf-8');
      res.json(JSON.parse(avatarsData));
    } catch (e) {
      res.json([]);
    }
  });

  // Content Routes (TMDB Proxy)
  app.get("/api/content/trending", async (req, res) => {
    try {
      let catalog: any = { anime: [] };
      try {
        const catalogPath = path.resolve(process.cwd(), 'catalog.json');
        const catalogData = await fs.readFile(catalogPath, 'utf-8');
        catalog = JSON.parse(catalogData);
      } catch (e) {
        // Silently fail and use discovery if file doesn't exist
      }

      const animeIds = catalog.anime?.map((a: any) => a.id) || [];
      
      if (animeIds.length > 0) {
        const results = await Promise.all(
          animeIds.slice(0, 20).map((id: number) => 
            fetchTMDB(`/tv/${id}`).catch(() => null)
          )
        );
        return res.json({ results: results.filter(r => r !== null) });
      }

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

  app.get("/api/content/new-releases", async (req, res) => {
    try {
      let catalog: any = { anime: [] };
      try {
        const catalogPath = path.resolve(process.cwd(), 'catalog.json');
        const catalogData = await fs.readFile(catalogPath, 'utf-8');
        catalog = JSON.parse(catalogData);
      } catch (e) {
        // Silently fail
      }

      const animeIds = catalog.anime?.map((a: any) => a.id) || [];
      
      if (animeIds.length > 0) {
        const results = await Promise.all(
          [...animeIds].reverse().slice(0, 10).map(id => 
            fetchTMDB(`/tv/${id}`).catch(() => null)
          )
        );
        return res.json({ results: results.filter(r => r !== null) });
      }

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

  app.get("/api/content/daily-genres", async (req, res) => {
    try {
      // List of anime-relevant genres in TMDB
      // 16: Animation (Mandatory for our context)
      // 10759: Action & Adventure
      // 35: Comedy
      // 18: Drama
      // 10765: Sci-Fi & Fantasy
      // 9648: Mystery
      const allGenres = [
        { id: 10759, name: 'Ação e Aventura' },
        { id: 35, name: 'Comédia' },
        { id: 18, name: 'Drama' },
        { id: 10765, name: 'Sci-Fi e Fantasia' },
        { id: 9648, name: 'Mistério' },
        { id: 10751, name: 'Família' },
        { id: 80, name: 'Crime' }
      ];

      // Select 3 genres based on the day
      const today = new Date();
      const seed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
      const shuffled = [...allGenres].sort((a, b) => {
        const hashA = (a.id * seed) % 100;
        const hashB = (b.id * seed) % 100;
        return hashA - hashB;
      });
      const selectedGenres = shuffled.slice(0, 3);

      const results = await Promise.all(selectedGenres.map(async (genre) => {
        const data = await fetchTMDB('/discover/tv', {
          with_genres: `16,${genre.id}`,
          with_original_language: 'ja',
          sort_by: 'popularity.desc',
          page: '1'
        });
        return {
          id: genre.id,
          name: genre.name,
          results: data.results?.slice(0, 10) || []
        };
      }));

      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch daily genres" });
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
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Não autorizado" });
    
    const { username, nameColor, avatarUrl } = req.body;
    
    try {
      const updatedUser = await storage.updateUserProfile(userId, { username, nameColor, avatarUrl });
      if (!updatedUser) return res.status(404).json({ message: "Usuário não encontrado" });
      
      // Importante: atualizar os dados na sessão se necessário
      // Embora aqui usemos o userId da sessão para buscar do banco, 
      // alguns sistemas guardam cópias dos dados na sessão.
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        avatarUrl: updatedUser.avatarUrl,
        nameColor: updatedUser.nameColor,
        isVip: updatedUser.isVip,
        socialUrl: updatedUser.socialUrl
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Nome de usuário já em uso ou dados inválidos" });
    }
  });

  app.get("/api/content/search", async (req, res) => {
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

  // Fandub Routes
  app.get("/api/fandub", async (req, res) => {
    try {
      const fandubPath = path.resolve(process.cwd(), 'fandub.json');
      const fandubData = await fs.readFile(fandubPath, 'utf-8');
      const fandub = JSON.parse(fandubData);
      
      const results = await Promise.all(
        fandub.fandubs.map(async (item: any) => {
          try {
            const tmdbId = item.tmdbId || item.id;
            if (!tmdbId) {
              console.warn(`Item no fandub.json sem tmdbId ou id:`, item.title);
              return null;
            }
            const type = item.type || 'tv';
            const tmdbData = await fetchTMDB(`/${type}/${tmdbId}`);
            return {
              ...tmdbData,
              id: tmdbId, // Garante que o ID seja o do TMDB
              isFandub: true,
              embedUrl: item.embedUrl ? formatEmbedUrl(item.embedUrl) : null,
              studio: item.studio,
              cast: item.cast,
              totalEpisodes: item.seasons ? getTotalEpisodes(item.seasons) : 0
            };
          } catch (err) {
            console.error(`Erro ao buscar TMDB ID ${item.tmdbId || item.id}:`, err);
            return null;
          }
        })
      );
      
      res.json({ results: results.filter(r => r !== null) });
    } catch (err) {
      console.error(err);
      res.json({ results: [] });
    }
  });

  app.get("/api/fandub/:id", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.id);
      const fandubPath = path.resolve(process.cwd(), 'fandub.json');
      const fandubData = await fs.readFile(fandubPath, 'utf-8');
      const fandub = JSON.parse(fandubData);
      
      const fandubItem = fandub.fandubs.find((f: any) => (f.tmdbId || f.id) === tmdbId);
      if (!fandubItem) {
        return res.status(404).json({ message: "Fandub não encontrado no catálogo" });
      }
      
      const type = fandubItem.type || 'tv';
      const tmdbData = await fetchTMDB(`/${type}/${tmdbId}`, {
        append_to_response: 'external_ids,videos,credits'
      });

      res.json({
        ...tmdbData,
        id: tmdbId,
        isFandub: true,
        type: type,
        seasons: fandubItem.seasons ? organizeSeasons(fandubItem.seasons) : [],
        seasonsRaw: fandubItem.seasons || {},
        tmdbSeasons: tmdbData.seasons || [],
        embedUrl: fandubItem.embedUrl ? formatEmbedUrl(fandubItem.embedUrl) : null,
        studio: fandubItem.studio,
        fandubCast: fandubItem.cast,
        totalEpisodes: fandubItem.seasons ? getTotalEpisodes(fandubItem.seasons) : 0
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao buscar conteúdo do fandub" });
    }
  });

  app.get("/api/fandub/:id/episode", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.id);
      const season = parseInt(req.query.season as string);
      const episode = parseInt(req.query.episode as string);

      if (isNaN(season) || isNaN(episode)) {
        return res.status(400).json({ message: "Temporada e episódio são obrigatórios" });
      }

      const fandubPath = path.resolve(process.cwd(), 'fandub.json');
      const fandubData = await fs.readFile(fandubPath, 'utf-8');
      const fandub = JSON.parse(fandubData);

      const fandubItem = fandub.fandubs.find((f: any) => (f.tmdbId || f.id) === tmdbId);
      if (!fandubItem || !fandubItem.seasons) {
        return res.status(404).json({ message: "Fandub não encontrado" });
      }

      const embedUrl = getEpisodeUrl(fandubItem.seasons, season, episode);
      if (!embedUrl) {
        return res.status(404).json({ message: "Episódio não encontrado" });
      }

      res.json({ 
        season,
        episode,
        embedUrl,
        tmdbId
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao buscar episódio" });
    }
  });

  // Favorites Routes
  app.get("/api/favorites", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const favs = await storage.getFavorites(userId);
    res.json(favs);
  });

  app.post("/api/favorites", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const result = insertFavoriteSchema.omit({ userId: true }).safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid data" });

    const existing = await storage.getFavorites(userId);
    const found = existing.find(f => f.tmdbId === result.data.tmdbId);
    if (found) return res.json(found);

    const fav = await storage.addFavorite({ ...result.data, userId });
    res.status(201).json(fav);
  });

  app.delete("/api/favorites/:tmdbId", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const tmdbId = parseInt(req.params.tmdbId as string);
    await storage.removeFavorite(userId, tmdbId);
    res.status(204).send();
  });

  // Likes & Comments
  app.get("/api/content/:type/:id/likes", async (req, res) => {
    const count = await storage.getLikesCount(Number(req.params.id), req.params.type);
    const userId = req.session?.userId;
    const userLike = userId ? await storage.getUserLike(userId, Number(req.params.id), req.params.type) : null;
    res.json({ count, userLiked: !!userLike });
  });

  app.post("/api/content/:type/:id/like", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const data = { userId, tmdbId: Number(req.params.id), type: req.params.type };
    const existing = await storage.getUserLike(userId, data.tmdbId, data.type);
    if (existing) {
      await storage.removeLike(userId, data.tmdbId, data.type);
      res.json({ liked: false });
    } else {
      await storage.addLike(data);
      res.json({ liked: true });
    }
  });

  app.get("/api/content/:type/:id/comments", async (req, res) => {
    const userId = req.session?.userId;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await storage.getComments(Number(req.params.id), req.params.type, userId, limit, offset);
    res.json(result);
  });

  app.patch("/api/comments/:id", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Não autorizado" });
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Conteúdo obrigatório" });
    
    const comment = await storage.updateComment(Number(req.params.id), userId, content);
    if (!comment) return res.status(404).json({ message: "Comentário não encontrado ou sem permissão" });
    res.json(comment);
  });

  app.delete("/api/comments/:id", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Não autorizado" });
    
    await storage.deleteComment(Number(req.params.id), userId);
    res.status(204).send();
  });

  app.post("/api/comments/:id/like", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Não autorizado" });
    
    const commentId = Number(req.params.id);
    const existing = await storage.getCommentLike(userId, commentId);
    
    if (existing) {
      await storage.removeCommentLike(userId, commentId);
      res.json({ liked: false });
    } else {
      await storage.addCommentLike(userId, commentId);
      res.json({ liked: true });
    }
  });

  app.post("/api/content/:type/:id/comment", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const result = insertCommentSchema.omit({ userId: true, tmdbId: true, type: true }).safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid data" });

    const comment = await storage.addComment({
      ...result.data,
      userId,
      tmdbId: Number(req.params.id),
      type: req.params.type
    });
    res.status(201).json(comment);
  });

  return httpServer;
}
