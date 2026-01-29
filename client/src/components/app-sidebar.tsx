import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Home, Search, BookOpen, Layers, Settings, LogIn } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

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
    <Sidebar collapsible="icon" className="border-r-0 bg-background/80 backdrop-blur-xl">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.path}
                    tooltip={item.label}
                    className={cn(
                      "transition-all duration-300",
                      location === item.path ? "bg-primary/20 text-primary" : "hover:bg-primary/10"
                    )}
                  >
                    <Link href={item.path} className="flex items-center gap-4 px-2">
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className={cn(
                        "transition-all duration-300 origin-left",
                        isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-0 w-0"
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
