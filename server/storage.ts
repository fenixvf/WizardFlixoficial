import { users, favorites, likes, comments, commentLikes, type User, type InsertUser, type Favorite, type InsertFavorite, type Like, type InsertLike, type Comment, type InsertComment, type CommentLike } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: number, data: { username?: string; nameColor?: string; avatarUrl?: string }): Promise<User | undefined>;
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
  getComments(tmdbId: number, type: string, userId?: number, limit?: number, offset?: number): Promise<{ comments: (Comment & { user: User, likesCount: number, userLiked: boolean })[], hasMore: boolean }>;
  addComment(data: InsertComment): Promise<Comment>;
  updateComment(id: number, userId: number, content: string): Promise<Comment | undefined>;
  deleteComment(id: number, userId: number): Promise<void>;
  
  // Comment Likes
  getCommentLike(userId: number, commentId: number): Promise<CommentLike | undefined>;
  addCommentLike(userId: number, commentId: number): Promise<CommentLike>;
  removeCommentLike(userId: number, commentId: number): Promise<void>;
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

  async updateUserProfile(userId: number, data: { username?: string; nameColor?: string; avatarUrl?: string }): Promise<User | undefined> {
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
  async getComments(tmdbId: number, type: string, userId?: number, limit: number = 10, offset: number = 0): Promise<{ comments: (Comment & { user: User, likesCount: number, userLiked: boolean })[], hasMore: boolean }> {
    const results = await db
      .select({
        comment: comments,
        user: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.tmdbId, tmdbId), eq(comments.type, type)))
      .orderBy(desc(comments.createdAt))
      .limit(limit + 1)
      .offset(offset);
    
    const hasMore = results.length > limit;
    const commentItems = results.slice(0, limit);

    const items = await Promise.all(commentItems.map(async (r) => {
      const likesResults = await db.select().from(commentLikes).where(eq(commentLikes.commentId, r.comment.id));
      const userLiked = userId ? likesResults.some(l => l.userId === userId) : false;
      return { 
        ...r.comment, 
        user: r.user, 
        likesCount: likesResults.length,
        userLiked
      };
    }));
    
    return { comments: items, hasMore };
  }

  async addComment(data: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
  }

  async updateComment(id: number, userId: number, content: string): Promise<Comment | undefined> {
    const [comment] = await db.update(comments)
      .set({ content })
      .where(and(eq(comments.id, id), eq(comments.userId, userId)))
      .returning();
    return comment;
  }

  async deleteComment(id: number, userId: number): Promise<void> {
    await db.delete(comments).where(and(eq(comments.id, id), eq(comments.userId, userId)));
    await db.delete(commentLikes).where(eq(commentLikes.commentId, id));
  }

  // Comment Likes
  async getCommentLike(userId: number, commentId: number): Promise<CommentLike | undefined> {
    const [like] = await db.select().from(commentLikes).where(
      and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId))
    );
    return like;
  }

  async addCommentLike(userId: number, commentId: number): Promise<CommentLike> {
    const [like] = await db.insert(commentLikes).values({ userId, commentId }).returning();
    return like;
  }

  async removeCommentLike(userId: number, commentId: number): Promise<void> {
    await db.delete(commentLikes).where(
      and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId))
    );
  }
}

export const storage = new DatabaseStorage();
