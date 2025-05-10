import React, { useState } from "react";
import { Gamepad, Calendar, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPromos as initialMockPromos } from "@/data/mockAdminData";

export const GamesTab: React.FC = () => {
  const { toast } = useToast();
  const [featuredGame, setFeaturedGame] = useState<number | null>(null);

  const handleFeatureGame = (gameId: number) => {
    setFeaturedGame(gameId);
    toast({
      title: "Game Featured",
      description: `${mockGames.find(g => g.id === gameId)?.name} is now featured!`,
    });
  };
  
  return (
    <TabsContent value="games" className="glass-dark p-6 rounded-lg border border-xforge-teal/10 shadow-lg animate-fade-in">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center">
        <Gamepad className="text-xforge-teal mr-2" size={24} />
        Feature Game Selection
      </h2>
      <p className="text-xforge-gray mb-6">Select which game to feature on the Rewards page today</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockGames.map((game) => (
          <Card 
            key={game.id} 
            className={`overflow-hidden card-3d cursor-pointer bg-xforge-darkgray/40 border-2 transition-all duration-300 ${
              featuredGame === game.id ? 'border-xforge-teal shadow-glow' : 'border-transparent'
            }`}
            onClick={() => handleFeatureGame(game.id)}
          >
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <Gamepad size={80} />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-xforge-teal/20 flex items-center justify-center mr-2">
                    <Gamepad className="text-xforge-teal" size={18} />
                  </div>
                  <CardTitle className="text-white text-lg">{game.name}</CardTitle>
                </div>
                {featuredGame === game.id && (
                  <div className="bg-xforge-teal text-xforge-dark font-bold text-xs p-1 rounded flex items-center animate-pulse-light">
                    <Check size={12} className="mr-1" />
                    Featured
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xforge-lightgray text-xs mb-2 inline-block px-2 py-1 bg-xforge-darkgray/40 rounded">Type: {game.type}</p>
              <p className="text-xforge-gray text-sm line-clamp-2">{game.description}</p>
            </CardContent>
            <CardFooter className="bg-xforge-darkgray/30 border-t border-xforge-darkgray/50 pt-3 pb-3 flex justify-end">
              <Button 
                variant={featuredGame === game.id ? "default" : "outline"}
                size="sm"
                className={
                  featuredGame === game.id
                    ? "bg-xforge-teal text-xforge-dark hover:brightness-110"
                    : "text-xforge-teal border-xforge-teal hover:bg-xforge-teal hover:text-xforge-dark"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleFeatureGame(game.id);
                }}
              >
                {featuredGame === game.id ? (
                  <>
                    <Calendar size={14} className="mr-2" />
                    Featured Today
                  </>
                ) : (
                  "Set as Featured"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </TabsContent>
  );
};
