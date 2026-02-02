import { z } from 'zod';
import { insertUserSchema, insertFavoriteSchema, favorites } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// TMDB Response Types (Simplified)
const tmdbResultSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  overview: z.string(),
  vote_average: z.number(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
});

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema,
      responses: {
        201: z.object({ id: z.number(), username: z.string() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: insertUserSchema,
      responses: {
        200: z.object({ id: z.number(), username: z.string() }),
        401: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.object({ 
          id: z.number(), 
          username: z.string(),
          avatarUrl: z.string().nullable().optional(),
          nameColor: z.string().nullable().optional(),
          isVip: z.boolean().nullable().optional(),
          socialUrl: z.string().nullable().optional(),
        }).nullable(),
      },
    },
  },
  content: {
    trending: {
      method: 'GET' as const,
      path: '/api/content/trending',
      responses: {
        200: z.object({ results: z.array(tmdbResultSchema) }),
      },
    },
    newReleases: {
      method: 'GET' as const,
      path: '/api/content/new-releases',
      responses: {
        200: z.object({ results: z.array(tmdbResultSchema) }),
      },
    },
    search: {
      method: 'GET' as const,
      path: '/api/content/search',
      input: z.object({ query: z.string() }),
      responses: {
        200: z.object({ results: z.array(tmdbResultSchema) }),
      },
    },
    details: {
      method: 'GET' as const,
      path: '/api/content/:type/:id', // type: 'movie' | 'tv'
      responses: {
        200: z.any(), // Full TMDB details object (complex)
        404: errorSchemas.notFound,
      },
    },
    dailyGenres: {
      method: 'GET' as const,
      path: '/api/content/daily-genres',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          name: z.string(),
          results: z.array(tmdbResultSchema)
        })),
      },
    },
  },
  favorites: {
    list: {
      method: 'GET' as const,
      path: '/api/favorites',
      responses: {
        200: z.array(z.custom<typeof favorites.$inferSelect>()),
      },
    },
    add: {
      method: 'POST' as const,
      path: '/api/favorites',
      input: insertFavoriteSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof favorites.$inferSelect>(),
        401: errorSchemas.internal,
      },
    },
    remove: {
      method: 'DELETE' as const,
      path: '/api/favorites/:tmdbId',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
