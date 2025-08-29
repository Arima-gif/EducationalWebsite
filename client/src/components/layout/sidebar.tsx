import { cn } from "@/lib/utils";
import { GraduationCap, LayoutDashboard, Building, Users, BookOpen, University, User } from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const navigationItems = [
    { id: 'organizations', label: 'Organizations', icon: Building },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
  ];

  return (
    <aside className="sidebar-transition w-64 glass-card border-r border-border/30 flex flex-col shadow-xl">
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 btn-gradient rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="text-primary-foreground text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">EduAdmin</h2>
            <p className="text-sm text-muted-foreground">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-3" data-testid="sidebar-navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-300 group",
                isActive
                  ? "btn-gradient text-primary-foreground shadow-lg transform scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:shadow-md hover:transform hover:scale-[1.01] hover:translate-x-1"
              )}
              data-testid={`nav-${item.id}`}
            >
              <Icon className={cn(
                "w-6 h-6 transition-all duration-300",
                isActive ? "transform scale-110" : "group-hover:scale-105 group-hover:text-primary"
              )} />
              <span className="font-medium text-base">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary-foreground/70 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/30">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-accent/30 transition-colors duration-200">
          <div className="w-10 h-10 btn-gradient rounded-full flex items-center justify-center shadow-md">
            <User className="text-primary-foreground text-base" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground/80">System Administrator</p>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground/60 text-center">
          Version 2.0 • Modern Design
        </div>
      </div>
    </aside>
  );
}
