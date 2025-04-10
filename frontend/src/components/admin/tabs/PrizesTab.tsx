import React, { useState } from "react";
import { Trophy, Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const PrizesTab: React.FC = () => {
  const { toast } = useToast();
  const [prizes, setPrizes] = useState([
    { id: 1, name: "iPhone 16", description: "Latest Apple smartphone", quantity: 1 },
    { id: 2, name: "Gaming Console", description: "Next-gen gaming system", quantity: 3 },
    { id: 3, name: "Smart Watch", description: "Fitness and health tracker", quantity: 5 }
  ]);
  const [newPrize, setNewPrize] = useState({ name: "", description: "", quantity: 1 });

  const addPrize = () => {
    if (!newPrize.name) {
      toast({
        title: "Invalid Prize",
        description: "Please enter a prize name",
        variant: "destructive",
      });
      return;
    }
    
    const prize = {
      id: prizes.length + 1,
      ...newPrize
    };
    
    setPrizes([...prizes, prize]);
    setNewPrize({ name: "", description: "", quantity: 1 });
    
    toast({
      title: "Prize Added",
      description: `${prize.name} has been added to the prize pool`,
    });
  };

  const deletePrize = (id: number) => {
    setPrizes(prizes.filter(p => p.id !== id));
    toast({
      title: "Prize Deleted",
      description: "The prize has been removed from the pool",
    });
  };

  return (
    <TabsContent value="prizes" className="space-y-6 animate-fade-in">
      <Card className="glass-dark border border-xforge-teal/10 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xl">Add New Prize</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="prize-name" className="text-xforge-gray">Prize Name</Label>
              <Input 
                id="prize-name" 
                placeholder="e.g. iPhone 16" 
                value={newPrize.name}
                onChange={(e) => setNewPrize({...newPrize, name: e.target.value})}
                className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
              />
            </div>
            <div>
              <Label htmlFor="prize-description" className="text-xforge-gray">Description</Label>
              <Input 
                id="prize-description" 
                placeholder="Brief description" 
                value={newPrize.description}
                onChange={(e) => setNewPrize({...newPrize, description: e.target.value})}
                className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
              />
            </div>
            <div>
              <Label htmlFor="prize-quantity" className="text-xforge-gray">Quantity</Label>
              <Input 
                id="prize-quantity" 
                type="number" 
                placeholder="Number available" 
                value={newPrize.quantity || ''}
                onChange={(e) => setNewPrize({...newPrize, quantity: parseInt(e.target.value) || 1})}
                className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addPrize}
                className="bg-gradient-to-r from-xforge-teal to-cyan-500 text-xforge-dark hover:brightness-110 w-full shadow-glow"
              >
                <Plus size={16} className="mr-2" />
                Add Prize
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-dark border border-xforge-teal/10 shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-white text-xl">Prize Pool</CardTitle>
          <div className="bg-xforge-darkgray/60 px-3 py-1 rounded-full flex items-center text-xforge-gray text-sm">
            <Trophy size={14} className="mr-2 text-amber-400" />
            {prizes.reduce((total, prize) => total + prize.quantity, 0)} Total Prizes
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-xforge-darkgray/30">
                <TableRow>
                  <TableHead className="text-xforge-teal font-bold">ID</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Prize</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Description</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Quantity</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prizes.map((prize) => (
                  <TableRow key={prize.id} className="hover:bg-xforge-teal/5 border-b border-xforge-darkgray/50">
                    <TableCell className="font-medium">{prize.id}</TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        <Trophy size={16} className="text-amber-400 mr-2" />
                        {prize.name}
                      </span>
                    </TableCell>
                    <TableCell>{prize.description}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full ${
                        prize.quantity > 3 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        prize.quantity > 1 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {prize.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deletePrize(prize.id)}
                        className="hover:bg-red-700 transition-colors"
                      >
                        <Trash size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
