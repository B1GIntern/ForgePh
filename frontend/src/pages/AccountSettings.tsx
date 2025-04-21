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
import { User, Lock, Shield, Settings, Eye, EyeOff, LogOut, BadgeCheck } from "lucide-react";
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
  userStatus: string;  // Add userStatus field to track the user's verification status
  birthdate?: string;
  points?: number;
  rewardsclaimed?: number;
  registrationDate?: string;
  shopName?: string;  // Add shopName field for retailers
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
    userStatus: "Not Verified", // Default value
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
          userStatus: parsedUser.userStatus || "Not Verified",  // Include userStatus from parsedUser
          birthdate: parsedUser.birthdate,
          points: parsedUser.points,
          rewardsclaimed: parsedUser.rewardsclaimed,
          registrationDate: parsedUser.registrationDate,
          shopName: parsedUser.shopName || ""  // Add shopName from parsedUser
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
        console.log("Raw user data from server:", userData); // Add this log to debug
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
          userStatus: parsedUser.userStatus || "Not Verified", // Include userStatus from parsedUser
          shopName: user.shopName || parsedUser.shopName || ""  // Add shopName from user or parsedUser
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
    
    // For testing, use a fixed password that matches the admin password
    const password = "admin123"; // Fixed password for testing
    
    try {
      setLoading(true);
      console.log("Starting encryption of files with test password");
      
      // Use our utility function for encryption - pass the File objects directly
      const [frontEncrypted, backEncrypted] = await Promise.all([
        encryptFile(frontID, password),
        encryptFile(backID, password)
      ]);
      
      console.log("Encryption successful", { frontEncrypted, backEncrypted });
      const userId = profile.id;
      console.log("Uploading encrypted ID to backend", { userId });
      // Use the new dedicated government ID API endpoint
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
    // Clear tokens and user data from storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    
    // Show notification
    addNotification({
      title: "Logged Out",
      message: "You have been successfully logged out.",
      type: "system"
    });
    
    // Redirect to login page
    window.location.href = "/home";
  };

  const handleSecurityUpdate = () => {
    setLoading(true);
    
    // Simulate API call
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

    // Basic validation
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

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        const errorData = await response.json(); // Capture any error response from the backend
        throw new Error(errorData.message || "Failed to change password");
      }

      const data = await response.json();
      
      // Reset form
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
  // Handle email verification
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
        body: JSON.stringify({ email: profile.email }),  // Use the profile's email
      });
  
      if (!response.ok) {
        const errorData = await response.json(); // Capture any error response from the backend
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
      <div className="min-h-screen flex flex-col bg-xforge-dark bg-[radial-gradient(circle_at_top_right,rgba(2,236,207,0.05),transparent_70%)]">
        <Header />
        <main className="flex-grow container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-2 bg-xforge-teal bg-opacity-20 rounded-full mb-4">
                <Settings className="h-6 w-6 text-xforge-teal" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-xforge-teal bg-clip-text text-transparent">
                Account Settings
              </h1>
              <p className="text-xforge-gray max-w-2xl mx-auto">
                Manage your profile and security settings to customize your XForge experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Sidebar */}
              <div className="md:col-span-3">
                <Card className="bg-gradient-to-b from-xforge-dark/90 to-xforge-dark border border-xforge-teal/10 shadow-lg sticky top-32">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-xforge-teal/20 to-xforge-teal/10 flex items-center justify-center border border-xforge-teal/30 mb-4">
                        <span className="text-2xl font-bold text-xforge-teal">
                          {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''}
                        </span>
                      </div>
                      <CardTitle className="text-white text-xl flex items-center gap-2">
                        {profile.name}
                        {profile.userStatus === "Verified" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <BadgeCheck className="h-5 w-5 text-xforge-teal" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Verified Account</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xforge-gray">{profile.userType}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="space-y-1">
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start ${activeTab === "profile" ? "bg-xforge-teal/10 text-xforge-teal" : "text-xforge-gray hover:text-white"}`}
                        onClick={() => setActiveTab("profile")}
                      >
                        <User className="mr-2 h-5 w-5" /> Profile
                      </Button>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start ${activeTab === "security" ? "bg-xforge-teal/10 text-xforge-teal" : "text-xforge-gray hover:text-white"}`}
                        onClick={() => setActiveTab("security")}
                      >
                        <Shield className="mr-2 h-5 w-5" /> Security
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-xforge-teal/10 mt-4 flex justify-center">
                    <Button 
                      variant="ghost" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      onClick={() => setIsLogoutDialogOpen(true)}
                    >
                      <LogOut className="mr-2 h-5 w-5" /> Sign Out
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Main Content */}
              <div className="md:col-span-9">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  {/* Profile Tab */}
                  <TabsContent value="profile" className="mt-0">
                    <Card className="bg-gradient-to-b from-xforge-dark/90 to-xforge-dark border border-xforge-teal/10 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-white text-2xl flex items-center">
                          <User className="mr-2 h-6 w-6 text-xforge-teal" /> Profile Information
                        </CardTitle>
                        <CardDescription>
                          View and update your personal information and public profile
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-xforge-gray flex items-center gap-2">
                              Full Name
                              {profile.userStatus === "Verified" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <BadgeCheck className="h-4 w-4 text-xforge-teal" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Verified Account</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </Label>
                            <Input
                              id="name"
                              value={isEditing ? editableProfile.name : profile.name}
                              onChange={(e) => setEditableProfile(prev => ({ ...prev, name: e.target.value }))}
                              disabled={!isEditing}
                              className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-xforge-gray">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profile.email}
                              disabled
                              className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber" className="text-xforge-gray">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              value={isEditing ? editableProfile.phoneNumber : (profile.phoneNumber || "No phone number provided")}
                              onChange={(e) => setEditableProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                              disabled={!isEditing}
                              className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
                              />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="userType" className="text-xforge-gray">User Type</Label>
                            <Input
                              id="userType"
                              value={profile.userType}
                              disabled
                              className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
                            />
                          </div>
                          {profile.userType === "Retailer" && (
                            <div className="space-y-2">
                              <Label htmlFor="shopName" className="text-xforge-gray">Shop Name</Label>
                              <Input
                                id="shopName"
                                value={isEditing ? editableProfile.shopName : (profile.shopName || "No shop name provided")}
                                onChange={(e) => setEditableProfile(prev => ({ ...prev, shopName: e.target.value }))}
                                disabled={!isEditing}
                                className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label htmlFor="province" className="text-xforge-gray">Province</Label>
                            <Input
                              id="province"
                              value={(profile.location?.province) || ""}
                              disabled
                              className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
                              />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-xforge-gray">City</Label>
                            <Input
                              id="city"
                              value={profile.location?.city || ""}
                              disabled
                              className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
                            />
                          </div>
                          {profile.birthdate && (
                            <div className="space-y-2">
                              <Label htmlFor="birthdate" className="text-xforge-gray">Birthdate</Label>
                              <Input
                                id="birthdate"
                                value={new Date(profile.birthdate).toLocaleDateString()}
                                disabled
                                className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
                              />
                            </div>
                          )}
                          {profile.registrationDate && (
                            <div className="space-y-2">
                              <Label htmlFor="registrationDate" className="text-xforge-gray">Member Since</Label>
                              <Input
                                id="registrationDate"
                                value={new Date(profile.registrationDate).toLocaleDateString()}
                                disabled
                                className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
                              />
                            </div>
                          )}
                          {profile.points !== undefined && (
                            <div className="space-y-2">
                              <Label htmlFor="points" className="text-xforge-gray">Points</Label>
                              <Input
                                id="points"
                                value={profile.points}
                                disabled
                                className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-4 pt-6">
                        {!isEditing ? (
                          <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-xforge-teal text-black hover:bg-xforge-teal/90"
                          >
                            Edit Profile
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => {
                                setIsEditing(false);
                                setEditableProfile({
                                  name: profile.name,
                                  phoneNumber: profile.phoneNumber,
                                  shopName: profile.shopName || ""
                                });
                              }}
                              variant="outline"
                              className="border-xforge-teal text-xforge-teal hover:bg-xforge-teal/10"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleUpdateProfile}
                              className="bg-xforge-teal text-black hover:bg-xforge-teal/90"
                              disabled={loading}
                            >
                              {loading ? "Updating..." : "Save Changes"}
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* Security Tab */}
                  <TabsContent value="security" className="mt-0 space-y-6">
                    <Card className="bg-gradient-to-b from-xforge-dark/90 to-xforge-dark border border-xforge-teal/10 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-white text-2xl flex items-center">
                          <Lock className="mr-2 h-6 w-6 text-xforge-teal" /> Password
                        </CardTitle>
                        <CardDescription>
                          Change your password to keep your account secure
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handlePasswordChange}>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword" className="text-xforge-gray">Current Password</Label>
                              <div className="relative">
                                <Input 
                                  id="currentPassword" 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  value={passwordForm.currentPassword}
                                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                  disabled={!isEditing}
                                  className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal pr-10"
                                />
                                <button 
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xforge-gray hover:text-xforge-teal"
                                >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword" className="text-xforge-gray">New Password</Label>
                              <div className="relative">
                                <Input 
                                  id="newPassword" 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  value={passwordForm.newPassword}
                                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                  disabled={!isEditing}
                                  className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal pr-10"
                                />
                                <button 
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xforge-gray hover:text-xforge-teal"
                                >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword" className="text-xforge-gray">Confirm New Password</Label>
                              <div className="relative">
                                <Input 
                                  id="confirmPassword" 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  value={passwordForm.confirmPassword}
                                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                  disabled={!isEditing}
                                  className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal pr-10"
                                />
                                <button 
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xforge-gray hover:text-xforge-teal"
                                >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 flex justify-end">
                            <Button 
                              type="submit" 
                              disabled={loading}
                              className="bg-gradient-to-r from-xforge-teal to-teal-400 text-xforge-dark hover:brightness-110"
                            >
                              {loading ? "Updating..." : "Update Password"}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                      
                    </Card>

                    <Card className="bg-gradient-to-b from-xforge-dark/90 to-xforge-dark border border-xforge-teal/10 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-white text-2xl flex items-center">
                          <Shield className="mr-2 h-6 w-6 text-xforge-teal" /> Security Settings
                        </CardTitle>
                        <CardDescription>
                          Manage your account security preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-white">Two-Factor Authentication</Label>
                              <p className="text-sm text-xforge-gray">Add an extra layer of security to your account</p>
                            </div>
                            <Switch
                              checked={security.twoFactorAuth}
                              onCheckedChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })}
                              className="data-[state=checked]:bg-xforge-teal"
                            />
                          </div>

                          {/* Show this button only if the user is "Not Verified" */}
                          {profile.userStatus === "Not Verified" && (
                            <div className="pt-4 border-t border-xforge-teal/10">
                              <Button
                                onClick={handleVerifyEmail}
                                disabled={loading}
                                className="bg-gradient-to-r from-xforge-teal to-teal-400 text-xforge-dark hover:brightness-110"
                              >
                                {loading ? "Sending Verification..." : "Verify Email"}
                              </Button>
                            </div>
                          )}

                          <div className="pt-4 border-t border-xforge-teal/10">
                            <Button
                              onClick={handleSecurityUpdate}
                              disabled={loading}
                              className="bg-gradient-to-r from-xforge-teal to-teal-400 text-xforge-dark hover:brightness-110"
                            >
                              {loading ? "Saving..." : "Save Security Settings"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ID Upload Section: Only show for non-verified users */}
      {/* ID Upload Section: Only show for non-verified users */}
      {profile.userStatus !== "Verified" && (
        <div className="id-upload-section mt-8 p-4 bg-xforge-darkgray border border-xforge-teal/20 rounded-lg max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-xforge-teal">Upload Government ID</h3>
          <div className="mb-3">
            <label htmlFor="front-id" className="block mb-1 text-xforge-gray">Front of ID (PNG only):</label>
            <input
              type="file"
              id="front-id"
              accept="image/png"
              onChange={(e) => handleFileChange(e, setFrontID)}
              className="block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-xforge-teal/20 file:text-xforge-teal hover:file:bg-xforge-teal/40"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="back-id" className="block mb-1 text-xforge-gray">Back of ID (PNG only):</label>
            <input
              type="file"
              id="back-id"
              accept="image/png"
              onChange={(e) => handleFileChange(e, setBackID)}
              className="block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-xforge-teal/20 file:text-xforge-teal hover:file:bg-xforge-teal/40"
            />
          </div>
          <Button
            onClick={handleIDUpload}
            className="bg-gradient-to-r from-xforge-teal to-teal-400 text-xforge-dark hover:brightness-110 w-full"
            disabled={loading}
          >
            {loading ? "Encrypting & Uploading..." : "Submit"}
          </Button>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent className="bg-xforge-dark border border-xforge-teal/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-xforge-gray">
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-xforge-darkgray text-white border-xforge-gray hover:bg-xforge-darkgray/80 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-xforge-teal text-xforge-dark hover:bg-xforge-teal/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
};

export default AccountSettings;