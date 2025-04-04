// import React, { useState, useEffect } from "react";
// import Header from "../components/Header";
// import Footer from "../components/Footer";
// import { useNotifications } from "@/context/NotificationsContext";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { User, Lock, Bell, CreditCard, LogOut, Shield, Settings, HelpCircle, Smartphone, Mail, Eye, EyeOff } from "lucide-react";

// const AccountSettings: React.FC = () => {
//   const { addNotification } = useNotifications();
//   const [activeTab, setActiveTab] = useState("profile");
//   const [showPassword, setShowPassword] = useState(false);
//   const [formSubmitted, setFormSubmitted] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // User profile state
//   const [profile, setProfile] = useState({
//     firstName: "John",
//     lastName: "Doe",
//     email: "john.doe@example.com",
//     phone: "+1 (555) 123-4567",
//     address: "123 Main St, Anytown, USA",
//     bio: "Vaping enthusiast and XForge community member since 2022."
//   });

//   // Notification settings state
//   const [notifications, setNotifications] = useState({
//     emailNotifications: true,
//     smsNotifications: false,
//     productUpdates: true,
//     securityAlerts: true,
//     promotions: false
//   });

//   // Security settings state
//   const [security, setSecurity] = useState({
//     twoFactorAuth: false,
//     rememberDevice: true,
//     passwordExpiry: "90days"
//   });

//   // Payment methods state
//   const [paymentMethods, setPaymentMethods] = useState([
//     { id: 1, type: "visa", last4: "4242", expiry: "04/25", default: true },
//     { id: 2, type: "mastercard", last4: "5555", expiry: "08/24", default: false }
//   ]);

//   const handleProfileUpdate = (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // Simulate API call
//     setTimeout(() => {
//       setLoading(false);
//       setFormSubmitted(true);
      
//       addNotification({
//         title: "Profile Updated",
//         message: "Your profile information has been successfully updated.",
//         type: "success"
//       });
      
//       setTimeout(() => setFormSubmitted(false), 3000);
//     }, 1500);
//   };

//   const handleNotificationUpdate = () => {
//     setLoading(true);
    
//     // Simulate API call
//     setTimeout(() => {
//       setLoading(false);
      
//       addNotification({
//         title: "Notification Preferences Updated",
//         message: "Your notification settings have been saved.",
//         type: "success"
//       });
//     }, 1000);
//   };

//   const handleSecurityUpdate = () => {
//     setLoading(true);
    
//     // Simulate API call
//     setTimeout(() => {
//       setLoading(false);
      
//       addNotification({
//         title: "Security Settings Updated",
//         message: "Your security preferences have been updated successfully.",
//         type: "success"
//       });
//     }, 1000);
//   };

//   const handlePasswordChange = (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // Simulate API call
//     setTimeout(() => {
//       setLoading(false);
      
//       addNotification({
//         title: "Password Changed",
//         message: "Your password has been updated successfully.",
//         type: "success"
//       });
//     }, 1500);
//   };

//   const handleSetDefaultPayment = (id: number) => {
//     setPaymentMethods(methods => 
//       methods.map(method => ({
//         ...method,
//         default: method.id === id
//       }))
//     );
    
//     addNotification({
//       title: "Default Payment Updated",
//       message: "Your default payment method has been changed.",
//       type: "success"
//     });
//   };

//   const handleDeletePayment = (id: number) => {
//     setPaymentMethods(methods => methods.filter(method => method.id !== id));
    
