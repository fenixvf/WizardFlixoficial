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
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-background/95 backdrop-blur-xl shadow-2xl transition-all duration-500">
      <SidebarContent>
        <SidebarGroup>
          {/* Espaçamento superior para o menu */}
          <div className="h-4" />
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path} className="px-2 mb-1">
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.path}
                    tooltip={item.label}
                    className={cn(
                      "transition-all duration-300 min-h-[44px] rounded-xl group",
                      location === item.path 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Link href={item.path} className="flex items-center gap-3 w-full">
                      {/* Ícone com efeito de brilho suave no hover */}
                      <div className="flex items-center justify-center w-6 h-6 shrink-0 transition-transform group-hover:scale-110">
                        <item.icon className="h-5 w-5" />
                      </div>
                      {/* Texto que aparece suavemente ao expandir */}
                      <span className={cn(
                        "transition-all duration-300 origin-left font-semibold tracking-wide",
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
