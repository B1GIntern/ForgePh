import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNotifications } from "@/context/NotificationsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  User, 
  Lock, 
  Shield, 
  Settings, 
  Eye, 
  EyeOff, 
  LogOut, 
  BadgeCheck, 
  LayoutDashboard, 
  Mail, 
  Calendar, 
  Smartphone, 
  Map, 
  Store, 
  Clock, 
  Award, 
  CreditCard, 
  Upload, 
  Badge 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { encryptFile } from "@/utils/cryptoUtils"; // Import the encryptFile function

// Define User interface
interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  userType: string;
  location: {
    province: string;
    city: string;
  };
  userStatus: string;
  birthdate?: string;
  points?: number;
  rewardsclaimed?: number;
  registrationDate?: string;
  shopName?: string;
}

const AccountSettings: React.FC = () => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorNotificationShown, setErrorNotificationShown] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const [profile, setProfile] = useState<User>({
    id: "",
    name: "",
    email: "",
    phoneNumber: "",
    userType: "",
    location: {
      province: "",
      city: "",
    },
    userStatus: "Not Verified",
    shopName: "",
  });

  // Security settings state
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    rememberDevice: true,
    passwordExpiry: "90days"
  });

  // Add state for file uploads
  const [frontID, setFrontID] = useState<File | null>(null);
  const [backID, setBackID] = useState<File | null>(null);

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    console.log("File input changed", e.target.files);
    const file = e.target.files?.[0];
    if (file && file.type === "image/png") {
      console.log("Setting file", file.name, file.size);
      setFile(file);
    } else {
      console.log("Invalid file type", file?.type);
      addNotification({
        title: "Invalid File Type",
        message: "Please upload a PNG file.",
        type: "system"
      });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
  
        if (!storedUser) {
          console.log("No stored user data");
          setLoading(false);
          return;
        }
  
        const parsedUser = JSON.parse(storedUser);
  
        setProfile({
          id: parsedUser.id,
          name: parsedUser.name,
          email: parsedUser.email,
          phoneNumber: parsedUser.phoneNumber || "",
          userType: parsedUser.userType,
          location: parsedUser.location || { province: "", city: "" },
          userStatus: parsedUser.userStatus || "Not Verified",
          birthdate: parsedUser.birthdate,
          points: parsedUser.points,
          rewardsclaimed: parsedUser.rewardsclaimed,
          registrationDate: parsedUser.registrationDate,
          shopName: parsedUser.shopName || ""
        });
  
        const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(parsedUser));
  
        console.log("Updated user data from storage:", parsedUser);
  
        // Get the token from localStorage or sessionStorage
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
        if (!token) {
          throw new Error("No token found");
        }
  
        const response = await fetch(`http://localhost:5001/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
  
        const userData = await response.json();
        console.log("Raw user data from server:", userData);
        const user = userData.user;
  
        const updatedUser: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          userType: user.userType,
          location: user.location || { province: "", city: "" },
          birthdate: user.birthdate,
          points: user.points,
          rewardsclaimed: user.rewardsclaimed,
          registrationDate: user.registrationDate,
          userStatus: parsedUser.userStatus || "Not Verified",
          shopName: user.shopName || parsedUser.shopName || ""
        };
  
        setProfile(updatedUser);
  
        storage.setItem("user", JSON.stringify(updatedUser));
  
        console.log("Updated user data from server:", updatedUser);
      } catch (error) {
        console.error("Error fetching user data:", error);

      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [addNotification, errorNotificationShown]);

  // Helper functions for client-side encryption
  async function getKeyFromPassword(password: string, salt: Uint8Array) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // ID Upload Handler
  const handleIDUpload = async () => {
    console.log("handleIDUpload called", { frontID, backID });
    
    if (!frontID || !backID) {
      addNotification({
        title: "Missing Files",
        message: "Please select both front and back PNG files.",
        type: "system"
      });
      return;
    }
    
    const password = "admin123";
    
    try {
      setLoading(true);
      console.log("Starting encryption of files with test password");
      
      const [frontEncrypted, backEncrypted] = await Promise.all([
        encryptFile(frontID, password),
        encryptFile(backID, password)
      ]);
      
      console.log("Encryption successful", { frontEncrypted, backEncrypted });
      const userId = profile.id;
      console.log("Uploading encrypted ID to backend", { userId });
      
      const response = await fetch("/api/government-id/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          front: frontEncrypted,
          back: backEncrypted
        })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed with status:", response.status, errorText);
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Backend upload result", result);
      if (result.success) {
        addNotification({
          title: "Success",
          message: "Government ID uploaded and encrypted successfully.",
          type: "system"
        });
        setFrontID(null);
        setBackID(null);
      } else {
        addNotification({
          title: "Upload Failed",
          message: result.message || "Failed to upload ID.",
          type: "system"
        });
      }
    } catch (err) {
      console.error("Encryption or upload failed", err);
      addNotification({
        title: "Error",
        message: "Encryption or upload failed. See console for details.",
        type: "system"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    
    addNotification({
      title: "Logged Out",
      message: "You have been successfully logged out.",
      type: "system"
    });
    
    window.location.href = "/home";
  };

  const handleSecurityUpdate = () => {
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      
      addNotification({
        title: "Security Settings Updated",
        message: "Your security preferences have been updated successfully.",
        type: "system"
      });
    }, 1000);
  };

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      addNotification({
        title: "Error",
        message: "All password fields are required.",
        type: "system"
      });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addNotification({
        title: "Error",
        message: "New password and confirmation do not match.",
        type: "system"
      });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(`http://localhost:5001/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      const data = await response.json();
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      addNotification({
        title: "Success",
        message: "Your password has been updated successfully.",
        type: "system"
      });
    } catch (error) {
      console.error("Error changing password:", error);
      addNotification({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to change password",
        type: "system"
      });
    } finally {
      setLoading(false);
    }
  };

  // State for editable fields
  const [editableProfile, setEditableProfile] = useState({
    name: "",
    phoneNumber: "",
    shopName: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  // Initialize editable fields when profile data is loaded
  useEffect(() => {
    setEditableProfile({
      name: profile.name,
      phoneNumber: profile.phoneNumber,
      shopName: profile.shopName || ""
    });
  }, [profile]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(`http://localhost:5001/api/auth/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editableProfile.name,
          phoneNumber: editableProfile.phoneNumber,
          shopName: editableProfile.shopName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      setProfile(prev => ({ ...prev, ...editableProfile }));
      setIsEditing(false);

      // Update storage
      const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
      const storedUser = JSON.parse(storage.getItem("user") || "{}");
      storage.setItem("user", JSON.stringify({ ...storedUser, ...editableProfile }));

      addNotification({
        title: "Profile Updated",
        message: "Your profile has been updated successfully.",
        type: "system"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      addNotification({
        title: "Update Failed",
        message: error.message,
        type: "system"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/emailverification/sendVerificationEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: profile.email }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send verification email");
      }
  
      addNotification({
        title: "Verification Email Sent",
        message: "A verification email has been sent. Please check your inbox.",
        type: "system",
      });
    } catch (error) {
      addNotification({
        title: "Error",
        message: error.message,
        type: "system",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-[#0A0D14] bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_70%),radial-gradient(ellipse_at_bottom_left,rgba(14,165,233,0.15),transparent_70%)]">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 pt-28 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Animated Header */}
            <div className="text-center mb-12 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 blur-3xl"></div>
              </div>
              <h1 className="text-5xl font-extrabold relative z-10">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Account Settings
                </span>
              </h1>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                Personalize your experience and manage your account security
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Sidebar */}
              <div className="lg:col-span-1">
                <div className="backdrop-blur-sm bg-black/20 rounded-2xl border border-white/10 overflow-hidden sticky top-28">
                  {/* User Profile Card */}
                  <div className="p-6 border-b border-white/5">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black text-2xl font-bold">
                          {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''}
                        </div>
                        {profile.userStatus === "Verified" && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-full border-2 border-[#0A0D14]">
                            <BadgeCheck className="h-4 w-4 text-black" />
                          </div>
                        )}
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-white">{profile.name}</h3>
                      <div className="mt-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-emerald-400">
                        {profile.userType}
                      </div>
                      {profile.userStatus !== "Verified" && (
                        <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Verification Pending
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <div className="p-4">
                    <nav className="space-y-1">
                      <button 
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                          activeTab === "profile" 
                            ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                        onClick={() => setActiveTab("profile")}
                      >
                        <User className={`w-5 h-5 mr-3 ${activeTab === "profile" ? "text-emerald-400" : ""}`} />
                        Profile
                      </button>
                      <button 
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                          activeTab === "security" 
                            ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                        onClick={() => setActiveTab("security")}
                      >
                        <Shield className={`w-5 h-5 mr-3 ${activeTab === "security" ? "text-emerald-400" : ""}`} />
                        Security
                      </button>
                      <button 
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                          activeTab === "verification" 
                            ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                        onClick={() => setActiveTab("verification")}
                      >
                        <BadgeCheck className={`w-5 h-5 mr-3 ${activeTab === "verification" ? "text-emerald-400" : ""}`} />
                        Verification
                      </button>
                    </nav>
                  </div>
                  
                  {/* Quick Stats */}
                  {profile.points !== undefined && (
                    <div className="p-6 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-gray-500 text-xs mb-1">Points</p>
                          <div className="flex items-center">
                            <Award className="w-4 h-4 text-emerald-400 mr-2" />
                            <span className="text-white font-medium">{profile.points}</span>
                          </div>
                        </div>
                        {profile.rewardsclaimed !== undefined && (
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">Rewards</p>
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 text-cyan-400 mr-2" />
                              <span className="text-white font-medium">{profile.rewardsclaimed}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Logout */}
                  <div className="p-6 border-t border-white/5">
                    <button 
                      className="w-full py-2.5 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                      onClick={() => setIsLogoutDialogOpen(true)}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Right Content Area */}
              <div className="lg:col-span-3">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="backdrop-blur-sm bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
                      <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-semibold text-white flex items-center">
                            <LayoutDashboard className="w-5 h-5 mr-2 text-emerald-400" />
                            Basic Information
                          </h2>
                          <p className="text-gray-400 text-sm mt-1">Manage your personal details</p>
                        </div>
                        {!isEditing ? (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm"
                          >
                            Edit Profile
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                setEditableProfile({
                                  name: profile.name,
                                  phoneNumber: profile.phoneNumber,
                                  shopName: profile.shopName || ""
                                });
                              }}
                              className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleUpdateProfile}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-medium hover:opacity-90 transition-opacity text-sm"
                              disabled={loading}
                            >
                              {loading ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Form Fields */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Full Name</label>
                            <div className="relative">
                              <div className="absolute left-3.5 top-3.5">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                              <input
                                type="text"
                                value={isEditing ? editableProfile.name : profile.name}
                                onChange={(e) => setEditableProfile(prev => ({ ...prev, name: e.target.value }))}
                                disabled={!isEditing}
                                className={`w-full bg-black/30 border ${isEditing ? 'border-emerald-500/30' : 'border-white/10'} rounded-lg py-3 px-11 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isEditing ? 'opacity-100' : 'opacity-80'}`}
                              />
                              {profile.userStatus === "Verified" && (
                                <div className="absolute right-3.5 top-3.5">
                                  <BadgeCheck className="h-5 w-5 text-emerald-400" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Email Address</label>
                            <div className="relative">
                              <div className="absolute left-3.5 top-3.5">
                                <Mail className="h-5 w-5 text-gray-500" />
                              </div>
                              <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full bg-black/30 border border-white/10 rounded-lg py-3 px-11 text-white opacity-80"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Phone Number</label>
                            <div className="relative">
                              <div className="absolute left-3.5 top-3.5">
                                <Smartphone className="h-5 w-5 text-gray-500" />
                              </div>
                              <input
                                type="text"
                                value={isEditing ? editableProfile.phoneNumber : (profile.phoneNumber || "No phone number provided")}
                                onChange={(e) => setEditableProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                disabled={!isEditing}
                                className={`w-full bg-black/30 border ${isEditing ? 'border-emerald-500/30' : 'border-white/10'} rounded-lg py-3 px-11 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isEditing ? 'opacity-100' : 'opacity-80'}`}
                              />
                            </div>
                          </div>
                          
                          {profile.birthdate && (
                            <div>
                              <label className="block text-gray-400 text-sm mb-1.5">Birth Date</label>
                              <div className="relative">
                                <div className="absolute left-3.5 top-3.5">
                                  <Calendar className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                  type="text"
                                  value={new Date(profile.birthdate).toLocaleDateString()}
                                  disabled
                                  className="w-full bg-black/30 border border-white/10 rounded-lg py-3 px-11 text-white opacity-80"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {profile.userType === "Retailer" && (
                            <div>
                              <label className="block text-gray-400 text-sm mb-1.5">Shop Name</label>
                              <div className="relative">
                                <div className="absolute left-3.5 top-3.5">
                                  <Store className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                  type="text"
                                  value={isEditing ? editableProfile.shopName : (profile.shopName || "No shop name provided")}
                                  onChange={(e) => setEditableProfile(prev => ({ ...prev, shopName: e.target.value }))}
                                  disabled={!isEditing}
                                  className={`w-full bg-black/30 border ${isEditing ? 'border-emerald-500/30' : 'border-white/10'} rounded-lg py-3 px-11 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isEditing ? 'opacity-100' : 'opacity-80'}`}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Location</label>
                            <div className="relative">
                              <div className="absolute left-3.5 top-3.5">
                                <Map className="h-5 w-5 text-gray-500" />
                              </div>
                              <input
                                type="text"
                                value={`${profile.location?.province || ""}, ${profile.location?.city || ""}`}
                                disabled
                                className="w-full bg-black/30 border border-white/10 rounded-lg py-3 px-11 text-white opacity-80"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Account Type</label>
                            <div className="relative">
                              <div className="absolute left-3.5 top-3.5">
                                <LayoutDashboard className="h-5 w-5 text-gray-500" />
                              </div>
                              <input
                                type="text"
                                value={profile.userType}
                                disabled
                                className="w-full bg-black/30 border border-white/10 rounded-lg py-3 px-11 text-white opacity-80"
                              />
                            </div>
                          </div>
                          
                          {profile.registrationDate && (
                            <div>
                              <label className="block text-gray-400 text-sm mb-1.5">Member Since</label>
                              <div className="relative">
                                <div className="absolute left-3.5 top-3.5">
                                  <Clock className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                  type="text"
                                  value={new Date(profile.registrationDate).toLocaleDateString()}
                                  disabled
                                  className="w-full bg-black/30 border border-white/10 rounded-lg py-3 px-11 text-white opacity-80"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    {/* Password Change Card */}
                    <div className="backdrop-blur-sm bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
                      <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-semibold text-white flex items-center">
                          <Lock className="w-5 h-5 mr-2 text-emerald-400" />
                          Change Password
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Update your password to maintain security</p>
                      </div>
                      
                      <div className="p-6">
                        <form onSubmit={handlePasswordChange} className="space-y-5">
                          <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Current Password</label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-gray-400 text-sm mb-1.5">New Password</label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Confirm New Password</label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Password must be at least 8 characters long</p>
                          </div>
                          
                          <div className="pt-3">
                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-medium hover:opacity-90 transition-opacity"
                            >
                              {loading ? "Updating Password..." : "Update Password"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                    
                    {/* Security Settings Card */}
                    <div className="backdrop-blur-sm bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
                      <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-semibold text-white flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-emerald-400" />
                          Security Settings
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Manage additional security options</p>
                      </div>
                      
                      <div className="p-6 space-y-5">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                            <p className="text-gray-400 text-sm mt-0.5">Add an extra layer of security</p>
                          </div>
                          <Switch
                            checked={security.twoFactorAuth}
                            onCheckedChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <h3 className="text-white font-medium">Remember Devices</h3>
                            <p className="text-gray-400 text-sm mt-0.5">Stay logged in on your trusted devices</p>
                          </div>
                          <Switch
                            checked={security.rememberDevice}
                            onCheckedChange={(checked) => setSecurity({ ...security, rememberDevice: checked })}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </div>
                        
                        {profile.userStatus === "Not Verified" && (
                          <div className="mt-4 p-5 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg border border-amber-600/30">
                            <div className="flex items-start">
                              <Mail className="w-5 h-5 text-amber-400 mt-1 mr-3" />
                              <div>
                                <h3 className="text-white font-medium">Verify Your Email</h3>
                                <p className="text-gray-300 text-sm mt-1 mb-3">Verifying your email enhances account security and enables additional features</p>
                                <button
                                  onClick={handleVerifyEmail}
                                  disabled={loading}
                                  className="py-2 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                  {loading ? "Sending..." : "Send Verification Email"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-3">
                          <button
                            onClick={handleSecurityUpdate}
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-medium hover:opacity-90 transition-opacity"
                          >
                            {loading ? "Saving..." : "Save Security Settings"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Verification Tab */}
                {activeTab === "verification" && (
                  <div className="space-y-6">
                    <div className="backdrop-blur-sm bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
                      <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-semibold text-white flex items-center">
                          <BadgeCheck className="w-5 h-5 mr-2 text-emerald-400" />
                          Account Verification
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Verify your identity to unlock full platform features</p>
                      </div>
                      
                      <div className="p-6">
                        {profile.userStatus === "Verified" ? (
                          <div className="p-6 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-center">
                            <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                              <BadgeCheck className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Your Account is Verified</h3>
                            <p className="text-gray-300">Your identity has been confirmed. You have full access to all platform features.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="p-5 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg border border-amber-600/30 mb-6">
                              <h3 className="text-white font-medium flex items-center">
                                <BadgeCheck className="w-5 h-5 text-amber-400 mr-2" />
                                Verification Required
                              </h3>
                              <p className="text-gray-300 text-sm mt-2">
                                To access all features and ensure platform security, please verify your identity by uploading a valid government ID.
                              </p>
                            </div>
                            
                            <div className="space-y-5">
                              <div>
                                <label className="block text-gray-400 text-sm mb-2">Front of Government ID (PNG only)</label>
                                <div className="relative">
                                  <div className="bg-black/30 border border-dashed border-white/20 rounded-lg p-4 flex flex-col items-center justify-center">
                                    {frontID ? (
                                      <div className="flex items-center space-x-2 text-emerald-400">
                                        <Badge className="w-5 h-5" />
                                        <span>{frontID.name}</span>
                                      </div>
                                    ) : (
                                      <>
                                        <Upload className="w-6 h-6 text-gray-500 mb-2" />
                                        <p className="text-gray-400 text-sm">Click to select or drag and drop</p>
                                      </>
                                    )}
                                    <input
                                      type="file"
                                      id="front-id"
                                      accept="image/png"
                                      onChange={(e) => handleFileChange(e, setFrontID)}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-gray-400 text-sm mb-2">Back of Government ID (PNG only)</label>
                                <div className="relative">
                                  <div className="bg-black/30 border border-dashed border-white/20 rounded-lg p-4 flex flex-col items-center justify-center">
                                    {backID ? (
                                      <div className="flex items-center space-x-2 text-emerald-400">
                                        <Badge className="w-5 h-5" />
                                        <span>{backID.name}</span>
                                      </div>
                                    ) : (
                                      <>
                                        <Upload className="w-6 h-6 text-gray-500 mb-2" />
                                        <p className="text-gray-400 text-sm">Click to select or drag and drop</p>
                                      </>
                                    )}
                                    <input
                                      type="file"
                                      id="back-id"
                                      accept="image/png"
                                      onChange={(e) => handleFileChange(e, setBackID)}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="pt-2">
                                <button
                                  onClick={handleIDUpload}
                                  disabled={loading || !frontID || !backID}
                                  className={`w-full py-3 px-4 rounded-lg ${
                                    !frontID || !backID
                                      ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                                      : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-medium hover:opacity-90"
                                  } transition-all`}
                                >
                                  {loading ? "Encrypting & Uploading..." : "Submit ID for Verification"}
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">Your ID will be encrypted and securely stored</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent className="bg-[#121520] border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out of Your Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:opacity-90"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AccountSettings;