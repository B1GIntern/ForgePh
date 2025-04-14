import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react"; // Import Calendar icon from Lucide

const AgeVerification: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const isValidDate = (date: string): boolean => {
    const birthYear = new Date(date).getFullYear();
    return birthYear >= 1920;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    
    // Clear previous error when user changes the date
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleVerification = () => {
    if (!selectedDate) {
      setErrorMessage("Please select your birth date");
      return;
    }

    if (!isValidDate(selectedDate)) {
      setErrorMessage("Please enter a valid date");
      return;
    }

    const age = calculateAge(selectedDate);

    if (age >= 18) {
      localStorage.setItem("ageVerified", "true");
      sessionStorage.setItem("ageVerified", "true");
      navigate("/home");
    } else {
      navigate("/age-restricted");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleVerification();
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 bg-[#292929] -z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,236,207,0.1),transparent_70%)] -z-10"></div>

      <div className="container mx-auto px-6 flex items-center justify-center">
        <div className="flex-1 text-center z-10 max-w-md">
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl text-white">
            <span className="text-xforge-teal">AGE</span> VERIFICATION
          </h1>

          <p className="max-w-md mb-8 text-lg text-xforge-lightgray">
            Please confirm you are 18 years or older to access this website.
          </p>

          {/* Date Input with Custom Calendar Icon */}
          <div className="mb-2 relative">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              onKeyDown={handleKeyDown}
              className="w-full p-4 pr-12 bg-[#1E1E1E] text-white border border-[#02ECCF]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02ECCF] appearance-none"
              max={new Date().toISOString().split("T")[0]}
              min="1920-01-01" // Added min attribute to restrict dates before 1920
            />
            <Calendar
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer transition-colors duration-200 hover:text-[#02ECCF]"
              size={24}
              onClick={() => {
                const input = document.querySelector(
                  "input[type='date']"
                ) as HTMLInputElement;
                if (input) input.showPicker();
              }}
            />
          </div>

          {/* Error message display */}
          {errorMessage && (
            <div className="mb-6 text-red-500 text-sm">{errorMessage}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button
              onClick={handleVerification}
              className="w-full border-2 border-[#D6D6D6] text-[#D6D6D6] bg-[#292929] hover:border-[#02ECCF] hover:text-[#02ECCF] hover:bg-[#292929] text-lg py-4 px-8 rounded-lg transition-colors duration-300"
            >
              Verify Age
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgeVerification;