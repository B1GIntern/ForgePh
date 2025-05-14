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
  Calendar as CalendarIcon,
  Shield,
  XCircle,
  CheckCircle2,
  FileX,
  Mail,
  MapPin,
  User,
  Loader2,
  Lock
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
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from "xlsx";
import { decryptImage } from "@/utils/cryptoUtils";

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

// Government ID verification interfaces
interface GovernmentIDSubmission {
  id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    userType: string;
  };
  uploadedAt: string;
  hasFrontID: boolean;
  hasBackID: boolean;
}

interface GovernmentIDDetail {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    userType: string;
  };
  front: {
    encryptedData: string;
    iv: string;
  };
  back: {
    encryptedData: string;
    iv: string;
  };
  uploadedAt: string;
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

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Add activeTab state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
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

  
  // Declare state for retailers
  const [retailers, setRetailers] = useState<any[]>([]); // <== Add this line to declare retailers state
  const [isLoading, setIsLoading] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [selectedTab, setSelectedTab] = useState("rewards");
  const [isLoadingGames, setIsLoadingGames] = useState(false);
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
  
  // Move the rest of the state declarations here
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  
  // Add state for dashboardStats
  const [dashboardStats, setDashboardStats] = useState([
    {
      label: "Total Retailers",
      value: "0",
      icon: <Users size={20} className="text-white" />,
      percentage: 100
    },
    {
      label: "Active Promos",
      value: "0",
      icon: <Zap size={20} className="text-white" />,
      percentage: 75
    },
    {
      label: "Promo Codes",
      value: "0",
      icon: <Tag size={20} className="text-white" />,
      percentage: 60
    },
    {
      label: "Total Rewards",
      value: "0",
      icon: <Trophy size={20} className="text-white" />,
      percentage: 85
    }
  ]);

  // Update dashboardStats whenever relevant state changes
  useEffect(() => {
    setDashboardStats([
      {
        label: "Total Retailers",
        value: mockRetailers.length.toString(),
        icon: <Users size={20} className="text-white" />,
        percentage: 100
      },
      {
        label: "Active Promos",
        value: flashPromos.length > 0 ? flashPromos.filter(p => p.isActive).length.toString() : "0",
        icon: <Zap size={20} className="text-white" />,
        percentage: 75
      },
      {
        label: "Promo Codes",
        value: promoCodes.length.toString(),
        icon: <Tag size={20} className="text-white" />,
        percentage: 60
      },
      {
        label: "Total Rewards",
        value: rewards.length.toString(),
        icon: <Trophy size={20} className="text-white" />,
        percentage: 85
      }
    ]);
  }, [rewards, promoCodes, flashPromos]);

  // Delete the old definition here:
  // const dashboardStats = [...]
  
  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        const response = await axios.get("https://forgeph-2.onrender.com/api/users/top-retailers");
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
      const response = await fetch("https://forgeph-2.onrender.com/api/auth/rewards");
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
      const response = await fetch("https://forgeph-2.onrender.com/api/auth/create-reward", {
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
    fetch(`https://forgeph-2.onrender.com/api/auth/delete-reward/${id}`, {
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
 // For retailer redemptions modal
 const [showRedemptionsModal, setShowRedemptionsModal] = useState(false);
 const [retailerRedemptions, setRetailerRedemptions] = useState<any[]>([]);
 const [redemptionSearchQuery, setRedemptionSearchQuery] = useState('');
 const [isLoadingRedemptions, setIsLoadingRedemptions] = useState(false);
 const [redemptionsPage, setRedemptionsPage] = useState(1);
 const [redemptionsPerPage] = useState(10); // Show 10 per page
 
 // For delete all promo codes confirmation
 const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false);
 const [isDeletingAllCodes, setIsDeletingAllCodes] = useState(false);

 // Calculate filtered redemptions based on search query
 const filteredRedemptions = retailerRedemptions.filter(redemption => {
   const searchLower = redemptionSearchQuery.toLowerCase();
   return (
     redemption.code?.toLowerCase().includes(searchLower) ||
     redemption.shopName?.toLowerCase().includes(searchLower) ||
     redemption.retailerName?.toLowerCase().includes(searchLower)
   );
 });

 // Reset page when filtering
 useEffect(() => {
   setRedemptionsPage(1);
 }, [redemptionSearchQuery]);

 // Get current page redemptions
 const indexOfLastRedemption = redemptionsPage * redemptionsPerPage;
 const indexOfFirstRedemption = indexOfLastRedemption - redemptionsPerPage;
 const currentRedemptions = filteredRedemptions.slice(indexOfFirstRedemption, indexOfLastRedemption);
 const totalRedemptionsPages = Math.ceil(filteredRedemptions.length / redemptionsPerPage);

 // Change redemptions page
 const nextRedemptionsPage = () => {
   if (redemptionsPage < totalRedemptionsPages) {
     setRedemptionsPage(redemptionsPage + 1);
   }
 };

 const prevRedemptionsPage = () => {
   if (redemptionsPage > 1) {
     setRedemptionsPage(redemptionsPage - 1);
   }
 };

 // Fetch retailer redemptions
 const fetchRetailerRedemptions = async () => {
    setIsLoadingRedemptions(true);
    try {
      // First, get all redeemed promo codes
      const response = await axios.get('https://forgeph-2.onrender.com/api/promo-codes/redeemed');
      
      if (response.data.success) {
        console.log('Redeemed codes response:', response.data);
        
        // Process each redeemed code to add retailer details
        const redeemedCodes = response.data.data.map((item: any) => {
          return {
          id: item._id,
          code: item.code,
            shopName: item.redeemedBy?.shopName || 'Unknown Shop',
          points: item.points,
          redeemedAt: item.redeemedBy?.redeemedAt || new Date().toISOString()
          };
        });

        setRetailerRedemptions(redeemedCodes);
        setRedemptionsPage(1);
        
        console.log(`Successfully processed ${redeemedCodes.length} redeemed promo codes`);
      } else {
        throw new Error('Failed to fetch redeemed promo codes');
      }
    } catch (error) {
      console.error('Error fetching retailer redemptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch redemption data. Please try again later.',
        variant: 'destructive',
      });
      setRetailerRedemptions([]);
    } finally {
      setIsLoadingRedemptions(false);
    }
  };

 // Open redemptions modal and load data
 const openRedemptionsModal = () => {
   setShowRedemptionsModal(true);
   fetchRetailerRedemptions();
 };

 // Download Excel file of retailer redemptions
 const handleDownloadExcel = () => {
   try {
     console.log(`Preparing Excel export for ${retailerRedemptions.length} redemptions`);
     
     // Prepare data for Excel with simplified information
     const excelData = retailerRedemptions.map((item, index) => {
       // Log every 10th item for debugging
       if (index % 10 === 0) {
         console.log(`Sample redemption data (item ${index}):`, item);
       }
       
       return {
         'Promo Code': item.code || 'N/A',
         'Shop Name': item.shopName || 'N/A',
         'Points': item.points || 0,
         'Redeemed At': item.redeemedAt ? new Date(item.redeemedAt).toLocaleString() : 'N/A'
       };
     });
     
     console.log(`Processed ${excelData.length} records for Excel export`);
     
     // Create worksheet
     const ws = XLSX.utils.json_to_sheet(excelData);
     
     // Create workbook and add the worksheet
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'Consumer Redemptions');
     
     // Generate file name with current date
     const fileName = `Consumer_Redemptions_${new Date().toISOString().split('T')[0]}.xlsx`;
     
     // Write and download the file
     XLSX.writeFile(wb, fileName);
     
     console.log(`Excel file downloaded: ${fileName}`);
     
     toast({
       title: 'Excel Downloaded',
       description: `${fileName} has been downloaded with ${excelData.length} records.`
     });
   } catch (error) {
     console.error('Error downloading Excel:', error);
     toast({
       title: 'Download Failed',
       description: 'Failed to generate Excel file. Check console for details.',
       variant: 'destructive'
     });
   }
 };
  // Fetch promo codes on component mount
  useEffect(() => {
    fetchPromoCodes();
  }, []);

  // Fetch promo codes with defensive programming
  // Fetch promo codes with defensive programming
  const fetchPromoCodes = async () => {
    try {
      const response = await axios.get('https://forgeph-2.onrender.com/api/promo-codes');

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

      // Get authentication token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post('https://forgeph-2.onrender.com/api/promo-codes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
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
      const response = await axios.get('https://forgeph-2.onrender.com/api/prizes');
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
      const response = await axios.post('https://forgeph-2.onrender.com/api/prizes', newPrize);

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
        const response = await axios.delete(`https://forgeph-2.onrender.com/api/prizes/${id}`);

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
        const response = await axios.get('https://forgeph-2.onrender.com/api/flash-promos');
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

      const response = await axios.post('https://forgeph-2.onrender.com/api/flash-promos', payload);
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
        // Update the UI immediately for better responsiveness
        setFlashPromos(prevPromos => 
          prevPromos.map(promo => 
            promo._id === id 
              ? { ...promo, isActive: !currentStatus }
              : promo
          )
        );
        
        // Try multiple strategies to update the server
        let serverUpdated = false;
        let errorMessage = '';
        
        // Strategy 1: Try the PUT endpoint
        try {
          const putResponse = await axios({
            method: 'put',
            url: `https://forgeph-2.onrender.com/api/flash-promos/${id}`,
            data: {
              isActive: !currentStatus
            },
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (putResponse.data && putResponse.data.success) {
            serverUpdated = true;
          }
        } catch (putError) {
          errorMessage = 'PUT endpoint failed: ' + (putError.message || 'Unknown error');
          console.error('PUT strategy failed:', putError);
          
          // Strategy 2: Try the PATCH status endpoint
          try {
            const patchResponse = await axios({
              method: 'patch',
              url: `https://forgeph-2.onrender.com/api/flash-promos/${id}/status`,
              data: {
                isActive: !currentStatus
              },
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (patchResponse.data) {
              serverUpdated = true;
            }
          } catch (patchError) {
            errorMessage += ' | PATCH endpoint failed: ' + (patchError.message || 'Unknown error');
            console.error('PATCH strategy failed:', patchError);
            
            // Strategy 3: Try the POST status endpoint
            try {
              const postResponse = await axios({
                method: 'post',
                url: `https://forgeph-2.onrender.com/api/flash-promos/${id}/status`,
                data: {
                  isActive: !currentStatus
                },
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              
              if (postResponse.data) {
                serverUpdated = true;
              }
            } catch (postError) {
              errorMessage += ' | POST endpoint failed: ' + (postError.message || 'Unknown error');
              console.error('POST strategy failed:', postError);
            }
          }
        }
        
        if (serverUpdated) {
          toast({
            title: 'Success',
            description: `Flash promo ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
            variant: 'default'
          });
        } else {
          throw new Error('All server update strategies failed: ' + errorMessage);
        }
      } catch (error) {
        console.error('Error toggling flash promo status:', error);
        
        toast({
          title: 'Warning',
          description: 'The UI has been updated, but the server change failed. Status will revert on refresh.',
          variant: 'destructive'
        });
      }
    };

    // Delete flash promo
    const deleteFlashPromo = async (id: string) => {
      try {
        await axios.delete(`https://forgeph-2.onrender.com/api/flash-promos/${id}`);
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
  const [isConfiguring, setIsConfiguring] = useState(false);
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

  // Government ID verification state
  const [idSubmissions, setIdSubmissions] = useState<GovernmentIDSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<GovernmentIDDetail | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [showIdDetailDialog, setShowIdDetailDialog] = useState(false);
  const [idLoading, setIdLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showDecryptDialog, setShowDecryptDialog] = useState(false);
  const [decryptedImages, setDecryptedImages] = useState<{front: string | null, back: string | null}>({front: null, back: null});

  // Fetch games from the backend
  const fetchGames = async () => {
    try {
      const response = await axios.get('https://forgeph-2.onrender.com/api/games');

      console.log('Games response:', response.data);

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
    try {
      setSelectedGame(gameId);
      
      // First update the UI optimistically
      setGames(prevGames => prevGames.map(game =>
        game._id === gameId ? { ...game, featured: true } : game
      ));
      
      // Show success toast immediately for better UX
      toast({
        title: 'Success',
        description: 'Game added to featured'
      });
      
      // Feature the game
      await axios.post(`https://forgeph-2.onrender.com/api/games/${gameId}/feature`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Successfully featured game');
      
      // Open the prize dialog
      setShowPrizeDialog(true);
    } catch (error) {
      console.error('Error featuring game:', error);
      
      // If the feature fails, show a warning and refresh the games list
      toast({
        title: 'Warning',
        description: 'There might have been an issue featuring the game. Please refresh the page to verify.',
        variant: 'destructive'
      });
      
      // Refresh the games list to ensure UI is in sync with server
      await fetchGames();
    }
  };

  // Update game configuration and feature status
  const updateGameConfig = async () => {
    if (!selectedGame) return;

    try {
      // Get the single prize (we only allow one per game now)
      let mappedPrize = [];
      if (gameConfig.prizes.length > 0) {
        const selectedPrize = prizes.find(p => p._id === gameConfig.prizes[0].prizeId);
        if (selectedPrize) {
          mappedPrize = [{
            prizeId: gameConfig.prizes[0].prizeId,
            prizeName: selectedPrize.name,
            multiplier: gameConfig.prizes[0].multiplier
          }];
        }
      }

      const payload = {
        featured: true,
        points: gameConfig.points,
        prizedAssigned: mappedPrize,
        config: {
          spinConfig: gameConfig.spinConfig
        }
      };

      console.log('Updating game with payload:', payload);

      // Use POST instead of PATCH to avoid CORS issues
      await axios.post(`https://forgeph-2.onrender.com/api/games/${selectedGame}/feature`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

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
      console.log(`Unfeaturing game with ID: ${gameId}`);
      
      // First update the UI optimistically 
      setGames(prevGames => prevGames.map(game =>
        game._id === gameId ? { ...game, featured: false, prizedAssigned: [] } : game
      ));
      
      // Show success toast immediately for better UX
      toast({
        title: 'Success',
        description: 'Game removed from featured'
      });
      
      // Try the unfeature endpoint with POST
      try {
        await axios.post(`https://forgeph-2.onrender.com/api/games/${gameId}/unfeature`, {}, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Successfully unfeatured game');
        return;
      } catch (error: any) {
        console.error('Failed to unfeature game:', error);
        
        // If the POST fails, show a warning and refresh the games list
        toast({
          title: 'Warning',
          description: 'There might have been an issue unfeaturing the game. Please refresh the page to verify.',
          variant: 'destructive'
        });
        
        // Refresh the games list to ensure UI is in sync with server
        await fetchGames();
      }
    } catch (error) {
      console.error('Error in unfeatureGame:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfeature game. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Load games on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  // Game configuration dialog JSX
  const GameConfigDialog: React.FC = () => {
    // Custom handler for dialog open state changes
    const handleOpenChange = (open: boolean) => {
      if (!open) {
        // Only allow closing via the cancel/save buttons, not by clicking outside
        // This prevents the dialog from closing when interacting with checkboxes
        if (!isConfiguring) {
          setShowPrizeDialog(false);
        }
      }
    };

    return (
      <Dialog open={showPrizeDialog} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-[#1a1a1a] border border-[#333] text-white" aria-describedby="prize-dialog-description">
          <DialogDescription id="prize-dialog-description" className="sr-only">
            View and configure prizes for flash promotions
          </DialogDescription>
          <DialogHeader>
            <DialogTitle>Configure Game</DialogTitle>
            <DialogDescription id="redemptions-dialog-description" className="sr-only">
              Set up points and assign a single prize to this game. Only one prize can be assigned per game.
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
              <Label>Select Prize (One per game)</Label>
              {prizes.map((prize) => (
                <div key={prize._id} className="flex items-center space-x-2 mt-2">
                  <input
                    type="radio"
                    id={`prize-${prize._id}`}
                    name="gameprize"
                    checked={gameConfig.prizes.some(p => p.prizeId === prize._id)}
                    onChange={() => {
                      setIsConfiguring(true);
                      // Replace any existing prizes with just this one
                      setGameConfig({
                        ...gameConfig,
                        prizes: [{ prizeId: prize._id }]
                      });
                      setTimeout(() => setIsConfiguring(false), 0);
                    }}
                    className="text-xforge-teal focus:ring-xforge-teal"
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
                    onCheckedChange={(checked) => {
                      setIsConfiguring(true);
                      setGameConfig({
                        ...gameConfig,
                        spinConfig: {
                          ...gameConfig.spinConfig,
                          includeFreeSpin: checked === true
                        }
                      });
                      setTimeout(() => setIsConfiguring(false), 0);
                    }}
                  />
                  <label htmlFor="free-spin" className="text-sm text-gray-300">
                    Include Free Spin Slice
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="try-again"
                    checked={gameConfig.spinConfig.includeTryAgain}
                    onCheckedChange={(checked) => {
                      setIsConfiguring(true);
                      setGameConfig({
                        ...gameConfig,
                        spinConfig: {
                          ...gameConfig.spinConfig,
                          includeTryAgain: checked === true
                        }
                      });
                      setTimeout(() => setIsConfiguring(false), 0);
                    }}
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
              onClick={() => {
                setIsConfiguring(false);
                setShowPrizeDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                updateGameConfig();
              }}
              className="bg-xforge-teal hover:bg-xforge-teal/90"
            >
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  // Function to delete all promo codes
  const deleteAllPromoCodes = async () => {
    setIsDeletingAllCodes(true);
    try {
      const response = await axios.delete('https://forgeph-2.onrender.com/api/promo-codes/delete-all');
      
      console.log('Delete all promo codes response:', response.data);
      
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: `Successfully deleted ${response.data.deleted} promo codes.`,
        });
        
        // Refresh the promo codes list
        await fetchPromoCodes();
      } else {
        toast({
          title: 'Error',
          description: response.data?.message || 'Failed to delete promo codes',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting all promo codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete all promo codes',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAllCodes(false);
      setShowDeleteAllConfirmation(false);
    }
  };
  // Fetch Government ID submissions
  const fetchIdSubmissions = async () => {
    try {
      setIdLoading(true);
      const response = await axios.get("/api/government-id/submissions");
      if (response.data.success) {
        setIdSubmissions(response.data.submissions);
      }
    } catch (error) {
      console.error("Error fetching ID submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load ID submissions",
        variant: "destructive"
      });
    } finally {
      setIdLoading(false);
    }
  };

  // Get single ID submission details
  const fetchIdSubmissionDetail = async (id: string) => {
    try {
      setIdLoading(true);
      const response = await axios.get(`/api/government-id/submissions/${id}`);
      if (response.data.success) {
        setSelectedSubmission(response.data.submission);
        setShowIdDetailDialog(true);
      }
    } catch (error) {
      console.error("Error fetching ID submission details:", error);
      toast({
        title: "Error",
        description: "Failed to load ID submission details",
        variant: "destructive"
      });
    } finally {
      setIdLoading(false);
    }
  };

  // Decrypt and view ID images
  const decryptAndViewId = async () => {
    if (!selectedSubmission) return;
    
    // Show the password dialog first
    setShowDecryptDialog(true);
  };
  
  // Perform the actual decryption with password
  const decryptWithPassword = async () => {
    if (!selectedSubmission) return;
    
    try {
      setIdLoading(true);
      
      // Use a hardcoded password for testing
      const testPassword = "admin123";
      console.log("Using hardcoded password for testing:", testPassword);
      
      // Validate the encrypted data
      if (!selectedSubmission.front?.encryptedData || !selectedSubmission.front?.iv ||
          !selectedSubmission.back?.encryptedData || !selectedSubmission.back?.iv) {
        throw new Error("Missing encrypted data or initialization vector");
      }
      
      console.log("Encrypted data validation:", {
        frontDataLength: selectedSubmission.front.encryptedData.length,
        frontIvLength: selectedSubmission.front.iv.length,
        backDataLength: selectedSubmission.back.encryptedData.length,
        backIvLength: selectedSubmission.back.iv.length
      });
      
      // Client-side decryption using our utility function
      let frontDecrypted, backDecrypted;
      
      try {
        frontDecrypted = await decryptImage(
          selectedSubmission.front.encryptedData,
          selectedSubmission.front.iv,
          testPassword // Use the hardcoded password
        );
        console.log("Front ID decrypted successfully");
      } catch (frontError) {
        console.error("Error decrypting front ID:", frontError);
        throw new Error(`Failed to decrypt front ID: ${frontError.message}`);
      }
      
      try {
        backDecrypted = await decryptImage(
          selectedSubmission.back.encryptedData,
          selectedSubmission.back.iv,
          testPassword // Use the hardcoded password
        );
        console.log("Back ID decrypted successfully");
      } catch (backError) {
        console.error("Error decrypting back ID:", backError);
        throw new Error(`Failed to decrypt back ID: ${backError.message}`);
      }
      
      setDecryptedImages({
        front: frontDecrypted,
        back: backDecrypted
      });
      
      setShowDecryptDialog(false);
      
      toast({
        title: "Success",
        description: "ID images decrypted successfully",
      });
    } catch (error) {
      console.error("Error decrypting images:", error);
      toast({
        title: "Decryption Failed",
        description: error instanceof Error ? error.message : "Unable to decrypt images. Check your password and try again.",
        variant: "destructive"
      });
    } finally {
      setIdLoading(false);
    }
  };
  
  // Approve or reject ID submission
  const handleVerifyId = async (status: 'Approved' | 'Rejected') => {
    if (!selectedSubmission) return;
    
    try {
      setIdLoading(true);
      const response = await axios.put(`/api/government-id/submissions/${selectedSubmission._id}/verify`, {
        status,
        notes: verificationNotes,
        adminId: localStorage.getItem('userId') // Should be the admin's user ID
      });
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: `Government ID ${status.toLowerCase()} successfully`,
          variant: "default"
        });
        
        // If approved, delete the submission after verification
        if (status === 'Approved') {
          await handleDeleteSubmission(selectedSubmission._id);
        }
        
        // Close dialog and refresh data
        setShowIdDetailDialog(false);
        setSelectedSubmission(null);
        setVerificationNotes("");
        setDecryptedImages({front: null, back: null});
        fetchIdSubmissions();
      }
    } catch (error) {
      console.error(`Error ${status.toLowerCase()} ID:`, error);
      toast({
        title: "Error",
        description: `Failed to ${status.toLowerCase()} ID`,
        variant: "destructive"
      });
    } finally {
      setIdLoading(false);
    }
  };

  // Delete a government ID submission
  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      const response = await axios.delete(`/api/government-id/submissions/${submissionId}`);
      
      if (response.data.success) {
        console.log("Government ID submission deleted successfully");
        // No need for a toast here since we're already showing a success message for the verification
      }
    } catch (error) {
      console.error("Error deleting ID submission:", error);
      // Don't show an error toast here since the verification was successful
      // We'll just log the error
    }
  };

  // Modify the return statement to use the new layout
  return (
    <div className="flex h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <div className="w-64 min-h-screen bg-[#1e293b] border-r border-[#334155] shadow-xl flex flex-col">
        <div className="p-6 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#00D6A4] to-[#3b82f6] flex items-center justify-center shadow-lg">
              <BarChart3 size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">
              <span className="text-[#00D6A4]">Forge</span> Admin
            </h1>
          </div>
          </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                activeTab === "dashboard" 
                  ? "bg-[#00D6A4]/10 text-[#00D6A4]" 
                  : "text-gray-300 hover:bg-[#334155]/50"
              }`}
            >
              <BarChart3 size={18} />
              <span>Dashboard</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("retailers")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                activeTab === "retailers" 
                  ? "bg-[#00D6A4]/10 text-[#00D6A4]" 
                  : "text-gray-300 hover:bg-[#334155]/50"
              }`}
            >
              <Users size={18} />
              <span>Retailers</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("rewards")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                activeTab === "rewards" 
                  ? "bg-[#00D6A4]/10 text-[#00D6A4]" 
                  : "text-gray-300 hover:bg-[#334155]/50"
              }`}
            >
              <Gift size={18} />
              <span>Rewards</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("winners")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                activeTab === "winners" 
                  ? "bg-[#00D6A4]/10 text-[#00D6A4]" 
                  : "text-gray-300 hover:bg-[#334155]/50"
              }`}
            >
              <Award size={18} />
              <span>Winners</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("prizes")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                activeTab === "prizes" 
                  ? "bg-[#00D6A4]/10 text-[#00D6A4]" 
                  : "text-gray-300 hover:bg-[#334155]/50"
              }`}
            >
              <Trophy size={18} />
              <span>Prize Pool</span>
            </button>

            <button 
              onClick={() => setActiveTab("flash-promos")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                activeTab === "flash-promos" 
                  ? "bg-[#00D6A4]/10 text-[#00D6A4]" 
                  : "text-gray-300 hover:bg-[#334155]/50"
              }`}
            >
              <Zap size={18} />
              <span>Flash Promos</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("promo-codes")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                activeTab === "promo-codes" 
                  ? "bg-[#00D6A4]/10 text-[#00D6A4]" 
                  : "text-gray-300 hover:bg-[#334155]/50"
              }`}
            >
              <Tag size={18} />
              <span>Promo Codes</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("games")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                activeTab === "games" 
                  ? "bg-[#00D6A4]/10 text-[#00D6A4]" 
                  : "text-gray-300 hover:bg-[#334155]/50"
              }`}
            >
              <Gamepad size={18} />
              <span>Games</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("verification")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                activeTab === "verification" 
                  ? "bg-[#00D6A4]/10 text-[#00D6A4]" 
                  : "text-gray-300 hover:bg-[#334155]/50"
              }`}
            >
              <Shield size={18} />
              <span>ID Verification</span>
            </button>
            </div>
        </div>
        
        <div className="p-4 border-t border-[#334155]">
          <Button
            variant="outline"
            className="w-full border-[#334155] text-gray-300 hover:bg-[#334155] hover:text-white"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#1e293b] border-b border-[#334155] flex items-center justify-between px-6 shadow-lg">
          <h2 className="text-xl font-medium text-white">
            {activeTab === "dashboard" && "Dashboard Overview"}
            {activeTab === "retailers" && "Top Retailers"}
            {activeTab === "rewards" && "Rewards Management"}
            {activeTab === "winners" && "Winners List"}
            {activeTab === "prizes" && "Prize Pool"}
            {activeTab === "flash-promos" && "Flash Promotions"}
            {activeTab === "promo-codes" && "Promo Codes"}
            {activeTab === "games" && "Featured Games"}
            {activeTab === "verification" && "ID Verification"}
          </h2>

          <div className="flex items-center gap-4">
            <div className="bg-[#0f172a] px-3 py-1 rounded-full flex items-center text-gray-400 text-sm border border-[#334155]">
              <Clock size={14} className="mr-2 text-[#00D6A4]" />
              {new Date().toLocaleTimeString()}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="text-gray-300 border-[#334155] hover:bg-[#334155] hover:text-white"
              onClick={refreshData}
            >
              <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-[#0f172a]">
          {/* Dashboard Overview */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardStats.map((stat, index) => (
                  <Card key={index} className="bg-[#1e293b] border-[#334155] hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start">
                        <div className="flex-1">
                          <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                          <p className="text-white text-2xl font-semibold">{stat.value}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-[#0f172a] flex items-center justify-center text-[#00D6A4]">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="mt-3 h-1 w-full bg-[#0f172a] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#00D6A4] to-[#3b82f6]" style={{ width: `${(stat.percentage || 100)}%` }}></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Activity and Promo Code Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-[#1e293b] border-[#334155] col-span-2 overflow-hidden">
                  <CardHeader className="border-b border-[#334155] bg-[#1e293b]/70 p-4">
                    <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-[#1e293b]">
                        <TableRow className="border-[#334155]">
                          <TableHead className="text-[#00D6A4] font-medium">Action</TableHead>
                          <TableHead className="text-[#00D6A4] font-medium">User</TableHead>
                          <TableHead className="text-[#00D6A4] font-medium">Time</TableHead>
                          <TableHead className="text-[#00D6A4] font-medium">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockRedemptions.map((redemption) => (
                          <TableRow key={redemption.id} className="border-[#334155] hover:bg-[#0f172a]">
                            <TableCell className="font-medium text-gray-300">Code Redemption</TableCell>
                            <TableCell className="text-gray-300">{redemption.user}</TableCell>
                            <TableCell className="text-gray-400">{redemption.timestamp}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                redemption.status === 'Success' 
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {redemption.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#1e293b] border-[#334155] overflow-hidden">
                  <CardHeader className="border-b border-[#334155] bg-[#1e293b]/70 p-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white text-lg">Promo Code Stats</CardTitle>
            <Button
              variant="outline"
                size="sm"
                        className="h-8 text-xs border-[#334155] text-gray-300 hover:bg-[#334155]"
                        onClick={() => setActiveTab("promo-codes")}
            >
                        View All
            </Button>
          </div>
                  </CardHeader>
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Total Codes</span>
                          <span className="text-white font-medium">{getPromoCodeMetrics().total}</span>
                        </div>
                        <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
                          <div className="h-full bg-[#00D6A4]" style={{ width: '100%' }}></div>
        </div>
      </div>

                <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Redeemed</span>
                          <span className="text-white font-medium">{getPromoCodeMetrics().redeemed}</span>
                </div>
                        <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${(getPromoCodeMetrics().redeemed / getPromoCodeMetrics().total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Available</span>
                          <span className="text-white font-medium">{getPromoCodeMetrics().active}</span>
                        </div>
                        <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500" 
                            style={{ width: `${(getPromoCodeMetrics().active / getPromoCodeMetrics().total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-4 rounded-lg border border-[#334155] bg-[#0f172a]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-xs">Latest Upload</p>
                          <p className="text-white font-medium">
                            {currentFileName || "No uploads yet"}
                          </p>
                        </div>
              <Button
                variant="outline"
                size="sm"
                          className="h-8 text-xs border-[#334155] text-[#00D6A4] hover:bg-[#00D6A4]/10"
                          onClick={() => setActiveTab("promo-codes")}
              >
                          <Upload size={14} className="mr-1" />
                          Upload
              </Button>
            </div>
                </div>
              </CardContent>
            </Card>
        </div>
            </div>
          )}

          {/* Content for other tabs */}
          {activeTab === "retailers" && (
            <div className="space-y-6">
              <Card className="bg-[#1e293b] border-[#334155] shadow-md overflow-hidden">
                <CardHeader className="border-b border-[#334155] bg-[#1e293b]/70 p-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white text-lg">Top 50 Retailers by Points</CardTitle>
              <div className="relative w-72">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search retailers..."
                        className="pl-10 bg-[#0f172a] border-[#334155] focus:border-[#00D6A4]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
                </CardHeader>
                <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                      <TableHeader className="bg-[#1e293b]/80">
                        <TableRow className="border-[#334155]">
                          <TableHead className="text-[#00D6A4] font-medium">Rank</TableHead>
                          <TableHead className="text-[#00D6A4] font-medium">Name</TableHead>
                          <TableHead className="text-[#00D6A4] font-medium">
                      <div className="flex items-center cursor-pointer">
                        Points
                        <ChevronDown size={16} className="ml-1" />
                      </div>
                    </TableHead>
                          <TableHead className="text-[#00D6A4] font-medium">Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRetailers.map((retailer, index) => (
                          <TableRow key={retailer.id || retailer._id || `retailer-${index}`} className="border-[#334155] hover:bg-[#0f172a]">
                      <TableCell className="font-medium">
                        {index < 3 ? (
                                <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs ${
                                  index === 0 ? 'bg-amber-400' :
                              index === 1 ? 'bg-slate-300' :
                                'bg-amber-700'
                                } text-[#0f172a] font-bold`}>
                            {index + 1}
                          </span>
                        ) : (
                                <span className="text-gray-400">{index + 1}</span>
                        )}
                      </TableCell>
                            <TableCell className="text-gray-300">{retailer.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                                <span className="text-[#00D6A4] font-bold">{retailer.points.toLocaleString()}</span>
                                <div className="ml-2 h-2 bg-[#0f172a] rounded-full w-24">
                            <div
                                    className="h-full bg-gradient-to-r from-[#00D6A4] to-[#3b82f6] rounded-full"
                              style={{ width: `${Math.min(100, (retailer.points / 10000) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                            <TableCell className="text-gray-400">{retailer.registrationDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Keep the original content for other tabs but with conditional rendering */}
          {activeTab === "rewards" && (
            <div className="space-y-6 animate-fade-in">
              <Card className="bg-[#1e293b] border-[#334155] shadow-md">
                <CardHeader className="border-b border-[#334155] bg-[#1e293b]/70">
                  <CardTitle className="text-white">Manage Rewards</CardTitle>
                  <CardDescription className="text-gray-400">
                    Add, edit, or remove rewards that users can redeem with their points.
                  </CardDescription>
              </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <h3 className="text-white font-semibold mb-4">Add New Reward</h3>
                      <div className="space-y-4">
                  <div>
                          <Label htmlFor="reward-name" className="text-gray-300">Name</Label>
                    <Input
                      id="reward-name"
                      value={newReward.name}
                            onChange={(e) =>
                              setNewReward({ ...newReward, name: e.target.value })
                            }
                            className="bg-[#0f172a] border-[#334155] text-white"
                            placeholder="Premium Membership"
                    />
                  </div>
                  <div>
                          <Label htmlFor="reward-points" className="text-gray-300">Points Required</Label>
                    <Input
                      id="reward-points"
                      type="number"
                            value={newReward.pointsRequired}
                            onChange={(e) =>
                              setNewReward({
                                ...newReward,
                                pointsRequired: parseInt(e.target.value),
                              })
                            }
                            className="bg-[#0f172a] border-[#334155] text-white"
                            min={0}
                            placeholder="500"
                    />
                  </div>
                  <div>
                          <Label htmlFor="reward-stock" className="text-gray-300">Stock Available</Label>
                    <Input
                      id="reward-stock"
                      type="number"
                            value={newReward.stockAvailable}
                            onChange={(e) =>
                              setNewReward({
                                ...newReward,
                                stockAvailable: parseInt(e.target.value),
                              })
                            }
                            className="bg-[#0f172a] border-[#334155] text-white"
                            min={0}
                            placeholder="10"
                    />
                  </div>
                  <div>
                          <Label htmlFor="reward-type" className="text-gray-300">Type</Label>
                          <Input
                      id="reward-type"
                      value={newReward.type}
                            onChange={(e) =>
                              setNewReward({ ...newReward, type: e.target.value })
                            }
                            className="bg-[#0f172a] border-[#334155] text-white"
                            placeholder="Voucher, Product, etc."
                          />
                  </div>
                    <Button
                      onClick={addReward}
                          className="w-full bg-[#00D6A4] hover:bg-[#00D6A4]/90 text-[#0f172a]"
                    >
                          <Plus className="mr-2 h-4 w-4" /> Add Reward
                    </Button>
                  </div>
                </div>
                    <div className="lg:col-span-2">
                      <h3 className="text-white font-semibold mb-4">Current Rewards</h3>
                      <div className="rounded-md border border-[#334155]">
                  <Table>
                          <TableHeader className="bg-[#1e293b]/50">
                  <TableRow className="border-[#334155]">
                              <TableHead className="text-[#00D6A4]">Name</TableHead>
                              <TableHead className="text-[#00D6A4] text-right">Points</TableHead>
                              <TableHead className="text-[#00D6A4] text-right">Stock</TableHead>
                              <TableHead className="text-[#00D6A4] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                            {rewards.length === 0 ? (
                    <TableRow className="border-[#334155]">
                      <TableCell
                                  colSpan={4}
                        className="h-24 text-center text-gray-400"
                      >
                                  No rewards found. Add one to get started.
                          </TableCell>
                    </TableRow>
                  ) : (
                              rewards.map((reward) => (
                      <TableRow
                                  key={reward.id}
                        className="border-[#334155] hover:bg-[#0f172a]"
                      >
                        <TableCell className="font-medium text-white">
                                    {reward.name}
                        </TableCell>
                                  <TableCell className="text-right text-[#00D6A4] font-medium">
                                    {reward.points.toLocaleString()}
                        </TableCell>
                                  <TableCell className="text-right">
                                    <span
                                      className={`${
                                        reward.stock > 10
                                          ? "text-green-400"
                                          : reward.stock > 0
                                          ? "text-amber-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      {reward.stock}
                            </span>
                          </TableCell>
                                  <TableCell className="text-right">
                            <Button
                                      variant="ghost"
                                      size="icon"
                              onClick={() => deleteReward(reward.id)}
                                      className="hover:bg-red-500/10 hover:text-red-400 text-gray-400"
                            >
                                      <Trash className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                              ))
                            )}
                    </TableBody>
                  </Table>
                </div>
                  </div>
                    </div>
                  </CardContent>
                </Card>
            </div>
          )}

          {activeTab === "winners" && (
            <div className="space-y-6 animate-fade-in">
              <Card className="bg-[#1e293b] border-[#334155] shadow-md">
                <CardHeader className="border-b border-[#334155] bg-[#1e293b]/70">
                  <CardTitle className="text-white">Recent Winners</CardTitle>
                  <CardDescription className="text-gray-400">
                    View the most recent winners from various promotions and games.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
              <Table>
                    <TableHeader className="bg-[#1e293b]/50">
                      <TableRow className="border-[#334155]">
                        <TableHead className="text-[#00D6A4]">Winner</TableHead>
                        <TableHead className="text-[#00D6A4]">Prize</TableHead>
                        <TableHead className="text-[#00D6A4]">Date</TableHead>
                        <TableHead className="text-[#00D6A4] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWinners.map((winner) => (
                        <TableRow
                          key={winner.id}
                          className="border-[#334155] hover:bg-[#0f172a]"
                        >
                          <TableCell className="font-medium text-white">
                            {winner.name}
                      </TableCell>
                          <TableCell className="text-gray-300">{winner.prize}</TableCell>
                          <TableCell className="text-gray-400">{winner.date}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#00D6A4] hover:bg-[#00D6A4]/10"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "prizes" && (
            <div className="space-y-6 animate-fade-in">
              <Card className="bg-[#1e293b] border-[#334155] shadow-md">
                <CardHeader className="border-b border-[#334155] bg-[#1e293b]/70">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Prize Pool Management</CardTitle>
                      <CardDescription className="text-gray-400">
                        Add and manage prizes that can be assigned to games or flash promotions
                      </CardDescription>
                    </div>
                    <Button
                      className="bg-[#00D6A4] hover:bg-[#00D6A4]/90 text-[#0f172a]"
                      onClick={() => {
                        document.getElementById("new-prize-name")?.focus();
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add New Prize
                    </Button>
                  </div>
              </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add New Prize Form */}
                    <div className="lg:col-span-1 space-y-4">
                  <div>
                        <Label htmlFor="new-prize-name" className="text-gray-300">Prize Name</Label>
                    <Input
                          id="new-prize-name"
                      value={newPrize.name}
                      onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
                          className="bg-[#0f172a] border-[#334155] text-white"
                          placeholder="e.g. Gaming Console"
                    />
                  </div>
                  <div>
                        <Label htmlFor="new-prize-description" className="text-gray-300">Description</Label>
                    <Input
                          id="new-prize-description"
                      value={newPrize.description}
                      onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
                          className="bg-[#0f172a] border-[#334155] text-white"
                          placeholder="Brief description of the prize"
                    />
                  </div>
                  <div>
                        <Label htmlFor="new-prize-quantity" className="text-gray-300">Quantity</Label>
                    <Input
                          id="new-prize-quantity"
                      type="number"
                      min="1"
                          value={newPrize.quantity}
                          onChange={(e) => setNewPrize({ ...newPrize, quantity: parseInt(e.target.value) })}
                          className="bg-[#0f172a] border-[#334155] text-white"
                    />
                  </div>
                    <Button
                      onClick={addPrize}
                        className="w-full bg-[#00D6A4] hover:bg-[#00D6A4]/90 text-[#0f172a]"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Prize
                    </Button>
                </div>

                    {/* List of Prizes */}
                    <div className="lg:col-span-2">
                      <h3 className="text-white font-semibold mb-4">Available Prizes</h3>
                      <div className="rounded-md border border-[#334155] overflow-hidden">
                  <Table>
                          <TableHeader className="bg-[#1e293b]/50">
                            <TableRow className="border-[#334155]">
                              <TableHead className="text-[#00D6A4]">Name</TableHead>
                              <TableHead className="text-[#00D6A4]">Description</TableHead>
                              <TableHead className="text-[#00D6A4] text-center">Quantity</TableHead>
                              <TableHead className="text-[#00D6A4] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                            {isLoading ? (
                              <TableRow className="border-[#334155]">
                                <TableCell colSpan={4} className="h-24 text-center">
                                  <div className="flex justify-center items-center">
                                    <RefreshCw className="h-5 w-5 animate-spin text-[#00D6A4]" />
                                    <span className="ml-2 text-gray-400">Loading prizes...</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : prizes.length === 0 ? (
                              <TableRow className="border-[#334155]">
                                <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                                  No prizes available. Add your first prize!
                                </TableCell>
                              </TableRow>
                            ) : (
                              prizes.map((prize) => (
                                <TableRow key={prize._id} className="border-[#334155] hover:bg-[#0f172a]">
                                  <TableCell className="font-medium text-white">
                              {prize.name}
                          </TableCell>
                        <TableCell className="text-gray-300">
                                    {prize.description}
                        </TableCell>
                                  <TableCell className="text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00D6A4]/10 text-[#00D6A4]">
                              {prize.quantity}
                            </span>
                          </TableCell>
                                  <TableCell className="text-right">
                            <Button
                                      variant="ghost"
                                      size="icon"
                              onClick={() => deletePrize(prize._id)}
                                      className="hover:bg-red-500/10 hover:text-red-400 text-gray-400"
                            >
                                      <Trash className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                            </div>
          )}
          
          {activeTab === "flash-promos" && (
            <div className="space-y-6 animate-fade-in">
              <Card className="bg-[#1e293b] border-[#334155] shadow-md">
                <CardHeader className="border-b border-[#334155] bg-[#1e293b]/70">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Flash Promotions</CardTitle>
                      <CardDescription className="text-gray-400">
                        Limited time promotions with special prizes and multipliers
                      </CardDescription>
                            </div>
            <Button
              className="bg-[#00D6A4] hover:bg-[#00D6A4]/90 text-[#0f172a]"
                      onClick={() => document.getElementById('new-promo-name')?.focus()}
            >
                      <Zap className="mr-2 h-4 w-4" /> New Flash Promo
            </Button>
                          </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add New Flash Promo Form */}
                    <div className="lg:col-span-1 space-y-4">
                      <h3 className="text-white font-semibold mb-4">Create New Flash Promo</h3>
                      <div>
                        <Label htmlFor="new-promo-name" className="text-gray-300">Promotion Name</Label>
                        <Input 
                          id="new-promo-name"
                          value={newFlashPromo.name}
                          onChange={(e) => setNewFlashPromo({...newFlashPromo, name: e.target.value})}
                          className="bg-[#0f172a] border-[#334155] text-white"
                          placeholder="Summer Flash Sale"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="start-date" className="text-gray-300">Start Date</Label>
                        <Input 
                          id="start-date" 
                            type="date"
                          value={newFlashPromo.startDate}
                          onChange={(e) => setNewFlashPromo({...newFlashPromo, startDate: e.target.value})}
                            className="bg-[#0f172a] border-[#334155] text-white"
                        />
                      </div>
                      <div>
                          <Label htmlFor="end-date" className="text-gray-300">End Date</Label>
                        <Input 
                          id="end-date" 
                            type="date"
                          value={newFlashPromo.endDate}
                          onChange={(e) => setNewFlashPromo({...newFlashPromo, endDate: e.target.value})}
                            className="bg-[#0f172a] border-[#334155] text-white"
                        />
                      </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="max-participants" className="text-gray-300">Max Participants</Label>
                        <Input 
                            id="max-participants"
                          type="number" 
                          min="1"
                            value={newFlashPromo.maxParticipants}
                            onChange={(e) => setNewFlashPromo({...newFlashPromo, maxParticipants: parseInt(e.target.value)})}
                            className="bg-[#0f172a] border-[#334155] text-white"
                        />
                      </div>
                      <div>
                          <Label htmlFor="multiplier" className="text-gray-300">Point Multiplier</Label>
                        <Input 
                            id="multiplier"
                          type="number" 
                          min="1"
                            step="0.1"
                            value={newFlashPromo.multiplier}
                            onChange={(e) => setNewFlashPromo({...newFlashPromo, multiplier: parseFloat(e.target.value)})}
                            className="bg-[#0f172a] border-[#334155] text-white"
                        />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="prize-description" className="text-gray-300">Prize Description</Label>
                        <Input 
                          id="prize-description"
                          value={newFlashPromo.prize}
                          onChange={(e) => setNewFlashPromo({...newFlashPromo, prize: e.target.value})}
                          className="bg-[#0f172a] border-[#334155] text-white"
                          placeholder="Exclusive limited edition merchandise"
                        />
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox 
                          id="is-active" 
                          checked={newFlashPromo.isActive}
                          onCheckedChange={(checked) => 
                            setNewFlashPromo({
                              ...newFlashPromo, 
                              isActive: checked === true
                            })
                          }
                        />
                        <label htmlFor="is-active" className="text-gray-300 text-sm">
                          Activate immediately after creation
                        </label>
                    </div>
                      <Button 
                        onClick={addFlashPromo}
                        className="w-full bg-[#00D6A4] hover:bg-[#00D6A4]/90 text-[#0f172a]"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Create Flash Promo
                      </Button>
                    </div>

                {/* Active Flash Promos */}
                    <div className="lg:col-span-2">
                      <h3 className="text-white font-semibold mb-4">Active Flash Promotions</h3>
                      <div className="space-y-4">
                        {flashPromos.length === 0 ? (
                          <div className="rounded-lg border border-[#334155] bg-[#0f172a] p-6 text-center">
                            <Zap className="h-10 w-10 text-[#334155] mx-auto mb-2" />
                            <p className="text-gray-400">No flash promotions found. Create your first one!</p>
                      </div>
                        ) : (
                          flashPromos.map((promo) => (
                            <Card key={promo._id} className={`bg-[#0f172a] border ${promo.isActive ? 'border-[#00D6A4]/20' : 'border-[#334155]'}`}>
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h4 className="text-white font-semibold text-lg flex items-center">
                                      {promo.name}
                                      {promo.isActive && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00D6A4]/10 text-[#00D6A4]">
                                          Active
                                  </span>
                                      )}
                                      {!promo.isActive && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">
                                          Inactive
                                  </span>
                                      )}
                                    </h4>
                                    <p className="text-gray-400 text-sm mt-1">
                                      {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                  <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => toggleFlashPromoStatus(promo._id, promo.isActive)}
                                      className={promo.isActive 
                                        ? 'border-[#334155] text-gray-300 hover:bg-red-500/10 hover:text-red-400' 
                                        : 'border-[#334155] text-gray-300 hover:bg-green-500/10 hover:text-green-400'
                                      }
                                    >
                                      {promo.isActive ? (
                                        <>
                                          <AlertCircle className="mr-2 h-4 w-4" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Activate
                                        </>
                                      )}
                                  </Button>
                                  <Button 
                                      variant="ghost"
                                      size="icon"
                                    onClick={() => deleteFlashPromo(promo._id)}
                                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                  >
                                      <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                  <div className="bg-[#1e293b] rounded-lg p-3">
                                    <p className="text-gray-400 text-xs mb-1">Point Multiplier</p>
                                    <p className="text-[#00D6A4] font-semibold">{promo.multiplier}x</p>
                        </div>
                                  <div className="bg-[#1e293b] rounded-lg p-3">
                                    <p className="text-gray-400 text-xs mb-1">Prize</p>
                                    <p className="text-white font-medium truncate">{promo.prize}</p>
                          </div>
                                  <div className="bg-[#1e293b] rounded-lg p-3">
                                    <p className="text-gray-400 text-xs mb-1">Participants</p>
                                    <p className="text-white font-medium">
                                      {promo.currentParticipants} / {promo.maxParticipants}
                                    </p>
                      </div>
                    </div>
                                
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Participation</span>
                                    <span className="text-white">
                                      {Math.round((promo.currentParticipants / promo.maxParticipants) * 100)}%
                      </span>
                    </div>
                                  <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-[#00D6A4] to-[#3b82f6]"
                                      style={{ width: `${calculateProgress(promo.currentParticipants, promo.maxParticipants)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                  </div>
                )}

          {activeTab === "promo-codes" && (
            <div className="space-y-6 animate-fade-in">
              <Card className="bg-[#1e293b] border-[#334155] shadow-md">
                <CardHeader className="border-b border-[#334155] bg-[#1e293b]/70">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Promo Codes</CardTitle>
                      <CardDescription className="text-gray-400">
                        Upload and manage promo codes that users can redeem for points
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      className="border-[#334155] text-gray-300 hover:bg-[#334155]"
                      onClick={openRedemptionsModal}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Redemptions
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upload Section */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-6">
                        <h3 className="text-white font-semibold mb-4">Upload Promo Codes</h3>
                        <div className="border-2 border-dashed border-[#334155] rounded-lg p-6 text-center hover:border-[#00D6A4]/50 transition-colors">
                      <Input
                        id="file-upload"
                        type="file"
                            className="hidden"
                            accept=".xlsx,.xls"
                        onChange={handleFileChange}
                          />
                          <Label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center justify-center"
                          >
                            <Upload className="h-10 w-10 text-[#334155] mb-2" />
                            <span className="text-white font-medium">
                              {selectedFile ? selectedFile.name : "Select Excel File"}
                            </span>
                            <span className="text-gray-400 text-xs mt-1">
                              .xls or .xlsx format only
                            </span>
                          </Label>
                    </div>

                    {selectedFile && (
                          <div className="flex gap-2 mt-4">
                    <Button
                      onClick={handleFileUpload}
                              className="flex-1 bg-[#00D6A4] hover:bg-[#00D6A4]/90 text-[#0f172a]"
                              disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                                  <Upload className="mr-2 h-4 w-4" /> Upload
                        </>
                      )}
                     </Button>
                     <Button 
                       variant="outline" 
                              onClick={handleFileReset}
                              className="border-[#334155] text-gray-300"
                              disabled={isUploading}
                     >
                       Cancel
                     </Button>
                </div>
                        )}
                    </div>

                      <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-6">
                        <h3 className="text-white font-semibold mb-4">Promo Code Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#1e293b] rounded-lg p-3">
                            <p className="text-gray-400 text-xs mb-1">Total Codes</p>
                            <p className="text-white font-bold text-2xl">
                              {getPromoCodeMetrics().total.toLocaleString()}
                            </p>
                    </div>
                          <div className="bg-[#1e293b] rounded-lg p-3">
                            <p className="text-gray-400 text-xs mb-1">Active Codes</p>
                            <p className="text-[#00D6A4] font-bold text-2xl">
                              {getPromoCodeMetrics().active.toLocaleString()}
                            </p>
                  </div>
                    </div>
                        <div className="mt-4 pt-4 border-t border-[#334155]">
                          <p className="text-gray-400 text-xs mb-1">Redeemed Codes</p>
                          <p className="text-amber-400 font-medium">
                            {getPromoCodeMetrics().redeemed.toLocaleString()} 
                         </p>
                       </div>
                     </div>
                   </div>
                   
                    {/* Promo Codes List */}
                    <div className="lg:col-span-2">
                      <div className="bg-[#0f172a] border border-[#334155] rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-[#334155] flex justify-between items-center">
                          <h3 className="text-white font-semibold">Available Promo Codes</h3>
                          <div className="flex gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                              className="h-8 border-[#334155] text-gray-300"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                     >
                              <ChevronLeft className="h-4 w-4" />
                     </Button>
                     <Button
                              variant="outline"
                       size="sm"
                              className="h-8 border-[#334155] text-gray-300"
                            onClick={nextPage}
                              disabled={
                                currentPage ===
                                Math.ceil(availablePromoCodes.length / itemsPerPage)
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                     </Button>
                    </div>
                  </div>
                      <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-[#0f172a] sticky top-0">
                              <TableRow className="border-[#334155]">
                                <TableHead className="text-[#00D6A4] w-32">Promo Code</TableHead>
                                <TableHead className="text-[#00D6A4] text-right">Points</TableHead>
                              </TableRow>
                            </TableHeader>
                          <TableBody>
                              {availablePromoCodes.length === 0 ? (
                                <TableRow className="border-[#334155]">
                                  <TableCell
                                    colSpan={3}
                                    className="h-24 text-center text-gray-400"
                                  >
                                    No available promo codes. Upload some codes to get started.
                                </TableCell>
                              </TableRow>
                              ) : (
                                getCurrentPageItems(
                                  availablePromoCodes,
                                  currentPage,
                                  itemsPerPage
                                ).map((code) => (
                                  <TableRow
                                    key={code._id}
                                    className="border-[#334155] hover:bg-[#1e293b]"
                                  >
                                    <TableCell className="font-medium text-white">
                                      {code.code}
                                    </TableCell>
                    
                                    <TableCell className="text-right">
                                      <span className="text-[#00D6A4] font-medium text-lg">
                                        {code.points}
                                      </span>
                                    </TableCell>
                             
                                  </TableRow>
                                ))
                              )}
                          </TableBody>
                        </Table>
                    </div>
                  </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                    </div>
          )}

          {activeTab === "games" && (
            <div className="space-y-6 animate-fade-in">
              <Card className="bg-[#1e293b] border-[#334155] shadow-md">
                <CardHeader className="border-b border-[#334155] bg-[#1e293b]/70">
                  <CardTitle className="text-white">Featured Games Management</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure and manage featured games in the app
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoadingGames ? (
                    <div className="flex justify-center items-center h-60">
                      <RefreshCw className="h-8 w-8 animate-spin text-[#00D6A4]" />
                            </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {games.map((game) => (
                        <Card key={game._id} className={`bg-[#0f172a] border ${game.featured ? 'border-[#00D6A4]/20' : 'border-[#334155]'}`}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-white font-semibold text-lg flex items-center">
                                  {game.name}
                                  {game.featured && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00D6A4]/10 text-[#00D6A4]">
                                      Featured
                              </span>
                                  )}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">
                                  Type: {game.gameType}
                                </p>
                            </div>
                              <div>
                              {game.featured ? (
                          <Button
                                  variant="outline"
                            size="sm"
                                  onClick={() => unfeatureGame(game._id)}
                                    className="border-[#334155] text-gray-300 hover:bg-red-500/10 hover:text-red-400"
                          >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Remove from Featured
                          </Button>
                              ) : (
                          <Button
                                  variant="outline"
                            size="sm"
                                  onClick={() => handleFeatureGame(game._id)}
                                    className="border-[#334155] text-gray-300 hover:bg-[#00D6A4]/10 hover:text-[#00D6A4]"
                          >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Add to Featured
                          </Button>
                              )}
                        </div>
                            </div>
                            <div className="bg-[#1e293b] rounded-lg p-3 mb-4">
                              <div className="flex justify-between mb-1">
                                <p className="text-gray-400 text-xs">Points Required</p>
                                <p className="text-white font-medium">
                                  {game.points}
                                </p>
                              </div>
                              {game.prizedAssigned && game.prizedAssigned.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-[#334155]">
                                  <p className="text-gray-400 text-xs mb-1">Prizes Assigned</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {game.prizedAssigned.map((prize) => {
                                      const prizeDetails = prizes.find(p => p._id === prize.prizeId);
                                      return (
                                        <span 
                                          key={prize.prizeId}
                                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#00D6A4]/10 text-[#00D6A4]"
                                        >
                                          {prizeDetails?.name || 'Unknown Prize'}
                                          {prize.multiplier && prize.multiplier > 1 && (
                                            <span className="ml-1">({prize.multiplier}x)</span>
                                          )}
                                        </span>
                                      );
                                    })}
                            </div>
                    </div>
                  )}
                            </div>
                            
                            {game.gameType === 'SpinTheWheel' && game.config?.spinConfig && (
                              <div className="bg-[#1e293b] rounded-lg p-3">
                                <p className="text-gray-400 text-xs mb-2">Wheel Configuration</p>
                                <div className="flex flex-wrap gap-2">
                                  {game.config.spinConfig.includeFreeSpin && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400">
                                      Free Spin
                              </span>
                                  )}
                                  {game.config.spinConfig.includeTryAgain && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400">
                                      Try Again
                              </span>
                                  )}
                            </div>
                          </div>
                            )}
                          </CardContent>
                        </Card>
                        ))}
                      </div>
                  )}
              </CardContent>
            </Card>

              {/* Game Configuration Dialog */}
            <GameConfigDialog />
                        </div>
                      )}

          {activeTab === "verification" && (
            <div className="space-y-6 animate-fade-in">
              <Card className="bg-[#1e293b] border-[#334155] shadow-md">
                <CardHeader className="border-b border-[#334155] bg-[#1e293b]/70">
                  <div className="flex justify-between items-center">
                <div>
                      <CardTitle className="text-white">ID Verification</CardTitle>
                      <CardDescription className="text-gray-400">
                        Review and approve government ID submissions from users
                  </CardDescription>
                    </div>
                  <Button 
                         variant="outline" 
                      className="border-[#334155] text-gray-300 hover:bg-[#334155]"
                  onClick={fetchIdSubmissions}
                      disabled={idLoading}
                >
                      <RefreshCw className={`mr-2 h-4 w-4 ${idLoading ? 'animate-spin' : ''}`} />
                  Refresh
                    </Button>
                  </div>
              </CardHeader>
                <CardContent className="p-6">
                {idLoading ? (
                    <div className="flex justify-center items-center h-60">
                      <RefreshCw className="h-8 w-8 animate-spin text-[#00D6A4]" />
                        </div>
                  ) : (
                    idSubmissions.length === 0 ? (
                      <div className="border border-[#334155] rounded-lg p-8 text-center">
                        <Shield className="h-16 w-16 text-[#334155] mx-auto mb-4" />
                        <h3 className="text-white font-medium text-lg mb-2">No Pending Verifications</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                          There are no government ID submissions pending verification at this time.
                        </p>
                      </div>
                ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {idSubmissions.map((submission) => (
                          <Card key={submission.id} className="bg-[#0f172a] border-[#334155] overflow-hidden">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-white font-semibold">{submission.userId.name}</h3>
                                  <p className="text-gray-400 text-sm">{submission.userId.email}</p>
                                  <p className="text-gray-400 text-sm mt-1">Phone: {submission.userId.phoneNumber || "N/A"}</p>
                      </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                                  Pending
                              </span>
                    </div>
                    
                              <div className="flex gap-4 mb-4">
                                <div className="bg-[#1e293b] rounded-lg p-3 flex-1 text-center">
                                  <p className="text-gray-400 text-xs mb-1">User Type</p>
                                  <p className="text-white font-medium">
                                    {submission.userId.userType || "Standard"}
                                  </p>
                      </div>
                                <div className="bg-[#1e293b] rounded-lg p-3 flex-1 text-center">
                                  <p className="text-gray-400 text-xs mb-1">Submitted</p>
                                  <p className="text-white font-medium">
                                    {new Date(submission.uploadedAt).toLocaleDateString()}
                                  </p>
                          </div>
                      </div>
                    
                              <div className="bg-[#1e293b] rounded-lg p-3 mb-4">
                                <p className="text-gray-400 text-xs mb-2">ID Status</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className={`rounded-md px-3 py-2 text-center ${
                                    submission.hasFrontID 
                                      ? 'bg-green-500/10 text-green-400' 
                                      : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    <p className="text-xs">Front ID</p>
                                    <p className="font-medium">
                                      {submission.hasFrontID ? "Uploaded" : "Missing"}
                                    </p>
                      </div>
                                  <div className={`rounded-md px-3 py-2 text-center ${
                                    submission.hasBackID 
                                      ? 'bg-green-500/10 text-green-400' 
                                      : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    <p className="text-xs">Back ID</p>
                                    <p className="font-medium">
                                      {submission.hasBackID ? "Uploaded" : "Missing"}
                                    </p>
                  </div>
                          </div>
            </div>

                                <Button
                                className="w-full bg-[#00D6A4] hover:bg-[#00D6A4]/90 text-[#0f172a]"
                                onClick={() => fetchIdSubmissionDetail(submission.id)}
                          disabled={idLoading}
                        >
                                <Eye className="mr-2 h-4 w-4" />
                                Review Submission
                                </Button>
                            </CardContent>
                          </Card>
                        ))}
                </div>
                    )
                  )}
              </CardContent>
            </Card>
                  </div>
          )}
                </div>
      </div>

      {/* Keep all existing dialogs and modals */}
      {/* Redemptions Dialog */}
      <Dialog open={showRedemptionsModal} onOpenChange={setShowRedemptionsModal}>
        <DialogContent className="bg-[#1e293b] border-[#334155] text-white max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-[#334155] px-6 py-4">
            <div className="flex justify-between items-center">
                <div>
                <DialogTitle className="text-xl text-white">Promo Code Redemptions</DialogTitle>
                <DialogDescription className="text-gray-400">
                  View all promo codes redeemed by consumers at various retailers
                </DialogDescription>
                </div>
                <Button
                  variant="outline"
                size="sm"
                className="border-[#334155] text-gray-300 hover:bg-[#334155]"
                onClick={handleDownloadExcel}
                disabled={isLoadingRedemptions}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Excel
                </Button>
                  </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {isLoadingRedemptions ? (
              <div className="flex justify-center items-center h-60">
                <RefreshCw className="h-8 w-8 animate-spin text-[#00D6A4]" />
              </div>
            ) : retailerRedemptions.length === 0 ? (
              <div className="p-10 text-center">
                <FileX className="h-16 w-16 text-[#334155] mx-auto mb-4" />
                <h3 className="text-white font-medium text-lg mb-2">No Redemptions Found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  No promo codes have been redeemed yet.
                </p>
                  </div>
                ) : (
              <div className="overflow-auto h-[calc(85vh-9rem)]">
                    <Table>
                  <TableHeader className="bg-[#0f172a] sticky top-0">
                    <TableRow className="border-[#334155]">
                      <TableHead className="text-[#00D6A4] w-32">Promo Code</TableHead>
                      <TableHead className="text-[#00D6A4]">Retailer Info</TableHead>
                      <TableHead className="text-[#00D6A4] text-right">Points</TableHead>
                      <TableHead className="text-[#00D6A4] text-right">Redeemed On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                    {getCurrentPageItems(
                      retailerRedemptions, 
                      redemptionsPage, 
                      redemptionsPerPage
                    ).map((redemption, index) => (
                      <TableRow 
                        key={`${redemption.code}-${index}`} 
                        className="border-[#334155] hover:bg-[#0f172a]"
                      >
                        <TableCell className="font-medium text-white">
                          {redemption.code}
                            </TableCell>
                            <TableCell>
                          <div>
                            <p className="text-white font-medium">{redemption.shopName || "Unknown Shop"}</p>
                              </div>
                            </TableCell>
                        <TableCell className="text-right">
                          <span className="text-[#00D6A4] font-medium text-lg">
                            {redemption.points || 0}
                              </span>
                            </TableCell>
                        <TableCell className="text-right text-gray-400">
                          {redemption.redeemedAt ? 
                            new Date(redemption.redeemedAt).toLocaleString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) 
                            : "Unknown"
                          }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                    </div>
                    
          <div className="border-t border-[#334155] bg-[#0f172a] p-4 flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              {retailerRedemptions.length > 0 && (
                <>
                  Showing {Math.min(retailerRedemptions.length, 1 + (redemptionsPage - 1) * redemptionsPerPage)}-
                  {Math.min(
                    redemptionsPage * redemptionsPerPage,
                    retailerRedemptions.length
                  )}{" "}
                  of {retailerRedemptions.length} redemptions
                </>
                              )}
                            </div>
                      <div className="flex gap-2">
                        <Button
                variant="outline"
                size="sm"
                className="h-8 border-[#334155] text-gray-300 hover:bg-[#334155]"
                onClick={prevRedemptionsPage}
                disabled={redemptionsPage === 1 || isLoadingRedemptions}
              >
                <ChevronLeft className="h-4 w-4" />
                        </Button>
              <span className="px-2 py-1 flex items-center text-gray-300">
                Page {redemptionsPage} of {" "}
                {Math.max(
                  1,
                  Math.ceil(retailerRedemptions.length / redemptionsPerPage)
                )}
              </span>
                        <Button
                          variant="outline"
                size="sm"
                className="h-8 border-[#334155] text-gray-300 hover:bg-[#334155]"
                onClick={nextRedemptionsPage}
                disabled={
                  redemptionsPage ===
                  Math.ceil(retailerRedemptions.length / redemptionsPerPage) || 
                  isLoadingRedemptions
                }
              >
                <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* ID Detail Dialog */}
              <Dialog open={showIdDetailDialog} onOpenChange={setShowIdDetailDialog}>
                <DialogContent className="bg-[#1e293b] border-[#334155] text-white max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                  <DialogHeader className="border-b border-[#334155] px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                    <DialogTitle className="text-xl text-white">Government ID Verification</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Review and verify user identity documents
                    </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="flex-1 overflow-auto p-6">
                    {selectedSubmission ? (
                  <div className="space-y-6">
                        {/* User info */}
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                          <div className="flex-1 space-y-4">
                            <div className="bg-[#0f172a] rounded-lg p-4">
                              <h3 className="text-white font-medium mb-3">User Information</h3>
                      <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Name:</span>
                                  <span className="text-white">{selectedSubmission.userId.name}</span>
                      </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Email:</span>
                                  <span className="text-white">{selectedSubmission.userId.email}</span>
                      </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Phone:</span>
                                  <span className="text-white">{selectedSubmission.userId.phoneNumber || "N/A"}</span>
                      </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">User Type:</span>
                                  <span className="text-white">{selectedSubmission.userId.userType}</span>
                      </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Submitted:</span>
                                  <span className="text-white">{new Date(selectedSubmission.uploadedAt).toLocaleString()}</span>
                                </div>
                              </div>
                        </div>
                      </div>
                    </div>
                    
                        {/* ID Images */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-medium">ID Images</h3>
                            
                            {!decryptedImages.front && !decryptedImages.back && (
                          <Button 
                                size="sm"
                                className="bg-[#00D6A4] hover:bg-[#00D6A4]/90 text-[#0f172a]"
                                onClick={decryptAndViewId}
                                disabled={idLoading}
                              >
                                {idLoading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Eye className="mr-2 h-4 w-4" />
                                )}
                                Decrypt Images
                          </Button>
                            )}
                        </div>
                          
                          {decryptedImages.front || decryptedImages.back ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-[#0f172a] rounded-lg p-3 flex flex-col items-center">
                                <h4 className="text-gray-400 text-sm mb-3">Front ID</h4>
                                {decryptedImages.front ? (
                                <img 
                                  src={decryptedImages.front} 
                                    alt="Front ID" 
                                    className="max-w-full h-auto rounded-md border border-[#334155]" 
                                />
                                ) : (
                                  <div className="w-full aspect-[4/3] flex items-center justify-center bg-[#1e293b] rounded-md border border-[#334155]">
                                    <FileX className="h-12 w-12 text-gray-500" />
                                  </div>
                              )}
                            </div>
                              <div className="bg-[#0f172a] rounded-lg p-3 flex flex-col items-center">
                                <h4 className="text-gray-400 text-sm mb-3">Back ID</h4>
                                {decryptedImages.back ? (
                                <img 
                                  src={decryptedImages.back} 
                                    alt="Back ID" 
                                    className="max-w-full h-auto rounded-md border border-[#334155]" 
                                />
                                ) : (
                                  <div className="w-full aspect-[4/3] flex items-center justify-center bg-[#1e293b] rounded-md border border-[#334155]">
                                    <FileX className="h-12 w-12 text-gray-500" />
                                  </div>
                              )}
                            </div>
                          </div>
                          ) : (
                            <div className="bg-[#0f172a] rounded-lg p-8 text-center">
                              <FileX className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                              <p className="text-gray-400">
                                ID images are encrypted for security. Click "Decrypt Images" to view.
                              </p>
                        </div>
                      )}
                    </div>
                    
                        {/* Verification notes */}
                        <div>
                          <label htmlFor="verification-notes" className="block text-sm font-medium text-gray-400 mb-2">
                            Verification Notes (optional)
                          </label>
                          <textarea
                            id="verification-notes"
                            rows={3}
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-md p-3 text-white resize-none focus:ring-[#00D6A4] focus:border-[#00D6A4]"
                            placeholder="Add any notes about this verification..."
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-60">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-[#00D6A4] mx-auto mb-4" />
                          <p className="text-gray-400">Loading submission details...</p>
                        </div>
                      </div>
                    )}
                    </div>
                    
                  <div className="border-t border-[#334155] bg-[#0f172a] p-4 flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      className="border-[#334155] text-gray-300 hover:bg-[#334155]"
                      onClick={() => {
                        setShowIdDetailDialog(false);
                        setDecryptedImages({front: null, back: null});
                      }}
                    >
                      Cancel
                    </Button>
                    
                    <div className="flex space-x-2">
                        <Button
                          variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleVerifyId('Rejected')}
                        disabled={idLoading || !selectedSubmission}
                        >
                        {idLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Reject ID
                        </Button>
                      
                        <Button
                        className="bg-[#00D6A4] hover:bg-[#00D6A4]/90 text-[#0f172a]"
                        onClick={() => handleVerifyId('Approved')}
                        disabled={idLoading || !selectedSubmission || !decryptedImages.front || !decryptedImages.back}
                      >
                        {idLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Approve ID
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            
              {/* Decrypt Password Dialog */}
            <Dialog open={showDecryptDialog} onOpenChange={setShowDecryptDialog}>
                <DialogContent className="bg-[#1e293b] border-[#334155] text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Enter Decryption Password</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      This password is required to decrypt the government ID images.
                  </DialogDescription>
                </DialogHeader>
                
                  <div className="space-y-4 py-2">
                  <div className="space-y-2">
                      <label htmlFor="decrypt-password" className="text-sm font-medium text-gray-400">
                        Decryption Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                          id="decrypt-password"
                      type="password"
                          placeholder="Enter admin password"
                          className="pl-10 bg-[#0f172a] border-[#334155] text-white focus-visible:ring-[#00D6A4] focus-visible:border-[#00D6A4]"
                          disabled={idLoading}
                          // Note: We're using a hardcoded password in decryptAndViewId, so this input is just for UI
                        />
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        Note: For demo purposes, use the admin password.
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter className="mt-2">
                    <Button
                      variant="outline"
                      className="border-[#334155] text-gray-300 hover:bg-[#334155]"
                      onClick={() => setShowDecryptDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#00D6A4] hover:bg-[#00D6A4]/90 text-[#0f172a]"
                      onClick={decryptWithPassword}
                      disabled={idLoading}
                    >
                      {idLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Decrypting...
                        </>
                      ) : (
                        "Decrypt Images"
                      )}
                    </Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
    </div>
  );
};

export default AdminDashboard;