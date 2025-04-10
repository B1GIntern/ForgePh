import React, { useState } from "react";
import { Calendar as CalendarIcon, Plus, Trash, Zap } from "lucide-react";
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
import { mockPromos as initialMockPromos } from "@/data/mockAdmindata";

export const FlashPromosTab: React.FC = () => {
  const { toast } = useToast();
  const [flashPromos, setFlashPromos] = useState(initialMockPromos);
  const [newFlashPromo, setNewFlashPromo] = useState({
    name: "",
    startDate: "",
    endDate: "",
    prize: "",
    totalWinners: 0,
    active: false
  });

  const addFlashPromo = () => {
    if (!newFlashPromo.name || !newFlashPromo.startDate || !newFlashPromo.endDate || !newFlashPromo.prize || newFlashPromo.totalWinners <= 0) {
      toast({
        title: "Invalid Flash Promo",
        description: "Please fill all fields with valid values",
        variant: "destructive",
      });
      return;
    }
    
    const promo = {
      id: flashPromos.length + 1,
      ...newFlashPromo,
      remainingWinners: newFlashPromo.totalWinners
    };
    
    setFlashPromos([...flashPromos, promo]);
    setNewFlashPromo({
      name: "",
      startDate: "",
      endDate: "",
      prize: "",
      totalWinners: 0,
      active: false
    });
    
    toast({
      title: "Flash Promo Added",
      description: `${promo.name} has been added to active promotions`,
    });
  };

  const deleteFlashPromo = (id: number) => {
    setFlashPromos(flashPromos.filter(p => p.id !== id));
    toast({
      title: "Flash Promo Deleted",
      description: "The promotion has been removed",
    });
  };

  const togglePromoStatus = (id: number) => {
    setFlashPromos(flashPromos.map(promo => 
      promo.id === id ? { ...promo, active: !promo.active } : promo
    ));
    
    const promo = flashPromos.find(p => p.id === id);
    if (promo) {
      toast({
        title: promo.active ? "Promo Deactivated" : "Promo Activated",
        description: `${promo.name} is now ${promo.active ? 'inactive' : 'active'}`,
      });
    }
  };

  return (
    <TabsContent value="flash-promos" className="space-y-6 animate-fade-in">
      <Card className="glass-dark border border-xforge-teal/10 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xl">Create New Flash Promotion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="promo-name" className="text-xforge-gray">Promotion Name</Label>
              <Input 
                id="promo-name" 
                placeholder="Enter promotion name" 
                value={newFlashPromo.name}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, name: e.target.value})}
                className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
              />
            </div>
            <div>
              <Label htmlFor="promo-start" className="text-xforge-gray">Start Date</Label>
              <Input 
                id="promo-start" 
                type="date" 
                value={newFlashPromo.startDate}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, startDate: e.target.value})}
                className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
              />
            </div>
            <div>
              <Label htmlFor="promo-end" className="text-xforge-gray">End Date</Label>
              <Input 
                id="promo-end" 
                type="date" 
                value={newFlashPromo.endDate}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, endDate: e.target.value})}
                className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
              />
            </div>
            <div>
              <Label htmlFor="promo-prize" className="text-xforge-gray">Prize Description</Label>
              <Input 
                id="promo-prize" 
                placeholder="Prize description" 
                value={newFlashPromo.prize}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, prize: e.target.value})}
                className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
              />
            </div>
            <div>
              <Label htmlFor="promo-winners" className="text-xforge-gray">Total Winners</Label>
              <Input 
                id="promo-winners" 
                type="number" 
                placeholder="Number of winners" 
                value={newFlashPromo.totalWinners || ''}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, totalWinners: parseInt(e.target.value) || 0})}
                className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addFlashPromo}
                className="bg-gradient-to-r from-xforge-teal to-cyan-500 text-xforge-dark hover:brightness-110 w-full shadow-glow"
              >
                <Plus size={16} className="mr-2" />
                Add Flash Promo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-dark border border-xforge-teal/10 shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-white text-xl">Manage Flash Promotions</CardTitle>
          <div className="bg-xforge-darkgray/60 px-3 py-1 rounded-full flex items-center text-xforge-gray text-sm">
            <CalendarIcon size={14} className="mr-2 text-pink-400" />
            {flashPromos.filter(p => p.active).length} Active Promos
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-xforge-darkgray/30">
                <TableRow>
                  <TableHead className="text-xforge-teal font-bold">ID</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Name</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Period</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Prize</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Winners</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Status</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flashPromos.map((promo) => (
                  <TableRow key={promo.id} className="hover:bg-xforge-teal/5 border-b border-xforge-darkgray/50">
                    <TableCell className="font-medium">{promo.id}</TableCell>
                    <TableCell>{promo.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-xforge-gray">From: {new Date(promo.startDate).toLocaleDateString()}</span>
                        <span className="text-xs text-xforge-gray">To: {new Date(promo.endDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{promo.prize}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xforge-teal">{promo.remainingWinners}/{promo.totalWinners}</span>
                        <div className="h-1.5 w-24 bg-xforge-darkgray/50 rounded-full mt-1">
                          <div 
                            className="h-full bg-gradient-to-r from-xforge-teal to-cyan-500 rounded-full" 
                            style={{ width: `${(promo.remainingWinners / promo.totalWinners) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        promo.active
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-xforge-darkgray/30 text-xforge-gray border border-xforge-gray/20'
                      }`}>
                        {promo.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => togglePromoStatus(promo.id)}
                          className={
                            promo.active
                              ? "border-amber-500 text-amber-400 hover:bg-amber-500/20"
                              : "border-green-500 text-green-400 hover:bg-green-500/20"
                          }
                        >
                          {promo.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteFlashPromo(promo.id)}
                          className="hover:bg-red-700 transition-colors"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
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