//     addNotification({
//       title: "Payment Method Removed",
//       message: "The payment method has been removed from your account.",
//       type: "success"
//     });
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-xforge-dark bg-[radial-gradient(circle_at_top_right,rgba(2,236,207,0.05),transparent_70%)]">
//       <Header />
//       <main className="flex-grow container mx-auto px-4 pt-32 pb-16">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-12">
//             <div className="inline-flex items-center justify-center p-2 bg-xforge-teal bg-opacity-20 rounded-full mb-4">
//               <Settings className="h-6 w-6 text-xforge-teal" />
//             </div>
//             <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-xforge-teal bg-clip-text text-transparent">
//               Account Settings
//             </h1>
//             <p className="text-xforge-gray max-w-2xl mx-auto">
//               Manage your profile, security settings, and preferences to customize your XForge experience.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
//             {/* Sidebar */}
//             <div className="md:col-span-3">
//               <Card className="bg-gradient-to-b from-xforge-dark/90 to-xforge-dark border border-xforge-teal/10 shadow-lg sticky top-32">
//                 <CardHeader className="pb-4">
//                   <div className="flex flex-col items-center">
//                     <div className="w-20 h-20 rounded-full bg-gradient-to-br from-xforge-teal/20 to-xforge-teal/10 flex items-center justify-center border border-xforge-teal/30 mb-4">
//                       <span className="text-2xl font-bold text-xforge-teal">JD</span>
//                     </div>
//                     <CardTitle className="text-white text-xl">John Doe</CardTitle>
//                     <CardDescription className="text-xforge-gray">Premium Member</CardDescription>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="px-2">
//                   <div className="space-y-1">
//                     <Button 
//                       variant="ghost" 
//                       className={`w-full justify-start ${activeTab === "profile" ? "bg-xforge-teal/10 text-xforge-teal" : "text-xforge-gray hover:text-white"}`}
//                       onClick={() => setActiveTab("profile")}
//                     >
//                       <User className="mr-2 h-5 w-5" /> Profile
//                     </Button>
//                     <Button 
//                       variant="ghost" 
//                       className={`w-full justify-start ${activeTab === "security" ? "bg-xforge-teal/10 text-xforge-teal" : "text-xforge-gray hover:text-white"}`}
//                       onClick={() => setActiveTab("security")}
//                     >
//                       <Shield className="mr-2 h-5 w-5" /> Security
//                     </Button>
//                     <Button 
//                       variant="ghost" 
//                       className={`w-full justify-start ${activeTab === "notifications" ? "bg-xforge-teal/10 text-xforge-teal" : "text-xforge-gray hover:text-white"}`}
//                       onClick={() => setActiveTab("notifications")}
//                     >
//                       <Bell className="mr-2 h-5 w-5" /> Notifications
//                     </Button>
//                     <Button 
//                       variant="ghost" 
//                       className={`w-full justify-start ${activeTab === "payment" ? "bg-xforge-teal/10 text-xforge-teal" : "text-xforge-gray hover:text-white"}`}
//                       onClick={() => setActiveTab("payment")}
//                     >
//                       <CreditCard className="mr-2 h-5 w-5" /> Payment Methods
//                     </Button>
//                   </div>
//                 </CardContent>
//                 <CardFooter className="border-t border-xforge-teal/10 mt-4 flex justify-center">
//                   <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
//                     <LogOut className="mr-2 h-5 w-5" /> Sign Out
//                   </Button>
//                 </CardFooter>
//               </Card>
//             </div>

