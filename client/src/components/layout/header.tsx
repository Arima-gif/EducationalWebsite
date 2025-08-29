import { Search, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ title, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="glass-card border-b border-border/30 px-6 py-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold gradient-text mb-1">{title}</h1>
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground/80">
            <span className="font-medium">Admin</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="font-medium text-primary/80">{title}</span>
          </nav>
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-80 px-5 py-3 pl-12 pr-4 border border-border/50 rounded-2xl bg-background/80 backdrop-blur-md input-focus transition-all duration-300 text-sm font-medium placeholder:text-muted-foreground/60 group-hover:shadow-md"
              data-testid="search-input"
            />
            <Search className="absolute left-4 top-3.5 text-muted-foreground/60 w-5 h-5 transition-colors duration-300 group-hover:text-primary" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
          <button className="relative p-3 rounded-2xl hover:bg-accent/50 transition-all duration-300 group hover:shadow-md hover:transform hover:scale-105" data-testid="notifications-button">
            <Bell className="text-muted-foreground w-6 h-6 group-hover:text-primary transition-colors duration-300" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
}
