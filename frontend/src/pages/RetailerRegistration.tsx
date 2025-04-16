import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Store,
  Lock,
  Building2,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import TermsConditions from "@/components/TermsConditions";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    birthdate: z.string().min(1, "Please enter your birthdate"),
    province: z.string().min(2, "Please select a province"),
    city: z.string().min(2, "Please enter a city"),
    shopName: z.string().min(2, "Shop name must be at least 2 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const RetailerRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      birthdate: "",
      province: "",
      city: "",
      shopName: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setSubmitMessage({ text: "", type: "" });

    try {
      const registrationData = {
        name: values.fullName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phone,
        birthdate: values.birthdate,
        location: {
          province: values.province,
          city: values.city,
        },
        userType: "Retailer",
        shopName: values.shopName,
        registrationDate: new Date().toISOString(),
        rank: "Bronze",
        userStatus: "Not Verified"
      };

      const response = await axios.post('http://localhost:5001/api/auth/register', registrationData);
      
      // Store the token and user data
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setSubmitMessage({
        text: "Registration successful! You can now login to FORGE PHILIPPINES",
        type: "success"
      });
      
      // Redirect to home page after 3 seconds
      setTimeout(() => navigate("/home"), 3000);
    } catch (error: any) {
      setSubmitMessage({
        text: error.response?.data?.message || "Registration failed. Please try again.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-xforge-dark">
      <div className="relative py-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497604401993-f2e922e5cb0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-xforge-dark to-xforge-dark/80"></div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-white">
                <span className="text-xforge-teal">Forge</span> PH
                Retailer Registration Page
              </h1>
              <p className="text-xforge-lightgray text-lg">
                Join our network of authorized retailers and grow your business
                with Forge Philippines
              </p>
            </div>

            <Card className="bg-xforge-darkgray/70 border-xforge-teal/20 backdrop-blur">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Please provide your details to begin the registration process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-xforge-teal" />
                                <Input
                                  placeholder="Your Full Name"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="birthdate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Birthdate
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-xforge-teal" />
                                <Input
                                  type="date"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-xforge-teal" />
                                <Input
                                  type="email"
                                  placeholder="your@email.com"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-xforge-teal" />
                                <Input
                                  type="tel"
                                  placeholder="+1 (555) 000-0000"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Province
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-xforge-teal" />
                                <Input
                                  placeholder="Your Province"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">City</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-xforge-teal" />
                                <Input
                                  placeholder="Your City"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="shopName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Shop Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Store className="absolute left-3 top-2.5 h-5 w-5 text-xforge-teal" />
                              <Input
                                placeholder="Your Shop Name"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-xforge-teal" />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="pl-10 pr-10"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-2.5"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-xforge-teal" />
                                  ) : (
                                    <Eye className="h-5 w-5 text-xforge-teal" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-xforge-teal" />
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="pl-10 pr-10"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-2.5"
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5 text-xforge-teal" />
                                  ) : (
                                    <Eye className="h-5 w-5 text-xforge-teal" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-white">
                              I agree to the{" "}
                              <Button
                                variant="link"
                                className="h-auto p-0 text-xforge-teal"
                              >
                                Terms of Service
                              </Button>{" "}
                              and{" "}
                              <Button
                                variant="link"
                                className="h-auto p-0 text-xforge-teal"
                              >
                                Privacy Policy
                              </Button>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {submitMessage.text && (
                      <div className={`p-4 rounded-md mb-4 ${submitMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {submitMessage.text}
                      </div>
                    )}
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/retailers")}
                        className="border-xforge-teal text-xforge-teal hover:bg-xforge-teal/10"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-xforge-teal text-xforge-dark hover:bg-xforge-teal/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          'Register as Retailer'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <TermsConditions />
    </div>
  );
};

export default RetailerRegistration;
