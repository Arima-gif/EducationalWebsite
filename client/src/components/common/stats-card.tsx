import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  change: string;
  changeText: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

export default function StatsCard({ title, value, icon: Icon, change, changeText, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover-scale">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="text-lg" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="text-green-600 font-medium">{change}</span>
        <span className="text-muted-foreground ml-2">{changeText}</span>
      </div>
    </div>
  );
}
