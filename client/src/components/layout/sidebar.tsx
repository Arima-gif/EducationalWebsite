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
    { id: 'enrollments', label: 'Enrollments', icon: University },
  ];

  return (
    <aside className="sidebar-transition w-64 bg-card border-r border-border flex flex-col shadow-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">EduAdmin</h2>
            <p className="text-sm text-muted-foreground">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2" data-testid="sidebar-navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground transition-colors duration-200",
                "hover:bg-secondary",
                activeSection === item.id && "bg-secondary"
              )}
              data-testid={`nav-${item.id}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="text-primary-foreground text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">System Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
