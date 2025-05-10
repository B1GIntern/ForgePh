import React, { useState } from "react";
import { LogOut, BarChart3, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated",
      });
    }, 1000);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 glass-dark backdrop-blur-md border-b border-xforge-teal/20 shadow-lg">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-xforge-teal to-cyan-500 flex items-center justify-center shadow-glow mr-3">
            <BarChart3 size={20} className="text-xforge-dark" />
          </div>
          <h1 className="text-xl font-bold text-white">
            <span className="text-xforge-teal">X</span>Forge Admin
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xforge-gray border-xforge-darkgray hover:bg-xforge-teal hover:text-xforge-dark"
            onClick={refreshData}
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="bg-xforge-darkgray/60 px-3 py-1 rounded-full flex items-center text-xforge-gray text-sm">
            <Clock size={14} className="mr-2 text-xforge-teal" />
            Last update: {new Date().toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            className="text-xforge-teal border-xforge-teal hover:bg-xforge-teal hover:text-xforge-dark"
            onClick={onLogout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
