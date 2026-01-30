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
      nameColor: user?.nameColor || "default",
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
                    <FormLabel>Efeito de Nome</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={field.value === "default" ? "default" : "outline"}
                        onClick={() => field.onChange("default")}
                        className="w-full"
                      >
                        Padrão
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "rgb-pulse" ? "default" : "outline"}
                        onClick={() => field.onChange("rgb-pulse")}
                        className="w-full animate-rgb"
                      >
                        RGB Mágico
                      </Button>
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
