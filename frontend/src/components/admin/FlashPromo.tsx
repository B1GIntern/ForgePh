import React, { useState, useEffect } from "react";
import { Zap, Calendar, CheckCircle, AlertCircle, Trash } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/config/axiosConfig";

// Define types for our data
export interface FlashPromo {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  multiplier: number;
  isActive: boolean;
  prize: string;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    userId: string;
    joinedAt: string;
  }>;
  status?: string; // Used for display purposes
  entries?: number; // Used for display purposes
}

export interface NewFlashPromo {
  name: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  multiplier: number;
  prize: string;
  isActive: boolean;
}

interface FlashPromoProps {
  isAdmin?: boolean;
  userId?: string;
  onJoinPromo?: (promoId: string) => Promise<void>;
}

const FlashPromo: React.FC<FlashPromoProps> = ({ isAdmin = false, userId, onJoinPromo }) => {
  const { toast } = useToast();
  const [flashPromos, setFlashPromos] = useState<FlashPromo[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newFlashPromo, setNewFlashPromo] = useState<NewFlashPromo>({
    name: '',
    startDate: '',
    endDate: '',
    maxParticipants: 1,
    multiplier: 1,
    prize: '',
    isActive: true
  });

  useEffect(() => {
    fetchFlashPromos();
  }, []);

  // Calculate Flash Promo metrics
  const getFlashPromoMetrics = () => {
    if (!Array.isArray(flashPromos)) return { total: 0, active: 0, inactive: 0 };
    
    const total = flashPromos.length;
    const active = flashPromos.filter(promo => promo.isActive).length;
    const inactive = total - active;
    
    return { total, active, inactive };
  };

  // Calculate progress percentage
  const calculateProgress = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  // Fetch flash promos
  const fetchFlashPromos = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching flash promos using configured axiosInstance');
      const response = await axiosInstance.get('/flash-promos');
      console.log('Flash promos API response status:', response.status);
      console.log('Flash promos API response data:', response.data);
      
      // Handle different response formats
      let promoData = [];
      
      if (response.data) {
        // If response.data is an array
        if (Array.isArray(response.data)) {
          promoData = response.data;
          console.log('Data is array with length:', promoData.length);
        }
        // If response.data has a data property that's an array
        else if (response.data.data && Array.isArray(response.data.data)) {
          promoData = response.data.data;
          console.log('Data in response.data.data with length:', promoData.length);
        }
        // If response.data has a results property that's an array
        else if (response.data.results && Array.isArray(response.data.results)) {
          promoData = response.data.results;
          console.log('Data in response.data.results with length:', promoData.length);
        } else {
          console.log('Unexpected data format:', typeof response.data);
        }
      } else {
        console.log('No data in response');
      }
      
      // Process promos for display
      const processedPromos = promoData.map((promo: FlashPromo) => {
        console.log('Processing promo:', promo);
        // Add status field for display
        let status = promo.isActive ? 'ACTIVE' : 'INACTIVE';
        
        // Check if user is participating if we have userId
        let entries = 0;
        if (userId) {
          const userEntries = promo.participants.filter(p => p.userId === userId);
          entries = userEntries.length;
        }
        
        return {
          ...promo,
          status,
          entries
        };
      });
      
      // Sort by active status, then by date
      const sortedPromos = processedPromos.sort((a, b) => {
        // First sort by active status
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        
        // Then sort by start date (newest first)
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });
      
      console.log('Final processed promos:', sortedPromos);
      setFlashPromos(sortedPromos);
    } catch (error) {
      console.error('Error fetching flash promos:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('Request made but no response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      toast({
        title: 'Error',
        description: 'Failed to load flash promos',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new flash promo
  const addFlashPromo = async () => {
    try {
      // Validate inputs
      if (!newFlashPromo.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a promo name',
          variant: 'destructive'
        });
        return;
      }

      if (!newFlashPromo.startDate || !newFlashPromo.endDate) {
        toast({
          title: 'Validation Error',
          description: 'Please select both start and end dates',
          variant: 'destructive'
        });
        return;
      }

      if (new Date(newFlashPromo.startDate) >= new Date(newFlashPromo.endDate)) {
        toast({
          title: 'Validation Error',
          description: 'End date must be after start date',
          variant: 'destructive'
        });
        return;
      }

      if (!newFlashPromo.prize.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a prize description',
          variant: 'destructive'
        });
        return;
      }

      if (newFlashPromo.maxParticipants < 1) {
        toast({
          title: 'Validation Error',
          description: 'Maximum participants must be at least 1',
          variant: 'destructive'
        });
        return;
      }

      if (newFlashPromo.multiplier < 1) {
        toast({
          title: 'Validation Error',
          description: 'Multiplier must be at least 1',
          variant: 'destructive'
        });
        return;
      }

      setIsLoading(true);
      // Create the request payload
      const payload = {
        ...newFlashPromo,
        currentParticipants: 0,
        participants: []
      };

      // Log the payload for debugging
      console.log('Creating flash promo with payload:', payload);

      const response = await axiosInstance.post('/flash-promos', payload);
      console.log('API Response:', response);
      
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Flash promo created successfully'
        });

        // Reset the form
        setNewFlashPromo({
          name: '',
          startDate: '',
          endDate: '',
          maxParticipants: 1,
          multiplier: 1,
          prize: '',
          isActive: true
        });
        
        // Close the dialog
        setShowCreateDialog(false);
        
        // Refresh the list
        fetchFlashPromos();
      }
    } catch (error) {
      console.error('Error creating flash promo:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to create flash promo';
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server. Please try again.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle flash promo status
  const toggleFlashPromoStatus = async (id: string, currentStatus: boolean) => {
    try {
      console.log(`Toggling flash promo ${id} status to: ${!currentStatus}`);
      const response = await axiosInstance.patch(`/flash-promos/${id}/status`, {
        isActive: !currentStatus
      });
      
      // Update UI immediately
      setFlashPromos(flashPromos.map(promo =>
        promo._id === id ? { ...promo, isActive: !currentStatus, status: !currentStatus ? 'ACTIVE' : 'INACTIVE' } : promo
      ));
      
      toast({
        title: 'Success',
        description: `Flash promo ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling flash promo status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update flash promo status',
        variant: 'destructive'
      });
    }
  };

  // Delete flash promo
  const deleteFlashPromo = async (id: string) => {
    try {
      setFlashPromos(flashPromos.filter(promo => promo._id !== id));
      
      const response = await axiosInstance.delete(`/flash-promos/${id}`);
      console.log('Delete response:', response.data);
      
      toast({
        title: 'Success',
        description: 'Flash promo deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting flash promo:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete flash promo',
        variant: 'destructive'
      });
      
      // Re-fetch to ensure UI is in sync
      fetchFlashPromos();
    }
  };

  // Join flash promo
  const handleJoinPromo = async (promoId: string) => {
    try {
      if (!userId) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to join flash promos',
          variant: 'destructive'
        });
        return;
      }
      
      if (onJoinPromo) {
        await onJoinPromo(promoId);
      } else {
        // Default implementation if onJoinPromo not provided
        const response = await axiosInstance.post(`/flash-promos/${promoId}/join`, { 
          userId 
        });
        console.log('Join response:', response.data);
        
        toast({
          title: 'Success',
          description: 'You have joined the flash promo!'
        });
      }
      
      // Refresh to update participation status
      fetchFlashPromos();
    } catch (error) {
      console.error('Error joining flash promo:', error);
      toast({
        title: 'Error',
        description: 'Failed to join flash promo',
        variant: 'destructive'
      });
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format relative time (e.g., "2 days left")
  const getTimeRemaining = (endDate: string) => {
    try {
      const end = new Date(endDate);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      
      if (diffTime <= 0) return 'Ended';
      
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
      } else {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} left`;
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  const flashPromoMetrics = getFlashPromoMetrics();

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Card className="bg-[#1a1a1a] border border-[#333] shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-xl">Create Flash Promo</CardTitle>
            <CardDescription className="text-gray-400">
              Set up a new flash promotion with limited participants and multiplier
            </CardDescription>
          </CardHeader>

          {/* Summary Cards - Admin only */}
          <CardContent className="pb-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Total Flash Promos Card */}
              <Card className="bg-[#222] border border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#00D6A4] text-lg">Total Flash Promos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">{flashPromoMetrics.total}</div>
                    <div className="p-2 rounded-full bg-[#00D6A4]/10">
                      <Zap size={20} className="text-[#00D6A4]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Flash Promos Card */}
              <Card className="bg-[#222] border border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-400 text-lg">Active Promos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">{flashPromoMetrics.active}</div>
                    <div className="p-2 rounded-full bg-green-500/10">
                      <CheckCircle size={20} className="text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inactive Flash Promos Card */}
              <Card className="bg-[#222] border border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-400 text-lg">Inactive Promos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">{flashPromoMetrics.inactive}</div>
                    <div className="p-2 rounded-full bg-amber-500/10">
                      <AlertCircle size={20} className="text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-[#00D6A4] to-cyan-500 text-[#121212] hover:brightness-110"
              >
                <Zap size={16} className="mr-2" />
                Create New Flash Promo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flash Promos List */}
      <Card className="bg-[#1a1a1a] border border-[#333] shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white text-xl">Flash Promos</CardTitle>
            <div className="bg-[#222] px-3 py-1 rounded-full flex items-center text-gray-400 text-sm">
              <Calendar size={14} className="mr-2 text-[#00D6A4]" />
              {flashPromoMetrics.active} Active Promos
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">
              Loading flash promos...
            </div>
          ) : flashPromos.length > 0 ? (
            <Table>
              <TableHeader className="bg-[#222]">
                <TableRow>
                  <TableHead className="text-[#00D6A4] font-bold">Name</TableHead>
                  <TableHead className="text-[#00D6A4] font-bold">Period</TableHead>
                  <TableHead className="text-[#00D6A4] font-bold">Prize</TableHead>
                  <TableHead className="text-[#00D6A4] font-bold">Status</TableHead>
                  <TableHead className="text-[#00D6A4] font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flashPromos
                  .filter(promo => isAdmin || promo.isActive) // Only show active promos for non-admin users
                  .map((promo) => (
                  <TableRow key={promo._id} className="hover:bg-[#222] border-b border-[#333]">
                    <TableCell>{promo.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">
                          {formatDate(promo.startDate)}
                        </span>
                        <span className="text-xs text-green-400">
                          {getTimeRemaining(promo.endDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{promo.prize}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        promo.isActive
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-[#222] text-gray-400 border border-[#333]'
                      }`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isAdmin ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleFlashPromoStatus(promo._id, promo.isActive)}
                              className={
                                promo.isActive
                                  ? "border-amber-500 text-amber-400 hover:bg-amber-500/20"
                                  : "border-green-500 text-green-400 hover:bg-green-500/20"
                              }
                            >
                              {promo.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteFlashPromo(promo._id)}
                              className="hover:bg-red-700 transition-colors"
                            >
                              <Trash size={14} />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!promo.isActive || promo.currentParticipants >= promo.maxParticipants || (promo.entries && promo.entries > 0)}
                            onClick={() => handleJoinPromo(promo._id)}
                            className={
                              promo.entries && promo.entries > 0
                                ? "border-green-500 text-green-400 hover:bg-green-500/20"
                                : "border-[#00D6A4] text-[#00D6A4] hover:bg-[#00D6A4]/20"
                            }
                          >
                            {promo.entries && promo.entries > 0 
                              ? `You Have Already Joined ${promo.name}`
                              : 'Join Promo'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No flash promos available.
              {isAdmin && ' Create your first flash promo using the button above.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Flash Promo Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#1a1a1a] border border-[#333] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Create Flash Promo</DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in the details to create a new flash promotion.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="promo-name" className="text-gray-400">Promo Name</Label>
              <Input 
                id="promo-name" 
                placeholder="Enter promo name" 
                value={newFlashPromo.name}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, name: e.target.value})}
                className="bg-[#222] border-[#333] focus:border-[#00D6A4]"
              />
            </div>
            <div>
              <Label htmlFor="start-date" className="text-gray-400">Start Date</Label>
              <Input 
                id="start-date" 
                type="datetime-local" 
                value={newFlashPromo.startDate}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, startDate: e.target.value})}
                className="bg-[#222] border-[#333] focus:border-[#00D6A4]"
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-gray-400">End Date</Label>
              <Input 
                id="end-date" 
                type="datetime-local" 
                value={newFlashPromo.endDate}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, endDate: e.target.value})}
                className="bg-[#222] border-[#333] focus:border-[#00D6A4]"
              />
            </div>
            <div>
              <Label htmlFor="promo-participants" className="text-gray-400">Max Participants</Label>
              <Input 
                id="promo-participants" 
                type="number" 
                placeholder="Number of participants" 
                value={newFlashPromo.maxParticipants || ''}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, maxParticipants: parseInt(e.target.value) || 1})}
                className="bg-[#222] border-[#333] focus:border-[#00D6A4]"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="promo-multiplier" className="text-gray-400">Entry Multiplier</Label>
              <Input 
                id="promo-multiplier" 
                type="number" 
                placeholder="Entry multiplier" 
                value={newFlashPromo.multiplier || ''}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, multiplier: parseInt(e.target.value) || 1})}
                className="bg-[#222] border-[#333] focus:border-[#00D6A4]"
                min="1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="promo-prize" className="text-gray-400">Prize</Label>
              <Input 
                id="promo-prize" 
                placeholder="Prize description" 
                value={newFlashPromo.prize}
                onChange={(e) => setNewFlashPromo({...newFlashPromo, prize: e.target.value})}
                className="bg-[#222] border-[#333] focus:border-[#00D6A4]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-[#333] text-gray-400 hover:text-white hover:bg-[#333]"
            >
              Cancel
            </Button>
            <Button 
              onClick={addFlashPromo}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#00D6A4] to-cyan-500 text-[#121212] hover:brightness-110"
            >
              {isLoading ? 'Creating...' : 'Create Flash Promo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashPromo; 