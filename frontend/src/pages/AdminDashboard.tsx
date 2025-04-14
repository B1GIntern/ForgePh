import React, { useState, useEffect } from "react";
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
  Upload,
  FileText,
  Download,
  Zap,
  Tag,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
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
  CardDescription,
} from "@/components/ui/card";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from "xlsx";

// Define types for our data
interface Prize {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  prizedAssignedToGame: boolean;
  gameId?: string;
  createdAt: string;
  updatedAt: string;
  prizeClaimedBy?: Array<{
    userId: string;
    claimedAt: string;
  }>;
}

interface Game {
  _id: string;
  name: string;
  gameType: "SpinTheWheel" | "SlotMachine" | "CardMatchingGame";
  points: number;
  featured: boolean;
  config?: {
    spinConfig?: {
      includeFreeSpin: boolean;
      includeTryAgain: boolean;
    };
  };
  prizedAssigned?: Array<{
    prizeId: string;
    multiplier?: number;
  }>;
}
// Define types for our data
interface PromoCode {
  _id: string;
  code: string;
  points: number;
  redeemedBy?: {
    consumerId: string;
    redeemedAt: string;
    shopName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Redemption {
  id: string;
  code: string;
  status: 'Success' | 'Failed';
  user: string;
  timestamp: string;
}

interface FlashPromo {
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
}

interface NewFlashPromo {
  name: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  multiplier: number;
  prize: string;
  isActive: boolean;
}

interface GameConfig {
  points: number;
  prizes: Array<{
    prizeId: string;
    multiplier?: number;
  }>;
  spinConfig: {
    includeFreeSpin: boolean;
    includeTryAgain: boolean;
  };
}

// Mock data for redemptions (since it's not part of your backend yet)
const mockRedemptions: Redemption[] = [
  { id: '1', code: 'PROMO1', status: 'Success', user: 'john@example.com', timestamp: '2 mins ago' },
  { id: '2', code: 'PROMO2', status: 'Success', user: 'alice@example.com', timestamp: '5 mins ago' },
  { id: '3', code: 'PROMO3', status: 'Failed', user: 'bob@example.com', timestamp: '10 mins ago' },
  // Add more mock data as needed
];

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
  const [newReward, setNewReward] = useState({ name: "", pointsRequired: 0, stockAvailable: 0, type: "" });
  const [rewards, setRewards] = useState<Array<{ id: number, name: string, points: number, stock: number, type: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newPrize, setNewPrize] = useState({
    name: "",
    description: "",
    quantity: 1,
    prizedAssignedToGame: false,
    gameId: ""
  });
  const [newFlashPromo, setNewFlashPromo] = useState<NewFlashPromo>({
    name: '',
    startDate: '',
    endDate: '',
    maxParticipants: 1,
    multiplier: 1,
    prize: '',
    isActive: true
  });
  
  // Declare state for retailers
  const [retailers, setRetailers] = useState<any[]>([]); // <== Add this line to declare retailers state
  const [isLoading, setIsLoading] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [selectedTab, setSelectedTab] = useState("rewards");
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [flashPromos, setFlashPromos] = useState<FlashPromo[]>([]);
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
    const fetchRetailers = async () => {
      try {
        const response = await axios.get("/api/users/top-retailers");
        console.log(response.data); // Log response to check data format
        setRetailers(response.data);
      } catch (error) {
        console.error("Error fetching retailers:", error);
      }
    };
    fetchRetailers();
  }, []);

  const filteredRetailers = retailers.filter((retailer) =>
    retailer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //Top 50 Retailers
  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel",
    });
    navigate("/admin");
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

  //FETCHING OF REWARDS
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



  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [redemptions, setRedemptions] = useState(mockRedemptions);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileDate, setCurrentFileDate] = useState<Date | null>(null);
  const [fileCheckRetries, setFileCheckRetries] = useState(0);
  const [availablePromoCodes, setAvailablePromoCodes] = useState<PromoCode[]>([]);
  const [redeemedPromoCodes, setRedeemedPromoCodes] = useState<PromoCode[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fetch promo codes on component mount
  useEffect(() => {
    fetchPromoCodes();
  }, []);

  // Fetch promo codes with defensive programming
  // Fetch promo codes with defensive programming
  const fetchPromoCodes = async () => {
    try {
      const response = await axios.get('/api/promocodes');

      // Debug: Log the actual response structure
      console.log('API Response:', response.data);

      // Handle potential response formats
      if (response.data) {
        let allCodes: PromoCode[] = [];

        // If the response is an array directly
        if (Array.isArray(response.data)) {
          allCodes = response.data;
        }
        // If data is in a nested property
        else if (response.data.data && Array.isArray(response.data.data)) {
          allCodes = response.data.data;
        } else {
          console.warn('Unexpected API response format:', response.data);
          allCodes = [];
        }

        // Set all promo codes
        setPromoCodes(allCodes);

        // Separate available and redeemed codes
        const available = allCodes.filter(
          promo => !promo.redeemedBy || !promo.redeemedBy.consumerId
        );
        const redeemed = allCodes.filter(
          promo => promo.redeemedBy && promo.redeemedBy.consumerId
        );

        setAvailablePromoCodes(available);
        setRedeemedPromoCodes(redeemed);

        // Update file info if we have promo codes
        if (allCodes.length > 0) {
          updateLatestFileInfo(allCodes);
        }
      } else {
        setPromoCodes([]);
        setAvailablePromoCodes([]);
        setRedeemedPromoCodes([]);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load promo codes',
        variant: 'destructive',
      });
      setPromoCodes([]);
      setAvailablePromoCodes([]);
      setRedeemedPromoCodes([]);
    }
  };

  // Pagination handlers
  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, Math.ceil(availablePromoCodes.length / itemsPerPage)));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Get current page items
  const getCurrentPageItems = (items: any[], page: number, perPage: number) => {
    const startIndex = (page - 1) * perPage;
    return items.slice(startIndex, startIndex + perPage);
  };

  // Helper to update file info from promo codes
  const updateLatestFileInfo = (codes: PromoCode[]) => {
    if (!Array.isArray(codes) || codes.length === 0) return;

    try {
      // Sort by creation date to get the most recent
      const sortedCodes = [...codes].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      if (sortedCodes[0] && sortedCodes[0].createdAt) {
        setCurrentFileName("Latest Upload");
        setCurrentFileDate(new Date(sortedCodes[0].createdAt));
      }
    } catch (error) {
      console.error('Error updating file info:', error);
    }
  };

  // Format date nicely with error handling
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toString();
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadSuccess(false); // Reset success message when new file is selected
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select an Excel file to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('/api/promocodes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);

      // Show success message
      setUploadSuccess(true);
      setCurrentFileName(selectedFile.name);
      setCurrentFileDate(new Date());

      // Determine added count from response
      let addedCount = 0;
      if (response.data && response.data.results && typeof response.data.results.added === 'number') {
        addedCount = response.data.results.added;
      } else if (response.data && typeof response.data.addedCount === 'number') {
        addedCount = response.data.addedCount;
      }

      toast({
        title: 'Upload Successful',
        description: `${addedCount} new promo codes have been uploaded`,
      });

      // Refresh promo codes
      fetchPromoCodes();

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('Error uploading promo codes:', error);
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload promo codes',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);

      // Reset the file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setSelectedFile(null);
    }
  };

  // Handle file reset
  const handleFileReset = () => {
    setSelectedFile(null);

    // Reset the file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Calculate summary metrics
  const getPromoCodeMetrics = () => {
    if (!Array.isArray(promoCodes)) return { total: 0, active: 0, redeemed: 0 };

    const total = promoCodes.length;
    const redeemed = promoCodes.filter(promo =>
      promo.redeemedBy && promo.redeemedBy.consumerId
    ).length;
    const active = total - redeemed;

    return { total, active, redeemed };
  };

  // Get redemption metrics
  const getRedemptionMetrics = () => {
    if (!Array.isArray(redemptions)) return { total: 0, success: 0, failed: 0 };

    const total = redemptions.length;
    const success = redemptions.filter(r => r.status === 'Success').length;
    const failed = total - success;

    return { total, success, failed };
  };

    // Calculate Flash Promo metrics
    const getFlashPromoMetrics = () => {
      if (!Array.isArray(flashPromos)) return { total: 0, active: 0, inactive: 0 };
      
      const total = flashPromos.length;
      const active = flashPromos.filter(promo => promo.isActive).length;
      const inactive = total - active;
      
      return { total, active, inactive };
    };

    // Stats for display
    const promoMetrics = getPromoCodeMetrics();
    const redemptionMetrics = getRedemptionMetrics();
    const flashPromoMetrics = getFlashPromoMetrics();


  // Fetch all prizes
  const fetchPrizes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/prizes');
      if (response.data.success) {
        setPrizes(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load prizes",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching prizes:", error);
      toast({
        title: "Error",
        description: "Failed to load prizes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };



  // Add new prize
  const addPrize = async () => {
    if (!newPrize.name || !newPrize.description || newPrize.quantity < 1) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    if (newPrize.prizedAssignedToGame && !newPrize.gameId) {
      toast({
        title: "Validation Error",
        description: "Please select a game for this prize",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await axios.post('/api/prizes', newPrize);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Prize added successfully"
        });

        // Reset form and refresh prizes
        setNewPrize({
          name: "",
          description: "",
          quantity: 1,
          prizedAssignedToGame: false,
          gameId: ""
        });
        fetchPrizes();
      }
    } catch (error) {
      console.error("Error adding prize:", error);
      toast({
        title: "Error",
        description: "Failed to add prize",
        variant: "destructive"
      });
    }
  };

  // Delete prize
  const deletePrize = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this prize?")) {
      try {
        const response = await axios.delete(`/api/prizes/${id}`);

        if (response.data.success) {
          toast({
            title: "Success",
            description: "Prize deleted successfully"
          });
          fetchPrizes();
        }
      } catch (error) {
        console.error("Error deleting prize:", error);
        toast({
          title: "Error",
          description: "Failed to delete prize",
          variant: "destructive"
        });
      }
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPrizes();
    fetchGames();
  }, []);

    // Fetch flash promos
    const fetchFlashPromos = async () => {
      try {
        const response = await axios.get('/api/flash-promos');
        console.log('Raw API response:', response);
        
        // Handle different response formats
        let promoData = [];
        
        if (response.data) {
          // If response.data is an array
          if (Array.isArray(response.data)) {
            promoData = response.data;
          }
          // If response.data has a data property that's an array
          else if (response.data.data && Array.isArray(response.data.data)) {
            promoData = response.data.data;
          }
          // If response.data has a results property that's an array
          else if (response.data.results && Array.isArray(response.data.results)) {
            promoData = response.data.results;
          }
        }
        
        // Ensure we're setting an array
        setFlashPromos(promoData);
        
        // Log the processed data
        console.log('Processed flash promos:', promoData);
      } catch (error) {
        console.error('Error fetching flash promos:', error);
        // Set empty array on error
        setFlashPromos([]);
        toast({
          title: 'Error',
          description: 'Failed to load flash promos',
          variant: 'destructive'
        });
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

      // Create the request payload
      const payload = {
        ...newFlashPromo,
        currentParticipants: 0,
        participants: []
      };

      // Log the payload for debugging
      console.log('Creating flash promo with payload:', payload);

      const response = await axios.post('/api/flash-promos', payload);
      console.log('API Response:', response);

      if (response.data) {
        // Add the new promo to the state
        setFlashPromos(prevPromos => [...prevPromos, response.data]);

        // Reset the form
        setNewFlashPromo({
          name: '',
          startDate: '',
          endDate: '',
          maxParticipants: 0,
          multiplier: 1,
          prize: '',
          isActive: true
        });

        toast({
          title: 'Success',
          description: 'Flash promo created successfully'
        });

        // Refresh the list
        fetchFlashPromos();
      }
    } catch (error) {
      console.error('Error creating flash promo:', error);

      // More detailed error handling
      let errorMessage = 'Failed to create flash promo';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || error.response.data || errorMessage;
        console.log('Error response:', error.response);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please try again.';
        console.log('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

    // Toggle flash promo status
    const toggleFlashPromoStatus = async (id: string, currentStatus: boolean) => {
      try {
        const response = await axios.patch(`/api/flash-promos/${id}/status`, {
          isActive: !currentStatus
        });
        
        console.log('Updated flash promo status:', response.data);
        
        setFlashPromos(flashPromos.map(promo => 
          promo._id === id ? response.data : promo
        ));
        
        toast({
          title: 'Success',
          description: `Flash promo ${!currentStatus ? 'activated' : 'deactivated'}`
        });
      } catch (error) {
        console.error('Error updating flash promo status:', error);
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
        await axios.delete(`/api/flash-promos/${id}`);
        setFlashPromos(flashPromos.filter(promo => promo._id !== id));
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
      }
    };

    // Calculate progress percentage
    const calculateProgress = (current: number, max: number) => {
      return Math.min((current / max) * 100, 100);
    };

    // Load flash promos on component mount
    useEffect(() => {
      fetchFlashPromos();
    }, []);

  // Game Management State
  const [games, setGames] = useState<Game[]>([]);
  const [showPrizeDialog, setShowPrizeDialog] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameConfig, setGameConfig] = useState({
    points: 3,
    prizes: [] as Array<{
      prizeId: string;
      multiplier?: number;
    }>,
    spinConfig: {
      includeFreeSpin: false,
      includeTryAgain: false
    }
  });

  // Fetch games from the backend
  const fetchGames = async () => {
    try {
      const response = await axios.get('/api/games');
      if (Array.isArray(response.data)) {
        setGames(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        toast({
          title: 'Error',
          description: 'Received unexpected data format from server',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: 'Error',
        description: 'Failed to load games',
        variant: 'destructive'
      });
    }
  };

  // Toggle game featuring
  const handleFeatureGame = async (gameId: string) => {
    setSelectedGame(gameId);
    setShowPrizeDialog(true);
  };

  // Update game configuration and feature status
  const updateGameConfig = async () => {
    if (!selectedGame) return;

    try {
      // Map the prizes to include both prizeId and prizeName
      const mappedPrizes = gameConfig.prizes.map(prize => {
        const selectedPrize = prizes.find(p => p._id === prize.prizeId);
        return {
          prizeId: prize.prizeId,
          prizeName: selectedPrize?.name || '', // Include the prize name
          multiplier: prize.multiplier
        };
      });

      const payload = {
        featured: true,
        points: gameConfig.points,
        prizedAssigned: mappedPrizes,
        config: {
          spinConfig: gameConfig.spinConfig
        }
      };

      await axios.patch(`/api/games/${selectedGame}/feature`, payload);

      // Refresh games list to get updated data
      await fetchGames();

      toast({
        title: 'Success',
        description: 'Game configuration updated successfully'
      });

      setShowPrizeDialog(false);
      setSelectedGame(null);
      setGameConfig({
        points: 3,
        prizes: [],
        spinConfig: {
          includeFreeSpin: false,
          includeTryAgain: false
        }
      });
    } catch (error: any) {
      console.error('Error updating game:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update game configuration',
        variant: 'destructive'
      });
    }
  };

  // Remove game from featured
  const unfeatureGame = async (gameId: string) => {
    try {
      await axios.patch(`/api/games/${gameId}/unfeature`);

      // Update local state
      setGames(prevGames => prevGames.map(game =>
        game._id === gameId ? { ...game, featured: false, prizedAssigned: [] } : game
      ));

      toast({
        title: 'Success',
        description: 'Game removed from featured'
      });
    } catch (error) {
      console.error('Error unfeaturing game:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfeature game',
        variant: 'destructive'
      });
    }
  };

  // Load games on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  // Game configuration dialog JSX
  const GameConfigDialog = () => (
    <Dialog open={showPrizeDialog} onOpenChange={setShowPrizeDialog}>
      <DialogContent className="bg-[#1a1a1a] border border-[#333] text-white">
        <DialogHeader>
          <DialogTitle>Configure Game</DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up points and prizes for this game
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Points Configuration */}
          <div>
            <Label htmlFor="points">Points Required to Play</Label>
            <Input
              id="points"
              type="number"
              min="0"
              value={gameConfig.points}
              onChange={(e) => setGameConfig({
                ...gameConfig,
                points: parseInt(e.target.value)
              })}
              className="bg-[#222] border-[#333] text-white"
            />
          </div>

          {/* Prize Configuration */}
          <div>
            <Label>Select Prizes</Label>
            {prizes.map((prize) => (
              <div key={prize._id} className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id={`prize-${prize._id}`}
                  checked={gameConfig.prizes.some(p => p.prizeId === prize._id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setGameConfig({
                        ...gameConfig,
                        prizes: [...gameConfig.prizes, { prizeId: prize._id }]
                      });
                    } else {
                      setGameConfig({
                        ...gameConfig,
                        prizes: gameConfig.prizes.filter(p => p.prizeId !== prize._id)
                      });
                    }
                  }}
                />
                <label htmlFor={`prize-${prize._id}`} className="text-sm text-gray-300">
                  {prize.name}
                </label>
              </div>
            ))}
          </div>

          {/* Spin The Wheel Specific Configuration */}
          {games.find(g => g._id === selectedGame)?.gameType === 'SpinTheWheel' && (
            <div className="space-y-2">
              <Label>Wheel Configuration</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free-spin"
                  checked={gameConfig.spinConfig.includeFreeSpin}
                  onCheckedChange={(checked) => setGameConfig({
                    ...gameConfig,
                    spinConfig: {
                      ...gameConfig.spinConfig,
                      includeFreeSpin: checked === true
                    }
                  })}
                />
                <label htmlFor="free-spin" className="text-sm text-gray-300">
                  Include Free Spin Slice
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="try-again"
                  checked={gameConfig.spinConfig.includeTryAgain}
                  onCheckedChange={(checked) => setGameConfig({
                    ...gameConfig,
                    spinConfig: {
                      ...gameConfig.spinConfig,
                      includeTryAgain: checked === true
                    }
                  })}
                />
                <label htmlFor="try-again" className="text-sm text-gray-300">
                  Include Try Again Slice
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setShowPrizeDialog(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={updateGameConfig}
            className="bg-xforge-teal hover:bg-xforge-teal/90"
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

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
          <TabsList className="grid grid-cols-7 mb-8 bg-[#1a1a1a] p-1">
            <TabsTrigger value="retailers" className="data-[state=active]:bg-[#00D6A4] data-[state=active]:text-[#121212]">
              <Users size={16} className="mr-2" />
              Top Retailers
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-[#00D6A4] data-[state=active]:text-[#121212]">
              <Gift size={16} className="mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="winners" className="data-[state=active]:bg-[#00D6A4] data-[state=active]:text-[#121212]">
              <Award size={16} className="mr-2" />
              Winners
            </TabsTrigger>
            <TabsTrigger value="prizes" className="data-[state=active]:bg-[#00D6A4] data-[state=active]:text-[#121212]">
              <Trophy size={16} className="mr-2" />
              Prize Pool
            </TabsTrigger>
            <TabsTrigger value="flash-promos" className="data-[state=active]:bg-[#00D6A4] data-[state=active]:text-[#121212]">
              <Zap size={16} className="mr-2" />
              Flash Promos
            </TabsTrigger>
            <TabsTrigger value="promo-codes" className="data-[state=active]:bg-[#00D6A4] data-[state=active]:text-[#121212]">
              <Tag size={16} className="mr-2" />
              Promo Codes
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-[#00D6A4] data-[state=active]:text-[#121212]">
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
                    <TableRow key={retailer.userId} className="hover:bg-xforge-teal/5 border-b border-xforge-darkgray/50">
                      <TableCell className="font-medium">
                        {index < 3 ? (
                          <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs ${index === 0 ? 'bg-amber-400' :
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
                      onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
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
                      onChange={(e) => setNewReward({ ...newReward, pointsRequired: parseInt(e.target.value) || 0 })}
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
                      onChange={(e) => setNewReward({ ...newReward, stockAvailable: parseInt(e.target.value) || 0 })}
                      className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reward-type" className="text-xforge-gray">Reward Type</Label>
                    <select
                      id="reward-type"
                      value={newReward.type}
                      onChange={(e) => setNewReward({ ...newReward, type: e.target.value })}
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
                            <span className={`px-2 py-1 rounded-full ${reward.stock != null && reward.stock > 20 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
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
                      onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
                      className="input-field bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prize-description" className="text-xforge-gray">Description</Label>
                    <Input
                      id="prize-description"
                      placeholder="Brief description"
                      value={newPrize.description}
                      onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
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
                      onChange={(e) => setNewPrize({ ...newPrize, quantity: parseInt(e.target.value) || 1 })}
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

                {/* Optional: Game Assignment (uncomment if needed) */}
                {/* <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="assign-to-game" 
                checked={newPrize.prizedAssignedToGame}
                onCheckedChange={(checked) => 
                  setNewPrize({...newPrize, prizedAssignedToGame: checked === true, gameId: checked === true ? newPrize.gameId : ""})
                }
                className="border-xforge-teal data-[state=checked]:bg-xforge-teal"
              />
              <label 
                htmlFor="assign-to-game" 
                className="text-sm text-xforge-gray cursor-pointer"
              >
                Assign prize to specific game
              </label>
            </div>
            
            {newPrize.prizedAssignedToGame && (
              <div>
                <Label htmlFor="game-select" className="text-xforge-gray">Select Game</Label>
                <Select 
                  value={newPrize.gameId} 
                  onValueChange={(value) => setNewPrize({...newPrize, gameId: value})}
                >
                  <SelectTrigger 
                    id="game-select" 
                    className="bg-xforge-darkgray/30 border-xforge-gray/20 focus:border-xforge-teal"
                  >
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent className="bg-xforge-darkgray border-xforge-gray/20">
                    {games.map((game) => (
                      <SelectItem key={game._id} value={game._id}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div> */}
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
                        <TableRow key={prize._id} className="hover:bg-xforge-teal/5 border-b border-xforge-darkgray/50">
                          <TableCell className="font-medium">{prize._id.substring(0, 8)}...</TableCell>
                          <TableCell>
                            <span className="flex items-center">
                              <Trophy size={16} className="text-amber-400 mr-2" />
                              {prize.name}
                            </span>
                          </TableCell>
                          <TableCell>{prize.description}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full ${prize.quantity > 3 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
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
                              onClick={() => deletePrize(prize._id)}
                              className="hover:bg-red-700 transition-colors"
                            >
                              <Trash size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {prizes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-xforge-gray">
                            No prizes available. Add your first prize above.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

              <TabsContent value="flash-promos" className="space-y-6 animate-fade-in">
                <Card className="bg-[#1a1a1a] border border-[#333] shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-xl">Create Flash Promo</CardTitle>
                    <CardDescription className="text-gray-400">
                      Set up a new flash promotion with limited participants and multiplier
                    </CardDescription>
                  </CardHeader>

                  {/* Add Summary Cards */}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
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
                          onChange={(e) => setNewFlashPromo({...newFlashPromo, maxParticipants: parseInt(e.target.value) || 0})}
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
                      <div>
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
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={addFlashPromo}
                        className="bg-gradient-to-r from-[#00D6A4] to-cyan-500 text-[#121212] hover:brightness-110"
                      >
                        <Plus size={16} className="mr-2" />
                        Create Flash Promo
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Flash Promos */}
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
                    <Table>
                      <TableHeader className="bg-[#222]">
                        <TableRow>
                          <TableHead className="text-[#00D6A4] font-bold">Name</TableHead>
                          <TableHead className="text-[#00D6A4] font-bold">Period</TableHead>
                          <TableHead className="text-[#00D6A4] font-bold">Prize</TableHead>
                          <TableHead className="text-[#00D6A4] font-bold">Participants</TableHead>
                          <TableHead className="text-[#00D6A4] font-bold">Multiplier</TableHead>
                          <TableHead className="text-[#00D6A4] font-bold">Status</TableHead>
                          <TableHead className="text-[#00D6A4] font-bold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(flashPromos) && flashPromos.length > 0 ? (
                          flashPromos.map((promo) => (
                            <TableRow key={promo._id} className="hover:bg-[#222] border-b border-[#333]">
                              <TableCell>{promo.name}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-400">
                                    {new Date(promo.startDate).toLocaleDateString()}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    to {new Date(promo.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{promo.prize}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-[#00D6A4]">{promo.currentParticipants}/{promo.maxParticipants}</span>
                                  <div className="h-1.5 w-24 bg-[#222] rounded-full mt-1">
                                    <div 
                                      className="h-full bg-gradient-to-r from-[#00D6A4] to-cyan-500 rounded-full" 
                                      style={{ width: `${calculateProgress(promo.currentParticipants, promo.maxParticipants)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{promo.multiplier}x</TableCell>
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
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6 text-gray-400">
                              No flash promos available. Create your first flash promo above.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

          <TabsContent value="promo-codes" className="space-y-6">
            <Card className="bg-[#1a1a1a] border border-[#333] shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl">Upload Promo Codes</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Current File Display - Always visible if a file exists */}
                {currentFileName && (
                  <div className="mb-4 p-3 rounded-lg bg-[#222] border border-[#333]">
                    <div className="flex items-center">
                      <FileText size={16} className="text-[#00D6A4] mr-2" />
                      <div>
                        <div className="text-white text-sm font-medium">
                          Current File: <span className="text-[#00D6A4]">{currentFileName}</span>
                        </div>
                        {currentFileDate && (
                          <div className="text-gray-400 text-xs">
                            Uploaded on {formatDate(currentFileDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Success Message - Only visible after upload */}
                {uploadSuccess && (
                  <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center">
                      <FileText size={16} className="text-green-400 mr-2" />
                      <span className="text-green-400 font-medium">
                        File uploaded successfully!
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="file-upload" className="text-gray-400">Excel File</Label>
                    <div className="mt-1 flex">
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="bg-[#222] border-[#333] focus:border-[#00D6A4]"
                      />
                    </div>

                    {selectedFile && (
                      <div className="mt-2 p-2 rounded-lg bg-[#222] border border-[#333] flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText size={16} className="text-[#00D6A4] mr-2" />
                          <span className="text-gray-200 text-sm truncate">{selectedFile.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleFileReset}
                          className="text-gray-400 hover:text-white hover:bg-[#333]"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      Upload an Excel file with promo codes. The file should have a column with the promo codes.
                    </p>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleFileUpload}
                      disabled={!selectedFile || isUploading}
                      className="bg-gradient-to-r from-[#00D6A4] to-cyan-500 text-[#121212] hover:brightness-110 w-full"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw size={16} className="mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="mr-2" />
                          Upload Promo Codes
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Refresh button */}
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPromoCodes()}
                    className="text-gray-400 border-[#333] hover:text-white hover:bg-[#333]"
                  >
                    <RefreshCw size={14} className="mr-2" />
                    Refresh Promo Codes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Promo Codes Card */}
              <Card className="bg-[#1a1a1a] border border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#00D6A4] text-lg">Total Promo Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">{promoMetrics.total}</div>
                    <div className="p-2 rounded-full bg-[#00D6A4]/10">
                      <FileText size={20} className="text-[#00D6A4]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Promo Codes Card */}
              <Card className="bg-[#1a1a1a] border border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-400 text-lg">Active Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">{promoMetrics.active}</div>
                    <div className="p-2 rounded-full bg-green-500/10">
                      <CheckCircle size={20} className="text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Redeemed Promo Codes Card */}
              <Card className="bg-[#1a1a1a] border border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-400 text-lg">Redeemed Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">{promoMetrics.redeemed}</div>
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <Download size={20} className="text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Redemption Success Rate */}
              <Card className="bg-[#1a1a1a] border border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-purple-400 text-lg">Redemption Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">
                      {redemptionMetrics.total > 0
                        ? Math.round((redemptionMetrics.success / redemptionMetrics.total) * 100)
                        : 0}%
                    </div>
                    <div className="p-2 rounded-full bg-purple-500/10">
                      <AlertCircle size={20} className="text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recent Promo Codes - Available Only */}
              <Card className="md:col-span-2 bg-[#1a1a1a] border border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-xl">Recent Promo Codes</CardTitle>
                  <CardDescription className="text-gray-400">
                    Showing available promo codes ({availablePromoCodes.length})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Array.isArray(availablePromoCodes) && availablePromoCodes.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {getCurrentPageItems(availablePromoCodes, currentPage, itemsPerPage).map((promo) => (
                          <div
                            key={promo._id}
                            className="p-3 rounded-lg border border-[#333] bg-[#222] hover:bg-[#2a2a2a] transition-colors"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-mono text-sm text-white font-medium">{promo.code}</span>
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                Active
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[#00D6A4]">{promo.points} Points</span>
                              <span className="text-gray-500">
                                {promo.createdAt ? new Date(promo.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {availablePromoCodes.length > itemsPerPage && (
                        <div className="flex justify-between items-center mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="text-gray-400 hover:text-white hover:bg-[#333]"
                          >
                            <ChevronLeft size={16} className="mr-1" /> Prev
                          </Button>
                          <span className="text-sm text-gray-400">
                            Page {currentPage} of {Math.ceil(availablePromoCodes.length / itemsPerPage)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={nextPage}
                            disabled={currentPage >= Math.ceil(availablePromoCodes.length / itemsPerPage)}
                            className="text-gray-400 hover:text-white hover:bg-[#333]"
                          >
                            Next <ChevronRight size={16} className="ml-1" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No available promo codes found. Upload an Excel file to add promo codes.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Latest Redemptions - Using actual redeemed promo codes */}
              <Card className="bg-[#1a1a1a] border border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-xl">Latest Redemptions</CardTitle>
                  <CardDescription className="text-gray-400">
                    Recently redeemed codes ({redeemedPromoCodes.length})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Array.isArray(redeemedPromoCodes) && redeemedPromoCodes.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {redeemedPromoCodes.slice(0, 5).map((promo) => (
                          <div
                            key={promo._id}
                            className="p-3 rounded-lg border border-[#333] bg-[#222] hover:bg-[#2a2a2a] transition-colors"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-mono text-sm text-white font-medium">{promo.code}</span>
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Redeemed
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">{promo.redeemedBy?.shopName || 'Unknown Shop'}</span>
                              <span className="text-gray-500">
                                {promo.redeemedBy?.redeemedAt ? new Date(promo.redeemedBy.redeemedAt).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* View More Button */}
                      {redeemedPromoCodes.length > 5 && (
                        <div className="mt-4 flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-400 border-[#333] hover:text-white hover:bg-[#333]"
                            onClick={() => {
                              // You can implement a modal or separate page view for all redemptions
                              toast({
                                title: "Feature Coming Soon",
                                description: "View all redemptions feature will be available soon.",
                              });
                            }}
                          >
                            <Eye size={14} className="mr-2" />
                            View All Redemptions
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No redemptions yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </TabsContent>
          {/* GAME HERE */}
          <TabsContent value="games" className="space-y-6">
            <Card className="bg-[#1a1a1a] border border-[#333] shadow-lg">
              <CardHeader>
                <CardTitle className="text-white text-xl">Games Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your games and their configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Table>
                    <TableHeader className="bg-[#222]">
                      <TableRow>
                        <TableHead className="text-[#00D6A4] font-bold">Game Name</TableHead>
                        <TableHead className="text-[#00D6A4] font-bold">Type</TableHead>
                        <TableHead className="text-[#00D6A4] font-bold">Points Required</TableHead>
                        <TableHead className="text-[#00D6A4] font-bold">Status</TableHead>
                        <TableHead className="text-[#00D6A4] font-bold">Prizes</TableHead>
                        <TableHead className="text-[#00D6A4] font-bold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {games.map((game) => (
                        <TableRow key={game._id} className="hover:bg-[#222] border-b border-[#333]">
                          <TableCell>{game.name}</TableCell>
                          <TableCell>{game.gameType}</TableCell>
                          <TableCell>{game.points} points</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${game.featured
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-[#222] text-gray-400 border border-[#333]'
                              }`}>
                              {game.featured ? 'Featured' : 'Not Featured'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {game.prizedAssigned?.length || 0} prizes assigned
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {game.featured ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => unfeatureGame(game._id)}
                                  className="border-amber-500 text-amber-400 hover:bg-amber-500/20"
                                >
                                  Unfeature
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFeatureGame(game._id)}
                                  className="border-green-500 text-green-400 hover:bg-green-500/20"
                                >
                                  Feature
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedGame(game._id);
                                  setGameConfig({
                                    points: game.points,
                                    prizes: game.prizedAssigned || [],
                                    spinConfig: game.config?.spinConfig || {
                                      includeFreeSpin: false,
                                      includeTryAgain: false
                                    }
                                  });
                                  setShowPrizeDialog(true);
                                }}
                                className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                              >
                                Configure
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

            {/* Render the game configuration dialog */}
            <GameConfigDialog />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;