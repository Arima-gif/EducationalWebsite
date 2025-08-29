import { Search, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ title, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
            <span>Admin</span>
            <span>/</span>
            <span>{title}</span>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 px-4 py-2 pl-10 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              data-testid="search-input"
            />
            <Search className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
          </div>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors" data-testid="notifications-button">
            <Bell className="text-muted-foreground w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