//             {/* Main Content */}
//             <div className="md:col-span-9">
//               <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//                 {/* Profile Tab */}
//                 <TabsContent value="profile" className="mt-0">
//                   <Card className="bg-gradient-to-b from-xforge-dark/90 to-xforge-dark border border-xforge-teal/10 shadow-lg">
//                     <CardHeader>
//                       <CardTitle className="text-white text-2xl flex items-center">
//                         <User className="mr-2 h-6 w-6 text-xforge-teal" /> Profile Information
//                       </CardTitle>
//                       <CardDescription>
//                         Update your personal information and public profile
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <form onSubmit={handleProfileUpdate}>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div className="space-y-2">
//                             <Label htmlFor="firstName" className="text-xforge-gray">First Name</Label>
//                             <Input 
//                               id="firstName" 
//                               value={profile.firstName}
//                               onChange={(e) => setProfile({...profile, firstName: e.target.value})}
//                               className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="lastName" className="text-xforge-gray">Last Name</Label>
//                             <Input 
//                               id="lastName" 
//                               value={profile.lastName}
//                               onChange={(e) => setProfile({...profile, lastName: e.target.value})}
//                               className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="email" className="text-xforge-gray">Email Address</Label>
//                             <Input 
//                               id="email" 
//                               type="email"
//                               value={profile.email}
//                               onChange={(e) => setProfile({...profile, email: e.target.value})}
//                               className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="phone" className="text-xforge-gray">Phone Number</Label>
//                             <Input 
//                               id="phone" 
//                               value={profile.phone}
//                               onChange={(e) => setProfile({...profile, phone: e.target.value})}
//                               className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
//                             />
//                           </div>
//                           <div className="space-y-2 md:col-span-2">
//                             <Label htmlFor="address" className="text-xforge-gray">Address</Label>
//                             <Input 
//                               id="address" 
//                               value={profile.address}
//                               onChange={(e) => setProfile({...profile, address: e.target.value})}
//                               className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
//                             />
//                           </div>
//                           <div className="space-y-2 md:col-span-2">
//                             <Label htmlFor="bio" className="text-xforge-gray">Bio</Label>
//                             <textarea 
//                               id="bio" 
//                               rows={4}
//                               value={profile.bio}
//                               onChange={(e) => setProfile({...profile, bio: e.target.value})}
//                               className="w-full p-2 rounded-md bg-xforge-dark/50 border border-xforge-lightgray/30 focus:border-xforge-teal outline-none text-white"
//                             />
//                           </div>
//                         </div>
//                         <div className="mt-6 flex justify-end">
//                           <Button 
//                             type="submit" 
//                             disabled={loading}
//                             className="bg-gradient-to-r from-xforge-teal to-teal-400 text-xforge-dark hover:brightness-110"
//                           >
//                             {loading ? "Saving..." : formSubmitted ? "Saved!" : "Save Changes"}
//                           </Button>
//                         </div>
//                       </form>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Security Tab */}
//                 <TabsContent value="security" className="mt-0 space-y-6">
//                   <Card className="bg-gradient-to-b from-xforge-dark/90 to-xforge-dark border border-xforge-teal/10 shadow-lg">
//                     <CardHeader>
//                       <CardTitle className="text-white text-2xl flex items-center">
//                         <Lock className="mr-2 h-6 w-6 text-xforge-teal" /> Password
//                       </CardTitle>
//                       <CardDescription>
//                         Change your password to keep your account secure
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <form onSubmit={handlePasswordChange}>
//                         <div className="space-y-4">
//                           <div className="space-y-2">
//                             <Label htmlFor="currentPassword" className="text-xforge-gray">Current Password</Label>
//                             <div className="relative">
//                               <Input 
//                                 id="currentPassword" 
//                                 type={showPassword ? "text" : "password"}
//                                 placeholder="••••••••"
//                                 className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal pr-10"
//                               />
//                               <button 
//                                 type="button"
//                                 onClick={() => setShowPassword(!showPassword)}
//                                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xforge-gray hover:text-xforge-teal"
//                               >
//                                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                               </button>
//                             </div>
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="newPassword" className="text-xforge-gray">New Password</Label>
//                             <Input 
//                               id="newPassword" 
//                               type={showPassword ? "text" : "password"}
//                               placeholder="••••••••"
//                               className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="confirmPassword" className="text-xforge-gray">Confirm New Password</Label>
//                             <Input 
//                               id="confirmPassword" 
//                               type={showPassword ? "text" : "password"}
//                               placeholder="••••••••"
//                               className="bg-xforge-dark/50 border-xforge-lightgray/30 focus:border-xforge-teal"
//                             />
//                           </div>
//                         </div>
//                         <div className="mt-6 flex justify-end">
//                           <Button 
//                             type="submit" 
//                             disabled={loading}
//                             className="bg-gradient-to-r from-xforge-teal to-teal-400 text-xforge-dark hover:brightness-110"
//                           >
//                             {loading ? "Updating..." : "Update Password"}
//                           </Button>
//                         </div>
//                       </form>
//                     </CardContent>
//                   </Card>

//                   <Card className="bg-gradient-to-b from-xforge-dark/90 to-xforge-dark border border-xforge-teal/10 shadow-lg">
//                     <CardHeader>
//                       <CardTitle className="text-white text-2xl flex items-center">
//                         <Shield className="mr-2 h-6 w-6 text-xforge-teal" /> Security Settings
//                       </CardTitle>
//                       <CardDescription>
//                         Manage your account security preferences
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-6">
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label className="text-white">Two-Factor Authentication</Label>
//                             <p className="text-sm text-xforge-gray">Add an extra layer of security to your account</p>
//                           </div>
//                           <Switch 
//                             checked={security.twoFactorAuth}
//                             onCheckedChange={(checked) => setSecurity({...security, twoFactorAuth: checked})}
//                             className="data-[state=checked]:bg-xforge-teal"
//                           />
//                         </div>
                        
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label className="text-white">Remember This Device</Label>
//                             <p className="text-sm text-xforge-gray">Stay logged in on this device</p>
//                           </div>
//                           <Switch 
//                             checked={security.rememberDevice}
//                             onCheckedChange={(checked) => setSecurity({...security, rememberDevice: checked})}
//                             className="data-[state=checked]:bg-xforge-teal"
//                           />
//                         </div>
                        
