import React, { useState } from "react";
import axios from "axios"; // Make sure to install axios: npm install axios
import LoginModal from "./LoginModal"; // Adjust the import path as needed

// Define the interface first
interface RegistrationData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  birthdate: string;
  location: {
    province: string;
    city: string;
  };
  userType: string;
  registrationDate: string; // Added registrationDate
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    birthdate: "",
    location: {
      province: "",
      city: "",
    },
    userType: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: "", type: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    if (name.startsWith("location.")) {
      const locKey = name.split(".")[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locKey]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "Birthdate is required";
    } else {
      const birthdate = new Date(formData.birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthdate.getFullYear();
      const monthDiff = today.getMonth() - birthdate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthdate.getDate())
      ) {
        age--;
      }
      if (age < 18) {
        newErrors.birthdate = "You must be at least 18 years old to register";
      }
    }

    if (!formData.location.province.trim()) {
      newErrors.location = "Province is required";
    }

    if (!formData.location.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.userType) {
      newErrors.userType = "User type is required";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms";
    }

    return newErrors;
  };

  const openLoginModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoginModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    setIsSubmitting(true);
    setSubmitMessage({ text: "", type: "" });
    try {
      const registrationDate = new Date().toLocaleDateString('en-GB'); // Format to DD-MM-YYYY
  
      const submitData: RegistrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        birthdate: formData.birthdate,
        location: formData.location,
        userType: formData.userType,
        registrationDate: registrationDate, // Set the formatted date
      };
  
      // Send data to the backend for account registration
      const response = await axios.post("/api/users/register", submitData); // Ensure the correct API path
  
      // Handle successful registration
      setIsSubmitting(false);
      setSubmitMessage({
        text: "Account created successfully! Welcome to XForge.",
        type: "success",
      });
  
      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        birthdate: "",
        location: { province: "", city: "" },
        userType: "",
        agreeTerms: false,
      });
    } catch (error: any) {
      // Handle registration error
      setIsSubmitting(false);
      setSubmitMessage({
        text:
          error.response?.data?.message ||
          "Error creating account. Please try again.",
        type: "error",
      });
    }
  };
  
  return (
    <section
      id="register"
      className="section bg-gradient-to-b from-xforge-dark to-black relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-xforge-teal blur-[120px] animate-pulse-light"></div>
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold tracking-wider uppercase rounded-full bg-xforge-teal bg-opacity-20 text-xforge-teal">
              Join Forge
            </span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl text-white">
              Create Your <span className="text-xforge-teal">Account</span>
            </h2>
            <p className="max-w-2xl mx-auto text-xforge-lightgray">
              Register for an Forge account to access exclusive benefits, track
              your orders, and receive personalized offers.
            </p>
          </div>

          <div className="p-8 border border-xforge-teal border-opacity-30 rounded-lg bg-black bg-opacity-40 backdrop-blur shadow-[0_0_30px_rgba(2,236,207,0.1)] animate-scale-in">
            {submitMessage.text && submitMessage.type === "success" ? (
              <div className="py-8 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-xforge-teal"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  {submitMessage.text}
                </h3>
                <p className="mb-6 text-xforge-lightgray">
                  You can now log in to your account to explore all the features
                  and benefits.
                </p>
                <a
                  href="#login"
                  className="btn btn-primary"
                  onClick={openLoginModal}
                >
                  Log In
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6 mb-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block mb-2 text-sm font-medium text-xforge-gray"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`input-field ${errors.name ? "border-red-500" : ""}`}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-xforge-gray"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`input-field ${errors.email ? "border-red-500" : ""}`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block mb-2 text-sm font-medium text-xforge-gray"
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      className={`input-field ${errors.phoneNumber ? "border-red-500" : ""}`}
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="birthdate"
                      className="block mb-2 text-sm font-medium text-xforge-gray"
                    >
                      Birthdate
                    </label>
                    <input
                      type="date"
                      id="birthdate"
                      name="birthdate"
                      className={`input-field ${errors.birthdate ? "border-red-500" : ""}`}
                      value={formData.birthdate}
                      onChange={handleChange}
                    />
                    {errors.birthdate && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.birthdate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="userType"
                      className="block mb-2 text-sm font-medium text-xforge-gray"
                    >
                      Type of User
                    </label>
                    <select
                      id="userType"
                      name="userType"
                      className={`input-field ${errors.userType ? "border-red-500" : ""}`}
                      value={formData.userType}
                      onChange={handleChange}
                    >
                      <option value="">Select User Type</option>
                      <option value="Consumer">Consumer</option>
                      <option value="Retailer">Retailer</option>
                    </select>
                    {errors.userType && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.userType}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="location.province"
                      className="block mb-2 text-sm font-medium text-xforge-gray"
                    >
                      Province
                    </label>
                    <input
                      type="text"
                      id="location.province"
                      name="location.province"
                      className={`input-field ${errors.location ? "border-red-500" : ""}`}
                      placeholder="Enter your province"
                      value={formData.location.province}
                      onChange={handleChange}
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.location}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="location.city"
                      className="block mb-2 text-sm font-medium text-xforge-gray"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="location.city"
                      name="location.city"
                      className={`input-field ${errors.city ? "border-red-500" : ""}`}
                      placeholder="Enter your city"
                      value={formData.location.city}
                      onChange={handleChange}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-400">{errors.city}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-xforge-gray"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`input-field ${errors.password ? "border-red-500" : ""}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-2 text-sm font-medium text-xforge-gray"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`input-field ${errors.confirmPassword ? "border-red-500" : ""}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
                <div className="mb-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreeTerms"
                        name="agreeTerms"
                        type="checkbox"
                        className="w-4 h-4 border border-xforge-lightgray rounded bg-xforge-dark focus:ring-xforge-teal"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                      />
                    </div>
                    <label
                      htmlFor="agreeTerms"
                      className="ml-2 text-sm font-medium text-xforge-gray"
                    >
                      I agree to the{" "}
                      <a href="#" className="text-xforge-teal hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-xforge-teal hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  {errors.agreeTerms && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.agreeTerms}
                    </p>
                  )}
                </div>

                {submitMessage.text && submitMessage.type === "error" && (
                  <div className="p-3 mb-4 bg-red-900 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30 rounded-md">
                    {submitMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="mt-6 text-center">
                  <p className="text-xforge-lightgray">
                    Already have an account?{" "}
                    <a
                      href="#login"
                      className="text-xforge-teal hover:underline"
                      onClick={openLoginModal}
                    >
                      Log In
                    </a>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </section>
  );
};

export default Register;
