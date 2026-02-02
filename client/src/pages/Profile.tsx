import * as React from "react";
import { useUser } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Star } from "lucide-react";

const profileSchema = z.object({
  username: z.string().min(3).max(20),
  nameColor: z.string(),
  avatarUrl: z.string().optional(),
});

export default function Profile() {
  const { data: user } = useUser();
  const { toast } = useToast();

  const { data: avatars = [] } = useQuery<string[]>({
    queryKey: ["/api/avatars"],
  });

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      nameColor: user?.nameColor || "default",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  // Reset form when user data loads
  React.useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        nameColor: user.nameColor || "default",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, form]);

  const updateProfile = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("PATCH", "/api/user/profile", values);
      return res.json();
    },
    onSuccess: (data) => {
      // Forçar atualização do cache global
      queryClient.setQueryData(["/api/user"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Perfil Atualizado", description: "Suas mudanças foram salvas no grimório." });
    },
  });

  const commonColors = [
    { id: "default", label: "Padrão", color: "inherit" },
    { id: "red", label: "Vermelho", color: "#ef4444" },
    { id: "blue", label: "Azul", color: "#3b82f6" },
    { id: "yellow", label: "Amarelo", color: "#eab308" },
    { id: "purple", label: "Roxo", color: "#a855f7" },
    { id: "green", label: "Verde", color: "#22c55e" },
    { id: "cyan", label: "Ciano", color: "#06b6d4" },
  ];

  const vipEffects = [
    { id: "rgb-pulse", label: "Arco-Íris", class: "animate-rgb", desc: "Todo o espectro da magia rúnica." },
    { id: "rgb-fire", label: "Fogo Eterno", class: "animate-rgb-fire", desc: "Chamas que nunca se apagam." },
    { id: "rgb-ice", label: "Gelo Arcano", class: "animate-rgb-ice", desc: "O frio absoluto do vazio." },
    { id: "rgb-nature", label: "Vida Natural", class: "animate-rgb-nature", desc: "A força primordial da floresta." },
  ];

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 pt-24 pb-20">
      <Card className="max-w-2xl mx-auto bg-background/60 backdrop-blur-xl border-primary/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-rune text-primary mb-6">Configurações de Mago</CardTitle>
          
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-xl">
              <AvatarImage src={form.watch("avatarUrl")} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-rune">
                {form.watch("username")?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            {form.watch("username") && (
              <span className={cn(
                "text-xl font-black transition-all duration-300 px-4 py-1 rounded-xl bg-primary/5 border border-primary/10 shadow-sm",
                form.watch("nameColor") === 'rgb-pulse' && "animate-rgb",
                form.watch("nameColor") === 'rgb-fire' && "animate-rgb-fire",
                form.watch("nameColor") === 'rgb-ice' && "animate-rgb-ice",
                form.watch("nameColor") === 'rgb-nature' && "animate-rgb-nature",
                (!form.watch("nameColor") || form.watch("nameColor") === 'default') && "text-primary"
              )}
              style={!['default', 'rgb-pulse', 'rgb-fire', 'rgb-ice', 'rgb-nature'].includes(form.watch("nameColor")) ? { color: form.watch("nameColor") } : {}}
              >
                {form.watch("username")}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => updateProfile.mutate(v))} className="space-y-8">
              <div className="space-y-4">
                <FormLabel className="text-primary font-bold">Escolha seu Avatar</FormLabel>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {avatars.map((url) => (
                    <div
                      key={url}
                      onClick={() => form.setValue("avatarUrl", url)}
                      className={cn(
                        "aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all",
                        form.watch("avatarUrl") === url ? "border-primary shadow-lg scale-105" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={url} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary font-bold">Nome do Mago</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={20} className="bg-zinc-900/50 border-primary/20 focus:border-primary/50 h-12 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel className="text-primary font-bold">Essência do seu Nome</FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {commonColors.map((c) => (
                    <Button
                      key={c.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue("nameColor", c.id === 'default' ? 'default' : c.color)}
                      className={cn(
                        "h-10 border-primary/10",
                        (form.watch("nameColor") === c.color || (c.id === 'default' && form.watch("nameColor") === 'default')) && "border-primary bg-primary/10"
                      )}
                      style={{ color: c.color }}
                    >
                      {c.label}
                    </Button>
                  ))}
                </div>

                {user.isVip && (
                  <div className="pt-4 border-t border-primary/10">
                    <FormLabel className="text-yellow-500 font-bold mb-4 block flex items-center gap-2">
                      <Star className="w-4 h-4" /> Efeitos VIP Arcanos
                    </FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {vipEffects.map((effect) => (
                        <div
                          key={effect.id}
                          onClick={() => form.setValue("nameColor", effect.id)}
                          className={cn(
                            "relative group cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 hover:scale-[1.02]",
                            form.watch("nameColor") === effect.id
                              ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                              : "border-primary/10 bg-zinc-900/40 hover:border-primary/40"
                          )}
                        >
                          <span className={cn("text-lg font-bold transition-all duration-300", effect.class)}>
                            {effect.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Alterações"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}