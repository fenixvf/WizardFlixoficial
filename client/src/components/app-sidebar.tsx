import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Home, Search, BookOpen, Layers, Settings, LogIn } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Lista de itens do menu para navegação
const menuItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Search, label: "Procurar", path: "/search" },
  { icon: BookOpen, label: "Grimório", path: "/grimoire" },
  { icon: Layers, label: "Gêneros", path: "/genres" },
  { icon: LogIn, label: "Entrar", path: "/auth" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { state, setOpenMobile } = useSidebar();
  const isExpanded = state === "expanded";

  // Função para fechar o menu ao clicar em um item (especialmente no mobile)
  const handleItemClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-primary/10 bg-background/95 backdrop-blur-xl shadow-2xl transition-all duration-500">
      <SidebarContent className="p-3">
        <SidebarGroup>
          {/* Espaçamento superior para o menu */}
          <div className="h-4" />
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.path}
                    tooltip={item.label}
                    onClick={handleItemClick}
                    className={cn(
                      "transition-all duration-300 min-h-[48px] rounded-2xl group px-4",
                      location === item.path 
                        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30 scale-105" 
                        : "hover:bg-primary/15 text-muted-foreground hover:text-primary hover:translate-x-1"
                    )}
                  >
                    <Link href={item.path} className="flex items-center gap-4 w-full">
                      {/* Ícone com efeito de brilho suave no hover */}
                      <div className="flex items-center justify-center w-6 h-6 shrink-0 transition-transform group-hover:scale-110">
                        <item.icon className={cn("h-5 w-5", location === item.path ? "text-primary-foreground" : "text-primary")} />
                      </div>
                      {/* Texto que aparece suavemente ao expandir */}
                      <span className={cn(
                        "transition-all duration-300 origin-left font-bold tracking-tight text-sm",
                        isExpanded ? "opacity-100 scale-100 inline-block" : "hidden opacity-0 scale-0 w-0"
                      )}>
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
