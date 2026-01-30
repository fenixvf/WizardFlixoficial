import { useUser } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  username: z.string().min(3).max(20),
  nameColor: z.string(),
});

export default function Profile() {
  const { data: user } = useUser();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      nameColor: (user as any)?.nameColor || "default",
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("PATCH", "/api/user/profile", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      toast({ title: "Perfil Atualizado", description: "Suas mudanças foram salvas no grimório." });
    },
  });

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 pt-24 pb-20">
      <Card className="max-w-md mx-auto bg-background/60 backdrop-blur-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-rune text-primary text-center">Configurações de Mago</CardTitle>
          {form.watch("username") && (
            <div className="flex justify-center mt-4">
              <span className={cn(
                "text-lg font-bold transition-all duration-300",
                form.watch("nameColor") === 'rgb-pulse' && "animate-rgb",
                form.watch("nameColor") === 'rgb-fire' && "animate-rgb-fire",
                form.watch("nameColor") === 'rgb-ice' && "animate-rgb-ice",
                form.watch("nameColor") === 'rgb-nature' && "animate-rgb-nature"
              )}>
                {form.watch("username")}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => updateProfile.mutate(v))} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Mago</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={20} className="bg-zinc-900/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nameColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary/80 mb-4 block">Essência do seu Nome</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: "default", label: "Padrão", class: "", desc: "A simplicidade de um mago aprendiz." },
                        { id: "rgb-pulse", label: "Arco-Íris", class: "animate-rgb", desc: "Todo o espectro da magia rúnica." },
                        { id: "rgb-fire", label: "Fogo Eterno", class: "animate-rgb-fire", desc: "Chamas que nunca se apagam." },
                        { id: "rgb-ice", label: "Gelo Arcano", class: "animate-rgb-ice", desc: "O frio absoluto do vazio." },
                        { id: "rgb-nature", label: "Vida Natural", class: "animate-rgb-nature", desc: "A força primordial da floresta." },
                      ].map((effect) => (
                        <div
                          key={effect.id}
                          onClick={() => field.onChange(effect.id)}
                          className={cn(
                            "relative group cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                            field.value === effect.id
                              ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                              : "border-primary/10 bg-zinc-900/40 hover:border-primary/40"
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            <span className={cn("text-lg font-bold transition-all duration-300", effect.class)}>
                              {effect.label}
                            </span>
                            <span className="text-xs text-muted-foreground leading-relaxed">
                              {effect.desc}
                            </span>
                          </div>
                          {field.value === effect.id && (
                            <div className="absolute top-2 right-2">
                              <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(139,92,246,1)]" />
                            </div>
                          )}
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                            field.value === effect.id && "opacity-100"
                          )} />
                          {/* Animated background glow on hover */}
                          <div className="absolute -inset-px bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                Salvar Alterações
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