//                         <div className="space-y-2">
//                           <Label className="text-white">Password Expiry</Label>
//                           <p className="text-sm text-xforge-gray mb-2">Choose how often you want to reset your password</p>
//                           <div className="flex flex-wrap gap-3">
//                             <Button 
//                               type="button" 
//                               variant="outline"
//                               className={`border-xforge-teal ${security.passwordExpiry === "30days" ? "bg-xforge-teal text-xforge-dark" : "bg-transparent text-xforge-teal"}`}
//                               onClick={() => setSecurity({...security, passwordExpiry: "30days"})}
//                             >
//                               30 Days
//                             </Button>
//                             <Button 
//                               type="button" 
//                               variant="outline"
//                               className={`border-xforge-teal ${security.passwordExpiry === "60days" ? "bg-xforge-teal text-xforge-dark" : "bg-transparent text-xforge-teal"}`}
//                               onClick={() => setSecurity({...security, passwordExpiry: "60days"})}
//                             >
//                               60 Days
//                             </Button>
//                             <Button 
//                               type="button" 
//                               variant="outline"
//                               className={`border-xforge-teal ${security.passwordExpiry === "90days" ? "bg-xforge-teal text-xforge-dark" : "bg-transparent text-xforge-teal"}`}
//                               onClick={() => setSecurity({...security, passwordExpiry: "90days"})}
//                             >
//                               90 Days
//                             </Button>
//                             <Button 
//                               type="button" 
//                               variant="outline"
//                               className={`border-xforge-teal ${security.passwordExpiry === "never" ? "bg-xforge-teal text-xforge-dark" : "bg-transparent text-xforge-teal"}`}
//                               onClick={() => setSecurity({...security, passwordExpiry: "never"})}
//                             >
//                               Never
//                             </Button>
//                           </div>
//                         </div>
                        
//                         <div className="pt-4 border-t border-xforge-teal/10">
//                           <Button 
//                             onClick={handleSecurityUpdate}
//                             disabled={loading}
//                             className="bg-gradient-to-r from-xforge-teal to-teal-400 text-xforge-dark hover:brightness-110"
//                           >
//                             {loading ? "Saving..." : "Save Security Settings"}
//                           </Button>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Notifications Tab */}
//                 <TabsContent value="notifications" className="mt-0">
//                   <Card className="bg-gradient-to-b from-xforge-dark/90 to-xforge-dark border border-xforge-teal/10 shadow-lg">
//                     <CardHeader>
//                       <CardTitle className="text-white text-2xl flex items-center">
//                         <Bell className="mr-2 h-6 w-6 text-xforge-teal" /> Notification Preferences
//                       </CardTitle>
//                       <CardDescription>
//                         Manage how and when you receive notifications from XForge
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-6">
//                         <div className="space-y-4">
//                           <h3 className="text-lg font-medium text-white">Notification Channels</h3>
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-2">
//                               <Mail className="h-5 w-5 text-xforge-teal" />
//                               <Label className="text-xforge-gray">Email Notifications</Label>
//                             </div>
//                             <Switch 
//                               checked={notifications.emailNotifications}
//                               onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
//                               className="data-[state=checked]:bg-xforge-teal"
//                             />
//                           </div>
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-2">
//                               <Smartphone className="h-5 w-5 text-xforge-teal" />
//                               <Label className="text-xforge-gray">SMS Notifications</Label>
//                             </div>
//                             <Switch 
//                               checked={notifications.smsNotifications}
//                               onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
//                               className="data-[state=checked]:bg-xforge-teal"
//                             />
//                           </div>
//                         </div>
                        
