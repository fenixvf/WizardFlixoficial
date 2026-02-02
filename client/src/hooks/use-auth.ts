import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { InsertUser } from "@shared/schema";
import { useLocation } from "wouter";

interface User {
  id: number;
  username: string;
  avatarUrl?: string | null;
  nameColor?: string | null;
  isVip?: boolean | null;
  socialUrl?: string | null;
}

export function useUser() {
  return useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch wizard profile");
      return res.json();
    },
    retry: false,
    staleTime: 0,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid wizard credentials");
        throw new Error("Login failed");
      }
      return res.json() as Promise<User>;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({ title: "Welcome back, Wizard!" });
      setLocation("/");
    },
    onError: (err: Error) => {
      toast({ title: "Access Denied", description: err.message, variant: "destructive" });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      return res.json() as Promise<User>;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({ title: "Grimoire Created", description: "Your journey begins." });
      setLocation("/");
    },
    onError: (err: Error) => {
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({ title: "Farewell", description: "See you next time, traveler." });
      setLocation("/auth");
    },
  });
}
