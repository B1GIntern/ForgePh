import React from "react";
import { Users, Gamepad, Gift, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardStats } from "@/data/mockAdmindata";

export const DashboardStats: React.FC = () => {
  // Map icon names to components
  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "Users": return <Users className={className} />;
      case "Gamepad": return <Gamepad className={className} />;
      case "Gift": return <Gift className={className} />;
      case "Award": return <Award className={className} />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {dashboardStats.map((stat, index) => (
        <Card key={index} className="bg-xforge-darkgray/60 border-xforge-teal/10 shadow-md hover:shadow-xl transition-all duration-300 hover:border-xforge-teal/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xforge-gray text-sm mb-1">{stat.label}</p>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-xforge-dark/50 flex items-center justify-center">
              {getIcon(stat.icon, stat.color)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};