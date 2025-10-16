import { useState } from "react";
import {
  Home,
  Target,
  Calendar,
  FileText,
  Users,
  Settings,
  Bell,
  HelpCircle,
  BarChart3,
  Briefcase,
  Wrench,
  Mail,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { name: "Overview", key: "overview", icon: Home },
  { name: "Projects", key: "projects", icon: Briefcase },
  { name: "My Services", key: "services", icon: ShoppingCart },
  { name: "Journey", key: "journey", icon: Target },
  { name: "Learn", key: "learn", icon: HelpCircle },
  { name: "Milestones", key: "milestones", icon: Calendar },
  { name: "Timeline", key: "timeline", icon: Clock },
  { name: "Documents", key: "documents", icon: FileText },
  { name: "Team", key: "team", icon: Users },
  { name: "Analytics", key: "analytics", icon: BarChart3 },
];

const bottomItems = [
  { name: "Notifications", key: "notifications", icon: Bell },
  { name: "Settings", key: "settings", icon: Settings },
  { name: "Help", key: "help", icon: HelpCircle },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardSidebar({
  collapsed,
  setCollapsed,
  activeTab,
  setActiveTab,
}: DashboardSidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-background border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="bg-primary rounded-lg w-8 h-8 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                M
              </span>
            </div>
            <span className="font-semibold text-lg">MVP Dashboard</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.key)}
                className={cn(
                  "w-full flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                {!collapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <nav className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.key)}
                className={cn(
                  "w-full flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                {!collapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
