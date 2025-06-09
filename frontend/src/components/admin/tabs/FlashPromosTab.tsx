import React, { useState, useEffect } from "react";
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
import { getAllFlashPromos, createFlashPromo, updateFlashPromoStatus, deleteFlashPromo, NewFlashPromo } from "@/services/flashPromoService";
import { mockPromos as initialMockPromos } from "@/data/mockAdminData";

// Define a type for the flash promos used in the component
interface FlashPromoDisplay {
  id: number | string;
  name: string;
  startDate: string;
  endDate: string;
  prize: string;
  totalWinners: number;
  remainingWinners: number;
  currentParticipants: number;
  active: boolean;
  multiplier: number;
}

export const FlashPromosTab: React.FC = () => {
  const { toast } = useToast();
  const [flashPromos, setFlashPromos] = useState<FlashPromoDisplay[]>(initialMockPromos);
  const [newFlashPromo, setNewFlashPromo] = useState<NewFlashPromo>({
    name: "",
    startDate: "",
    endDate: "",
    prize: "",
    maxParticipants: 10,
    multiplier: 1,
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFlashPromos();
  }, []);

  const fetchFlashPromos = async () => {
    try {
      setIsLoading(true);
      const data = await getAllFlashPromos();
      console.log("Flash promos from API:", data);
      
      // If we get data from API, use it; otherwise use mock data
      if (data && data.length > 0) {
        // Map to expected format
        const formattedPromos = data.map((promo: any) => {
          // Check if the promo is at max capacity and should be deactivated
          const isFull = promo.currentParticipants >= promo.maxParticipants;
          
          // If it's active but full, automatically deactivate it
          if (promo.isActive && isFull) {
            // Make API call to deactivate (don't await to prevent blocking)
            updateFlashPromoStatus(promo._id, false)
              .then(() => console.log(`Auto-deactivated full promo: ${promo.name}`))
              .catch(err => console.error(`Failed to auto-deactivate promo: ${promo.name}`, err));
          }
          
          return {
            id: promo._id,
            name: promo.name,
            startDate: promo.startDate,
            endDate: promo.endDate,
            prize: promo.prize,
            totalWinners: promo.maxParticipants,
            remainingWinners: promo.maxParticipants - promo.currentParticipants,
            currentParticipants: promo.currentParticipants,
            // If full, make sure it's inactive in the UI
            active: isFull ? false : promo.isActive,
            multiplier: promo.multiplier || 1
          };
        });
        setFlashPromos(formattedPromos);
      }
    } catch (error) {
      console.error("Error fetching flash promos:", error);
      toast({
        title: "Error",
        description: "Failed to load flash promotions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFlashPromo = async () => {
    if (!newFlashPromo.name || !newFlashPromo.startDate || !newFlashPromo.endDate || !newFlashPromo.prize || newFlashPromo.maxParticipants <= 0) {
      toast({
        title: "Invalid Flash Promo",
        description: "Please fill all fields with valid values",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      // Call API to create
      const result = await createFlashPromo(newFlashPromo);
      console.log("Created flash promo:", result);
      
      // Add to UI
      const promo = {
        id: result._id,
        name: result.name,
        startDate: result.startDate,
        endDate: result.endDate,
        prize: result.prize,
        totalWinners: result.maxParticipants,
        remainingWinners: result.maxParticipants,
        currentParticipants: 0,
        active: result.isActive,
        multiplier: result.multiplier || 1
      };
      
      setFlashPromos([...flashPromos, promo]);
      setNewFlashPromo({
        name: "",
        startDate: "",
        endDate: "",
        prize: "",
        maxParticipants: 10,
        multiplier: 1,
        isActive: true
      });
      
      toast({
        title: "Flash Promo Added",
        description: `${promo.name} has been added to active promotions`,
      });
    } catch (error) {
      console.error("Error creating flash promo:", error);
      toast({
        title: "Error",
        description: "Failed to create flash promotion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFlashPromoHandler = async (id: number | string) => {
    try {
      setIsLoading(true);
      // Call API to delete
      await deleteFlashPromo(id.toString());
      
      // Update UI
      setFlashPromos(flashPromos.filter(p => p.id !== id));
      toast({
        title: "Flash Promo Deleted",
        description: "The promotion has been removed",
      });
    } catch (error) {
      console.error("Error deleting flash promo:", error);
      toast({
        title: "Error",
        description: "Failed to delete flash promotion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePromoStatus = async (id: number | string) => {
    try {
      setIsLoading(true);
      const promo = flashPromos.find(p => p.id === id);
      if (!promo) return;
      
      // Check if trying to activate a promo that's at max capacity
      if (!promo.active && promo.currentParticipants >= promo.totalWinners) {
        toast({
          title: "Cannot Activate",
          description: "This promo has reached maximum participants and cannot be activated",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Call API to update status
      await updateFlashPromoStatus(id.toString(), !promo.active);
      
      // Update UI
      setFlashPromos(flashPromos.map(promo => 
        promo.id === id ? { ...promo, active: !promo.active } : promo
      ));
      
      toast({
        title: promo.active ? "Promo Deactivated" : "Promo Activated",
        description: `${promo.name} is now ${promo.active ? 'inactive' : 'active'}`,
      });
    } catch (error) {
      console.error("Error toggling flash promo status:", error);
      toast({
        title: "Error",
        description: "Failed to update flash promotion status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
              <Label htmlFor="promo-winners" className="text-xforge-gray">Total Participants</Label>
              <Input 
                id="promo-winners" 
                type="number" 
                placeholder="Number of winners" 
                value={newFlashPromo.maxParticipants || ''}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, maxParticipants: parseInt(e.target.value) || 0})}
                className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="promo-multiplier" className="text-xforge-gray">Entry Multiplier</Label>
              <Input 
                id="promo-multiplier" 
                type="number" 
                placeholder="Point multiplier" 
                value={newFlashPromo.multiplier || ''}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, multiplier: parseInt(e.target.value) || 1})}
                className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addFlashPromo}
                disabled={isLoading}
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
                  <TableHead className="text-xforge-teal font-bold">Participants</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Multiplier</TableHead>
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
                        <span className={`text-xforge-teal ${promo.currentParticipants >= promo.totalWinners ? 'font-bold' : ''}`}>
                          {promo.currentParticipants}/{promo.totalWinners}
                          {promo.currentParticipants >= promo.totalWinners && 
                            <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded">FULL</span>
                          }
                        </span>
                        <div className="h-1.5 w-24 bg-xforge-darkgray/50 rounded-full mt-1">
                          <div 
                            className={`h-full rounded-full ${
                              promo.currentParticipants >= promo.totalWinners
                                ? 'bg-amber-500'
                                : 'bg-gradient-to-r from-xforge-teal to-cyan-500'
                            }`}
                            style={{ width: `${(promo.currentParticipants / promo.totalWinners) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{promo.multiplier}x</TableCell>
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
                          disabled={isLoading || (!promo.active && promo.currentParticipants >= promo.totalWinners)}
                          className={
                            promo.active
                              ? "border-amber-500 text-amber-400 hover:bg-amber-500/20"
                              : promo.currentParticipants >= promo.totalWinners
                                ? "border-gray-500 text-gray-400 opacity-50 cursor-not-allowed"
                                : "border-green-500 text-green-400 hover:bg-green-500/20"
                          }
                        >
                          {promo.active 
                            ? 'Deactivate' 
                            : promo.currentParticipants >= promo.totalWinners 
                              ? 'Full' 
                              : 'Activate'
                          }
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteFlashPromoHandler(promo.id)}
                          disabled={isLoading}
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
