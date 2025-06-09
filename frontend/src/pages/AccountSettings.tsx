import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";
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
  Badge, 
  Info
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
import { useLocation } from "react-router-dom"; // Add this import for checking navigation state

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
  rewardsclaimed?: {
    rewardsid: string;
    rewardsname: string;
    _id?: string; // Optional MongoDB ID field
  }[];
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
  const location = useLocation(); // Get location to check for redirects

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

  // Add loading state details
  const [loadingState, setLoadingState] = useState("");

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
  
        const response = await fetch(`https://forgeph-2.onrender.com/api/auth/me`, {
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

  // Check if we were redirected from a restricted page
  useEffect(() => {
    // If we have a "from" property in location state, we were redirected
    if (location.state && location.state.from) {
      const { from } = location.state;
      // Set active tab to "verification" section directly instead of security
      setActiveTab("verification");
      
      // Notification commented out to prevent duplicate notifications
      // addNotification({
      //   title: "Verification Required",
      //   message: `You need to verify your account to access ${from.pathname}. Please upload your government ID.`,
      //   type: "system"
      // });
    }
  }, [location, addNotification]);

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

  // Helper function to compress/resize image if it's too large
  const compressImage = async (file: File, maxWidth = 1024): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scaleFactor = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleFactor;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/png',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/png', 0.8); // 0.8 quality
        };
        img.onerror = () => reject(new Error('Image loading failed'));
      };
      reader.onerror = () => reject(new Error('File reading failed'));
    });
  };

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
    
    // Check file size limitations
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    if (frontID.size > MAX_FILE_SIZE || backID.size > MAX_FILE_SIZE) {
      addNotification({
        title: "File Too Large",
        message: "ID images must be under 5MB each. Please compress your images.",
        type: "system"
      });
      return;
    }
    
    const password = "admin123";
    
    try {
      setLoading(true);
      setLoadingState("Checking server connection...");
      
      // First, test the API endpoint with a simple request
      // Try both potential ports since there might be conflicts
      const apiBaseUrl = API_BASE_URL.includes('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      let port5001Working = false;
      
      try {
        console.log("Testing API connection to port 5001");
        const testResponse = await fetch(`http://localhost:5001/api/test`);
        const testData = await testResponse.json();
        console.log("API test response from port 5001:", testData);
        port5001Working = true;
        setLoadingState("Connection verified on port 5001. Starting encryption...");
      } catch (testError5001) {
        console.log("Port 5001 not available, trying port 10000");
        try {
          const testResponse = await fetch(`http://localhost:10000/api/test`);
          const testData = await testResponse.json();
          console.log("API test response from port 10000:", testData);
          setLoadingState("Connection verified on port 10000. Starting encryption...");
        } catch (testError10000) {
          console.error("API test failed on both ports:", testError5001, testError10000);
          throw new Error(`Could not connect to server. Please check your internet connection or try again later.`);
        }
      }
      
      setLoadingState("Preparing files for encryption...");
      console.log("Starting encryption of files with test password");
      
      let frontEncrypted, backEncrypted;
      let useCompression = false;
      
      try {
        // Encrypt one file at a time to reduce memory pressure
        setLoadingState("Encrypting front of ID (1/2)...");
        frontEncrypted = await encryptFile(frontID, password);
        console.log("Front ID encrypted successfully", {
          resultType: typeof frontEncrypted,
          hasEncryptedData: !!frontEncrypted.encryptedData,
          hasIv: !!frontEncrypted.iv,
          encryptedDataLength: frontEncrypted.encryptedData?.length || 0
        });
        
        setLoadingState("Encrypting back of ID (2/2)...");
        backEncrypted = await encryptFile(backID, password);
        console.log("Back ID encrypted successfully", {
          resultType: typeof backEncrypted,
          hasEncryptedData: !!backEncrypted.encryptedData,
          hasIv: !!backEncrypted.iv,
          encryptedDataLength: backEncrypted.encryptedData?.length || 0
        });
      } catch (encryptError) {
        console.error("Standard encryption failed:", encryptError);
        
        // Try compression as fallback
        setLoadingState("Compressing images and retrying...");
        console.log("Trying to compress and re-encrypt...");
        useCompression = true;
        
        try {
          // Compress the images
          const compressedFrontID = await compressImage(frontID);
          const compressedBackID = await compressImage(backID);
          
          console.log("Images compressed", {
            originalFrontSize: frontID.size,
            compressedFrontSize: compressedFrontID.size,
            originalBackSize: backID.size,
            compressedBackSize: compressedBackID.size
          });
          
          // Try encryption again with compressed files
          frontEncrypted = await encryptFile(compressedFrontID, password);
          console.log("Compressed front ID encrypted successfully");
          
          backEncrypted = await encryptFile(compressedBackID, password);
          console.log("Compressed back ID encrypted successfully");
        } catch (compressError) {
          console.error("Compression and re-encryption failed:", compressError);
          throw new Error(`Failed to encrypt files even after compression: ${compressError.message}`);
        }
      }
      
      console.log("Encryption successful");
      const userId = profile.id;
      setLoadingState("Uploading to server...");
      console.log("Uploading encrypted ID to backend", { userId });
      
      // Update the endpoint URL to the correct path using the port that worked during testing
      // Try an alternative endpoint based on the users routes if the first one fails
      const basePort = port5001Working ? 5001 : 10000;
      let uploadUrl = `http://localhost:${basePort}/api/government-id/upload`;
      let uploadResponse = null;
      
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      // Log the structure of the data we're sending
      const requestBody = {
        userId,
        front: {
          encryptedData: frontEncrypted.encryptedData,
          iv: frontEncrypted.iv
        },
        back: {
          encryptedData: backEncrypted.encryptedData,
          iv: backEncrypted.iv
        }
      };
      
      console.log("Sending request body structure:", {
        userId: requestBody.userId,
        frontDataLength: requestBody.front.encryptedData.length,
        frontIvLength: requestBody.front.iv.length,
        backDataLength: requestBody.back.encryptedData.length,
        backIvLength: requestBody.back.iv.length
      });
      
      try {
        console.log("Attempting primary endpoint:", uploadUrl);
        uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });
        
        if (uploadResponse.status === 404) {
          // If 404, try the alternative endpoint
          const alternativeUrl = `http://localhost:${basePort}/api/users/upload-government-id`;
          console.log("Primary endpoint not found, trying alternative:", alternativeUrl);
          
          uploadResponse = await fetch(alternativeUrl, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
          });
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        throw new Error(`Network error: ${fetchError.message}`);
      }
      
      console.log("Response status:", uploadResponse.status);
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload failed with status:", uploadResponse.status, errorText);
        throw new Error(`Server responded with ${uploadResponse.status}: ${errorText}`);
      }
      
      const result = await uploadResponse.json();
      console.log("Backend upload result", result);
      if (result.success) {
        addNotification({
          title: "Success",
          message: "Government ID uploaded and encrypted successfully.",
          type: "system"
        });
        setFrontID(null);
        setBackID(null);
        
        // Update user status in the profile
        setProfile(prev => ({
          ...prev,
          userStatus: "Pending"
        }));
        
        // Update in storage
        const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
        const storedUser = storage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.userStatus = "Pending";
          storage.setItem("user", JSON.stringify(parsedUser));
        }
      } else {
        addNotification({
          title: "Upload Failed",
          message: result.message || "Failed to upload ID.",
          type: "system"
        });
      }
    } catch (err) {
      console.error("Encryption or upload failed", err);
      
      // Provide more specific error messages based on the type of error
      let errorMessage = "ID verification failed. ";
      
      if (err.message && err.message.includes("Server responded with 404")) {
        errorMessage += "The server endpoint for ID verification is not available. Please try again later or contact support.";
      } else if (err.message && err.message.includes("Failed to encrypt")) {
        errorMessage += "There was a problem encrypting your files. Please try again with smaller files.";
      } else if (err.message && err.message.includes("Failed to fetch")) {
        errorMessage += "Could not connect to the server. Please check your internet connection and try again.";
      } else {
        errorMessage += err.message || "See console for details.";
      }
      
      addNotification({
        title: "Error",
        message: errorMessage,
        type: "system"
      });
    } finally {
      setLoading(false);
      setLoadingState("");
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

      const response = await fetch(`https://forgeph-2.onrender.com/api/auth/change-password`, {
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

      const response = await fetch(`https://forgeph-2.onrender.com/api/auth/update`, {
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
      const response = await fetch("https://forgeph-2.onrender.com/api/emailverification/sendVerificationEmail", {
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
                              <span className="text-white font-medium">{profile.rewardsclaimed.length}</span>
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
                    {/* Notification for redirected users */}
                    {location.state?.from && (
                      <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-4 mb-6">
                        <h3 className="text-emerald-400 font-medium flex items-center">
                          <Info className="w-5 h-5 mr-2" />
                          Access Restricted
                        </h3>
                        <p className="text-gray-300 text-sm mt-2">
                          You were redirected from <span className="text-emerald-400 font-medium">{location.state.from.pathname}</span> because this feature requires account verification.
                          Please complete the verification process below to access all features.
                        </p>
                      </div>
                    )}
                    
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
                                  {loading ? loadingState || "Processing..." : "Submit ID for Verification"}
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