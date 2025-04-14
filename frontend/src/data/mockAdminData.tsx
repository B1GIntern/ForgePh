// Mock data for the admin dashboard
export const mockRetailers = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Retailer ${i + 1}`,
    points: Math.floor(Math.random() * 10000),
    registrationDate: new Date(
      Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)
    ).toISOString().split('T')[0]
  })).sort((a, b) => b.points - a.points);
  
  export const mockWinners = [
    { id: 1, name: "John Doe", prize: "Gaming Console", date: "2023-09-15" },
    { id: 2, name: "Jane Smith", prize: "$500 Gift Card", date: "2023-09-20" },
    { id: 3, name: "Alex Johnson", prize: "Smart Watch", date: "2023-09-25" },
    { id: 4, name: "Sarah Williams", prize: "Weekend Getaway", date: "2023-10-01" },
    { id: 5, name: "Michael Brown", prize: "Premium Headphones", date: "2023-10-05" },
  ];
  
  export const mockGames = [
    { id: 1, name: "Slot Machine", type: "Luck", description: "Try your luck with our slot machine and win amazing prizes!" },
    { id: 2, name: "Spin Wheel", type: "Luck", description: "Spin the wheel of fortune and see where it lands to claim your reward." },
    { id: 3, name: "Memory Game", type: "Skill", description: "Test your memory skills by matching pairs of cards in this classic game." },
    { id: 4, name: "Quiz Challenge", type: "Knowledge", description: "Answer questions correctly to earn points in this knowledge quiz." },
    { id: 5, name: "Daily Challenge", type: "Mixed", description: "A new challenge every day! Complete tasks to earn bonus points." },
  ];
  
  export const mockRewards = [
    { id: 1, name: "Premium Membership", points: 5000, stock: 10 },
    { id: 2, name: "$50 Gift Card", points: 2500, stock: 25 },
    { id: 3, name: "XForge Merchandise Pack", points: 1000, stock: 50 },
    { id: 4, name: "Free Month Subscription", points: 750, stock: 100 },
  ];
  
  export const mockPromos = [
    { 
      id: 1, 
      name: "Summer Flash Promo", 
      startDate: "2025-06-06", 
      endDate: "2025-06-30", 
      prize: "PHP 200 GCash Voucher", 
      totalWinners: 100, 
      remainingWinners: 100, 
      currentParticipants: 0,
      active: true,
      multiplier: 2
    },
    { 
      id: 2, 
      name: "Back to School Promo", 
      startDate: "2025-08-01", 
      endDate: "2025-08-15", 
      prize: "XForge Premium Pack + PHP 500 GCash", 
      totalWinners: 50, 
      remainingWinners: 40, 
      currentParticipants: 10,
      active: false,
      multiplier: 3
    }
  ];
  
  export const mockExcelPromoCodes = [
    { id: "PROMO001", code: "SUMMER25", value: "25% Off", status: "Active", redeemed: false, redeemedBy: null, redeemedAt: null },
    { id: "PROMO002", code: "WINTER50", value: "50% Off", status: "Active", redeemed: false, redeemedBy: null, redeemedAt: null },
    { id: "PROMO003", code: "FALL15", value: "15% Off", status: "Inactive", redeemed: false, redeemedBy: null, redeemedAt: null },
    { id: "PROMO004", code: "SPRING10", value: "10% Off", status: "Active", redeemed: true, redeemedBy: "User123", redeemedAt: "2025-04-01" },
    { id: "PROMO005", code: "BDAY2023", value: "Free Item", status: "Active", redeemed: true, redeemedBy: "User456", redeemedAt: "2025-03-15" },
  ];
  
  export const dashboardStats = [
    { label: "Total Users", value: "2,845", icon: "Users", color: "text-purple-500" },
    { label: "Active Games", value: "5", icon: "Gamepad", color: "text-blue-500" },
    { label: "Rewards Claimed", value: "1,293", icon: "Gift", color: "text-pink-500" },
    { label: "Winners Today", value: "12", icon: "Award", color: "text-amber-500" },
  ];
  