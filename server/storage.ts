import { users, favorites, likes, comments, type User, type InsertUser, type Favorite, type InsertFavorite, type Like, type InsertLike, type Comment, type InsertComment } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: number, data: { username?: string; nameColor?: string }): Promise<User | undefined>;
  updateUserAvatar(userId: number, avatarUrl: string): Promise<User>;
  
  getFavorites(userId: number): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, tmdbId: number): Promise<void>;

  // Likes
  getLikesCount(tmdbId: number, type: string): Promise<number>;
  getUserLike(userId: number, tmdbId: number, type: string): Promise<Like | undefined>;
  addLike(data: InsertLike): Promise<Like>;
  removeLike(userId: number, tmdbId: number, type: string): Promise<void>;

  // Comments
  getComments(tmdbId: number, type: string): Promise<(Comment & { user: User })[]>;
  addComment(data: InsertComment): Promise<Comment>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getFavorites(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFavorite(userId: number, tmdbId: number): Promise<void> {
    await db.delete(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.tmdbId, tmdbId)
      )
    );
  }

  async updateUserAvatar(userId: number, avatarUrl: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ avatarUrl })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUserProfile(userId: number, data: { username?: string; nameColor?: string }): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Likes
  async getLikesCount(tmdbId: number, type: string): Promise<number> {
    const results = await db.select().from(likes).where(
      and(eq(likes.tmdbId, tmdbId), eq(likes.type, type))
    );
    return results.length;
  }

  async getUserLike(userId: number, tmdbId: number, type: string): Promise<Like | undefined> {
    const [like] = await db.select().from(likes).where(
      and(
        eq(likes.userId, userId),
        eq(likes.tmdbId, tmdbId),
        eq(likes.type, type)
      )
    );
    return like;
  }

  async addLike(data: InsertLike): Promise<Like> {
    const [like] = await db.insert(likes).values(data).returning();
    return like;
  }

  async removeLike(userId: number, tmdbId: number, type: string): Promise<void> {
    await db.delete(likes).where(
      and(
        eq(likes.userId, userId),
        eq(likes.tmdbId, tmdbId),
        eq(likes.type, type)
      )
    );
  }

  // Comments
  async getComments(tmdbId: number, type: string): Promise<(Comment & { user: User })[]> {
    const results = await db
      .select({
        comment: comments,
        user: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.tmdbId, tmdbId), eq(comments.type, type)))
      .orderBy(desc(comments.createdAt));
    
    return results.map(r => ({ ...r.comment, user: r.user }));
  }

  async addComment(data: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
  }
}

export const storage = new DatabaseStorage();
