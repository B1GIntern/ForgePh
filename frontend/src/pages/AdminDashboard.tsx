import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Award, 
  Gift, 
  Users, 
  Gamepad, 
  LogOut, 
  Plus, 
  Check, 
  Trash, 
  Calendar,
  BarChart3,
  ChevronUp,
  ChevronDown,
  Search,
  RefreshCw,
  Clock,
  Trophy,
  Zap,
  Calendar as CalendarIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useEffect } from 'react';

const mockRetailers = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Retailer ${i + 1}`,
  points: Math.floor(Math.random() * 10000),
  registrationDate: new Date(
    Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)
  ).toISOString().split('T')[0]
})).sort((a, b) => b.points - a.points);

const mockWinners = [
  { id: 1, name: "John Doe", prize: "Gaming Console", date: "2023-09-15" },
  { id: 2, name: "Jane Smith", prize: "$500 Gift Card", date: "2023-09-20" },
  { id: 3, name: "Alex Johnson", prize: "Smart Watch", date: "2023-09-25" },
  { id: 4, name: "Sarah Williams", prize: "Weekend Getaway", date: "2023-10-01" },
  { id: 5, name: "Michael Brown", prize: "Premium Headphones", date: "2023-10-05" },
];

const mockGames = [
  { id: 1, name: "Slot Machine", type: "Luck", description: "Try your luck with our slot machine and win amazing prizes!" },
  { id: 2, name: "Spin Wheel", type: "Luck", description: "Spin the wheel of fortune and see where it lands to claim your reward." },
  { id: 3, name: "Memory Game", type: "Skill", description: "Test your memory skills by matching pairs of cards in this classic game." },
  { id: 4, name: "Quiz Challenge", type: "Knowledge", description: "Answer questions correctly to earn points in this knowledge quiz." },
  { id: 5, name: "Daily Challenge", type: "Mixed", description: "A new challenge every day! Complete tasks to earn bonus points." },
];


const mockPromos = [
  { 
    id: 1, 
    name: "Summer Flash Promo", 
    startDate: "2025-06-06", 
    endDate: "2025-06-30", 
    prize: "PHP 200 GCash Voucher", 
    totalWinners: 100, 
    remainingWinners: 100, 
    active: true 
  },
  { 
    id: 2, 
    name: "Back to School Promo", 
    startDate: "2025-08-01", 
    endDate: "2025-08-15", 
    prize: "XForge Premium Pack + PHP 500 GCash", 
    totalWinners: 50, 
    remainingWinners: 50, 
    active: false 
  }
];

const dashboardStats = [
  { label: "Total Users", value: "2,845", icon: <Users className="text-purple-500" /> },
  { label: "Active Games", value: "5", icon: <Gamepad className="text-blue-500" /> },
  { label: "Rewards Claimed", value: "1,293", icon: <Gift className="text-pink-500" /> },
  { label: "Winners Today", value: "12", icon: <Award className="text-amber-500" /> },
];

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [featuredGame, setFeaturedGame] = useState<number | null>(null);
  const [newReward, setNewReward] = useState({ name: "", pointsRequired: 0, stockAvailable: 0,  type: ""});
  const [rewards, setRewards] = useState<Array<{ id: number, name: string, points: number, stock: number ,type: string}>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [prizes, setPrizes] = useState([
    { id: 1, name: "iPhone 16", description: "Latest Apple smartphone", quantity: 1 },
    { id: 2, name: "Gaming Console", description: "Next-gen gaming system", quantity: 3 },
    { id: 3, name: "Smart Watch", description: "Fitness and health tracker", quantity: 5 }
  ]);
  const [newPrize, setNewPrize] = useState({ name: "", description: "", quantity: 1 });
  const [flashPromos, setFlashPromos] = useState(mockPromos);
  const [newFlashPromo, setNewFlashPromo] = useState({
    name: "",
    startDate: "",
    endDate: "",
    prize: "",
    totalWinners: 0,
    active: false
  });

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel",
    });
    navigate("/admin");
  };

  const handleFeatureGame = (gameId: number) => {
    setFeaturedGame(gameId);
    toast({
      title: "Game Featured",
      description: `${mockGames.find(g => g.id === gameId)?.name} is now featured!`,
    });
  };
  const fetchRewards = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/auth/rewards");
      const data = await response.json();
  
      // Map API response to match your component's expected structure
      const mappedRewards = data.map(item => ({
        id: item._id,
        name: item.name,
        points: item.pointsRequired,
        stock: item.stockAvailable,
      }));
  
      setRewards(mappedRewards);
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
      toast({
        title: "Error Fetching Rewards",
        description: "Could not load rewards at this time.",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
   
  
    fetchRewards();
  }, []);
  const addReward = async () => {
    if (!newReward.name || newReward.pointsRequired <= 0 || newReward.stockAvailable < 0 || !newReward.type) {
      toast({
        title: "Invalid Reward",
        description: "Please fill all fields with valid values",
        variant: "destructive",
      });
      return;
    }

    try {
      // Send POST request to add the reward
      const response = await fetch("http://localhost:5001/api/auth/create-reward", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReward),
      });

      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add reward");
      }

      const reward = await response.json();

      // Update local state with the new reward
      setRewards((prevRewards) => [...prevRewards, reward]);
      
      // Reset input fields
      setNewReward({ name: "", pointsRequired: 0, stockAvailable: 0, type: "" });

      // Show success toast
      toast({
        title: "Reward Added",
        description: `${reward.name || reward.data?.name || "New reward"} has been added to rewards`,
      });

      await fetchRewards(); // Refetch the rewards

    } catch (error) {
      console.error("Error adding reward:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteReward = (id: number) => {
    // Send a DELETE request to the server to remove the reward
    // (Assuming you have a corresponding endpoint set up in your auth.js)
    fetch(`http://localhost:5001/api/auth/delete-reward/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // Include any necessary authentication tokens here
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete reward");
        }
        // Update local state to remove the deleted reward
        setRewards(rewards.filter((reward) => reward.id !== id));
        toast({
          title: "Reward Deleted",
          description: "The reward has been successfully removed.",
        });
      })
      .catch((error) => {
        console.error("Error deleting reward:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

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

  const filteredRetailers = searchQuery 
    ? mockRetailers.filter(retailer => 
        retailer.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockRetailers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-xforge-darkgray to-xforge-dark">
      <div className="fixed top-0 left-0 right-0 z-50 glass-dark backdrop-blur-md border-b border-xforge-teal/20 shadow-lg">
        <div className="container mx-auto flex justify-between items-center py-3 px-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-xforge-teal to-cyan-500 flex items-center justify-center shadow-glow mr-3">
              <BarChart3 size={20} className="text-xforge-dark" />
            </div>
            <h1 className="text-xl font-bold text-white">
              <span className="text-xforge-teal">Forge</span> Philippines Admin
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
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto pt-24 pb-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="bg-xforge-darkgray/60 border-xforge-teal/10 shadow-md hover:shadow-xl transition-all duration-300 hover:border-xforge-teal/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xforge-gray text-sm mb-1">{stat.label}</p>
                  <p className="text-white text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-xforge-dark/50 flex items-center justify-center">
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="retailers" className="w-full">
          <TabsList className="grid grid-cols-6 mb-8 bg-xforge-darkgray/40 p-1">
            <TabsTrigger value="retailers" className="data-[state=active]:bg-xforge-teal data-[state=active]:text-xforge-dark">
              <Users size={16} className="mr-2" />
              Top Retailers
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-xforge-teal data-[state=active]:text-xforge-dark">
              <Gift size={16} className="mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="winners" className="data-[state=active]:bg-xforge-teal data-[state=active]:text-xforge-dark">
              <Award size={16} className="mr-2" />
              Winners
            </TabsTrigger>
            <TabsTrigger value="prizes" className="data-[state=active]:bg-xforge-teal data-[state=active]:text-xforge-dark">
              <Trophy size={16} className="mr-2" />
              Prize Pool
            </TabsTrigger>
            <TabsTrigger value="flash-promos" className="data-[state=active]:bg-xforge-teal data-[state=active]:text-xforge-dark">
              <Zap size={16} className="mr-2" />
              Flash Promos
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-xforge-teal data-[state=active]:text-xforge-dark">
              <Gamepad size={16} className="mr-2" />
              Featured Games
            </TabsTrigger>
          </TabsList>

          <TabsContent value="retailers" className="glass-dark p-6 rounded-lg border border-xforge-teal/10 shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Top 50 Retailers by Points</h2>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xforge-gray" size={16} />
                <Input 
                  placeholder="Search retailers..." 
                  className="pl-10 bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-xforge-darkgray/30">
                  <TableRow>
                    <TableHead className="text-xforge-teal font-bold">Rank</TableHead>
                    <TableHead className="text-xforge-teal font-bold">Name</TableHead>
                    <TableHead className="text-xforge-teal font-bold">
                      <div className="flex items-center cursor-pointer">
                        Points
                        <ChevronDown size={16} className="ml-1" />
                      </div>
                    </TableHead>
                    <TableHead className="text-xforge-teal font-bold">Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRetailers.map((retailer, index) => (
                    <TableRow key={retailer.id} className="hover:bg-xforge-teal/5 border-b border-xforge-darkgray/50">
                      <TableCell className="font-medium">
                        {index < 3 ? (
                          <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs ${
                            index === 0 ? 'bg-amber-400' : 
                            index === 1 ? 'bg-slate-300' : 
                            'bg-amber-700'
                          } text-xforge-dark font-bold`}>
                            {index + 1}
                          </span>
                        ) : (
                          index + 1
                        )}
                      </TableCell>
                      <TableCell>{retailer.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-xforge-teal font-bold">{retailer.points.toLocaleString()}</span>
                          <div className="ml-2 h-2 bg-xforge-darkgray/50 rounded-full w-24">
                            <div 
                              className="h-full bg-gradient-to-r from-xforge-teal to-cyan-500 rounded-full" 
                              style={{ width: `${Math.min(100, (retailer.points / 10000) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{retailer.registrationDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          
          <TabsContent value="rewards" className="space-y-6 animate-fade-in">
          <Card className="glass-dark border border-xforge-teal/10 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl">Create New Reward</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="reward-name" className="text-xforge-gray">Reward Name</Label>
                    <Input 
                      id="reward-name" 
                      placeholder="Enter reward name" 
                      value={newReward.name}
                      onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                      className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reward-points" className="text-xforge-gray">Points Required</Label>
                    <Input 
                      id="reward-points" 
                      type="number" 
                      placeholder="Points required" 
                      value={newReward.pointsRequired || ''}
                      onChange={(e) => setNewReward({...newReward, pointsRequired: parseInt(e.target.value) || 0})}
                      className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reward-stock" className="text-xforge-gray">Stock Available</Label>
                    <Input 
                      id="reward-stock" 
                      type="number" 
                      placeholder="Available stock" 
                      value={newReward.stockAvailable || ''}
                      onChange={(e) => setNewReward({...newReward, stockAvailable: parseInt(e.target.value) || 0})}
                      className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                      min="0"
                    />
                  </div>
                  <div>
                  <Label htmlFor="reward-type" className="text-xforge-gray">Reward Type</Label>
                  <select
                    id="reward-type"
                    value={newReward.type}
                    onChange={(e) => setNewReward({...newReward, type: e.target.value})}
                    className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                  >
                    <option value="">Select Reward Type</option>
                    <option value="Discounts">Discounts</option>
                    <option value="Vouchers">Vouchers</option>
                    <option value="Products">Products</option>
                  </select>
                </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={addReward}
                      className="bg-gradient-to-r from-xforge-teal to-cyan-500 text-xforge-dark hover:brightness-110 w-full shadow-glow"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Reward
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-dark border border-xforge-teal/10 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl">Manage Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-xforge-darkgray/30">
                      <TableRow>
                        {/* <TableHead className="text-xforge-teal font-bold">ID</TableHead> */}
                        <TableHead className="text-xforge-teal font-bold">Name</TableHead>
                        <TableHead className="text-xforge-teal font-bold">Points</TableHead>
                        <TableHead className="text-xforge-teal font-bold">Stock</TableHead>
                        <TableHead className="text-xforge-teal font-bold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rewards.map((reward) => (
                        <TableRow key={reward.id} className="hover:bg-xforge-teal/5 border-b border-xforge-darkgray/50">
                          {/* <TableCell className="font-medium">{reward.id}</TableCell> */}
                          <TableCell>{reward.name}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full bg-xforge-teal/10 border border-xforge-teal/20 text-xforge-teal font-bold">
                              {reward.points != null ? reward.points.toLocaleString() : 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full ${
                              reward.stock != null && reward.stock > 20 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              reward.stock != null && reward.stock > 5 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {reward.stock != null ? reward.stock : 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteReward(reward.id)}
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

          <TabsContent value="winners" className="glass-dark p-6 rounded-lg border border-xforge-teal/10 shadow-lg animate-fade-in">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center">
              <Award className="text-amber-400 mr-2" size={24} />
              Prize Winners
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {mockWinners.slice(0, 2).map((winner) => (
                <Card key={winner.id} className="bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 shadow-lg overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                    <Award size={96} />
                  </div>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                      <p className="text-amber-400 font-bold text-lg">{winner.name}</p>
                      <p className="text-xforge-gray text-sm">{winner.date}</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
                      <p className="text-white">Won</p>
                      <p className="text-amber-300 font-bold">{winner.prize}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-xforge-darkgray/30">
                  <TableRow>
                    <TableHead className="text-xforge-teal font-bold">ID</TableHead>
                    <TableHead className="text-xforge-teal font-bold">Winner</TableHead>
                    <TableHead className="text-xforge-teal font-bold">Prize</TableHead>
                    <TableHead className="text-xforge-teal font-bold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWinners.map((winner) => (
                    <TableRow key={winner.id} className="hover:bg-xforge-teal/5 border-b border-xforge-darkgray/50">
                      <TableCell className="font-medium">{winner.id}</TableCell>
                      <TableCell>{winner.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                          <Award size={14} className="text-amber-400" />
                          {winner.prize}
                        </span>
                      </TableCell>
                      <TableCell>{winner.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;