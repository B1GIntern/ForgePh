import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

const TermsConditions: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-12 bg-xforge-dark bg-opacity-60">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <FileText className="text-xforge-teal mr-3 w-8 h-8" />
            <h2 className="text-2xl font-bold text-white">Terms & Conditions</h2>
          </div>
          
          <div className="bg-xforge-darkgray bg-opacity-80 p-6 rounded-lg border border-xforge-teal border-opacity-20">
            <div className={`prose prose-invert max-w-none ${expanded ? "" : "line-clamp-3"}`}>
              <p>Welcome to the XForge Retailers Program. By participating in this program, you agree to the following terms and conditions:</p>
              
              <h3>1. Membership Eligibility</h3>
              <p>To be eligible for the XForge Retailers Program, you must be a verified retailer with a valid business license. Verification status will be determined by XForge at its sole discretion.</p>
              
              <h3>2. Points System</h3>
              <p>Points are earned through product purchases, promotional activities, and participation in XForge events. Points have no cash value and cannot be sold or transferred. XForge reserves the right to modify point values or expire points with reasonable notice.</p>
              
              <h3>3. Milestone Rewards</h3>
              <p>Status levels (Bronze, Silver, Gold) are determined by total points accumulated within a calendar year. Benefits associated with each level are subject to availability and may change without notice. Status levels reset annually on January 1st unless otherwise specified.</p>
              
              <h3>4. Promotional Activities</h3>
              <p>Flash promotions and special events are time-limited and may have additional terms. Participation in these events is subject to verification of retailer status. XForge reserves the right to disqualify any participant suspected of fraudulent activity.</p>
              
              <h3>5. Account Termination</h3>
              <p>XForge reserves the right to terminate any retailer account for violation of these terms, fraudulent activity, or any action deemed harmful to the XForge brand. Upon termination, all accumulated points will be forfeited.</p>
              
              <h3>6. Program Changes</h3>
              <p>XForge may modify or terminate the Retailers Program at any time with reasonable notice. It is the retailer's responsibility to stay informed about program updates through official XForge communications.</p>
              
              <h3>7. Privacy Policy</h3>
              <p>Personal information collected through the Retailers Program is subject to our Privacy Policy available at xforge.com/privacy.</p>
              
              <p className="mt-4">Last updated: April 1, 2025</p>
            </div>
            
            <Button 
              variant="ghost" 
              className="mt-4 text-xforge-teal hover:text-white flex items-center mx-auto"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>Show Less <ChevronUp className="ml-2" /></>
              ) : (
                <>Read More <ChevronDown className="ml-2" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsConditions;