//                         <div className="space-y-4 pt-6 border-t border-xforge-teal/10">
//                           <h3 className="text-lg font-medium text-white">Notification Types</h3>
//                           <div className="space-y-3">
//                             <div className="flex items-start space-x-2">
//                               <Checkbox 
//                                 id="productUpdates" 
//                                 checked={notifications.productUpdates}
//                                 onCheckedChange={(checked) => setNotifications({...notifications, productUpdates: checked as boolean})}
//                                 className="data-[state=checked]:bg-xforge-teal data-[state=checked]:border-xforge-teal mt-1"
//                               />
//                               <div className="space-y-1">
//                                 <Label htmlFor="productUpdates" className="text-white">Product Updates</Label>
//                                 <p className="text-sm text-xforge-gray">Receive notifications about new products and features</p>
//                               </div>
//                             </div>
//                             <div className="flex items-start space-x-2">
//                               <Checkbox 
//                                 id="securityAlerts" 
//                                 checked={notifications.securityAlerts}
//                                 onCheckedChange={(checked) => setNotifications({...notifications, securityAlerts: checked as boolean})}
//                                 className="data-[state=checked]:bg-xforge-teal data-[state=checked]:border-xforge-teal mt-1"
//                               />
//                               <div className="space-y-1">
//                                 <Label htmlFor="securityAlerts" className="text-white">Security Alerts</Label>
//                                 <p className="text-sm text-xforge-gray">Get notified about important security updates and account activity</p>
//                               </div>
//                             </div>
//                             <div className="flex items-start space-x-2">
//                               <Checkbox 
//                                 id="promotions" 
//                                 checked={notifications.promotions}
//                                 onCheckedChange={(checked) => setNotifications({...notifications, promotions: checked as boolean})}
//                                 className="data-[state=checked]:bg-xforge-teal data-[state=checked]:border-xforge-teal mt-1"
//                               />
//                               <div className="space-y-1">
//                                 <Label htmlFor="promotions" className="text-white">Promotions & Offers</Label>
//                                 <p className="text-sm text-xforge-gray">Receive special offers, discounts, and promotional content</p>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div className="pt-4 flex justify-end">
//                           <Button 
//                             onClick={handleNotificationUpdate}
//                             disabled={loading}
//                             className="bg-gradient-to-r from-xforge-teal to-teal-400 text-xforge-dark hover:brightness-110"
//                           >
//                             {loading ? "Saving..." : "Save Preferences"}
//                           </Button>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Payment Methods Tab */}
//                 <TabsContent value="payment" className="mt-0">
//                   <Card className="bg-gradient-to-b from-xforge-dark/90 to-xforge-dark border border-xforge-teal/10 shadow-lg">
//                     <CardHeader>
//                       <CardTitle className="text-white text-2xl flex items-center">
//                         <CreditCard className="mr-2 h-6 w-6 text-xforge-teal" /> Payment Methods
//                       </CardTitle>
//                       <CardDescription>
//                         Manage your payment methods and billing preferences
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-6">
//                         <div className="space-y-4">
//                           {paymentMethods.map((method) => (
//                             <div 
//                               key={method.id} 
//                               className={`p-4 rounded-lg border ${method.default ? 'border-xforge-teal bg-xforge-teal/5' : 'border-xforge-lightgray/20'} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
//                             >
//                               <div className="flex items-center space-x-4">
//                                 <div className="w-12 h-8 bg-gradient-to-br from-xforge-dark to-xforge-darkgray rounded border border-xforge-lightgray/30 flex items-center justify-center">
//                                   {method.type === "visa" && <span className="text-blue-400 font-bold text-sm">VISA</span>}
//                                   {method.type === "mastercard" && <span className="text-red-400 font-bold text-sm">MC</span>}
//                                 </div>
//                                 <div>
//                                   <p className="text-white font-medium">
//                                     {method.type === "visa" ? "Visa" : "Mastercard"} ending in {method.last4}
//                                   </p>
//                                   <p className="text-sm text-xforge-gray">Expires {method.expiry}</p>
//                                 </div>
//                               </div>
//                               <div className="flex items-center space-x-2 sm:space-x-4">
//                                 {method.default ? (
//                                   <span className="text-sm text-xforge-teal bg-xforge-teal/10 px-3 py-1 rounded-full">Default</span>
//                                 ) : (
//                                   <Button 
//                                     variant="outline" 
//                                     size="sm"
//                                     onClick={() => handleSetDefaultPayment(method.id)}
//                                     className="text-xforge-teal border-xforge-teal hover:bg-xforge-teal hover:text-xforge-dark"
//                                   >
//                                     Set as Default
//                                   </Button>
//                                 )}
//                                 <Button 
//                                   variant="ghost" 
//                                   size="sm"
//                                   onClick={() => handleDeletePayment(method.id)}
//                                   className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
//                                   disabled={method.default}
//                                 >
//                                   Remove
//                                 </Button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
                        
//                         <Button 
//                           className="w-full bg-xforge-dark border border-xforge-teal text-xforge-teal hover:bg-xforge-teal hover:text-xforge-dark"
//                         >
//                           <CreditCard className="mr-2 h-5 w-5" /> Add New Payment Method
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default AccountSettings;