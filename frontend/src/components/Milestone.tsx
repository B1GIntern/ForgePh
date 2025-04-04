import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Target } from "lucide-react";

interface MilestoneProps {
  isVerified: boolean;
}

const Milestones: React.FC<MilestoneProps> = ({ isVerified }) => {
  const milestones = [
    {
      title: "Bronze Status",
      points: 1000,
      icon: <Trophy className="w-12 h-12 text-amber-700" />,
      benefits: ["5% discount on all products", "Early access to promotions"],
      completed: true
    },
    {
      title: "Silver Status",
      points: 5000,
      icon: <Award className="w-12 h-12 text-gray-400" />,
      benefits: ["10% discount on all products", "Priority customer service", "Exclusive merchandise"],
      completed: isVerified
    },
    {
      title: "Gold Status",
      points: 10000,
      icon: <Target className="w-12 h-12 text-yellow-500" />,
      benefits: ["15% discount on all products", "Dedicated account manager", "Exclusive events access"],
      completed: false
    }
  ];

  return (
    <section className="py-12 bg-xforge-dark">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Your Milestone Journey</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {milestones.map((milestone, index) => (
            <Card key={index} className={`overflow-hidden transition-all duration-300 ${milestone.completed ? "border-xforge-teal" : "border-xforge-lightgray border-opacity-20"} bg-xforge-darkgray card-3d`}>
              <CardHeader className={`pb-2 ${milestone.completed ? "bg-xforge-teal bg-opacity-10" : ""}`}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-white">{milestone.title}</CardTitle>
                  <span className="text-lg font-bold text-xforge-teal">{milestone.points} pts</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center mb-4">
                  <div className={`p-4 rounded-full mb-4 ${milestone.completed ? "bg-xforge-teal bg-opacity-20 glow" : "bg-xforge-darkgray"}`}>
                    {milestone.icon}
                  </div>
                  <div className={`w-full h-3 bg-xforge-dark rounded-full mb-4 overflow-hidden`}>
                    <div 
                      className={`h-full bg-xforge-teal ${milestone.completed ? "w-full" : "w-0"} transition-all duration-1000`}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${milestone.completed ? "text-xforge-teal" : "text-xforge-lightgray"}`}>
                    {milestone.completed ? "Achieved" : "In Progress"}
                  </span>
                </div>
                
                <h4 className="text-white text-lg mb-2">Benefits:</h4>
                <ul className="space-y-1">
                  {milestone.benefits.map((benefit, i) => (
                    <li key={i} className="text-xforge-lightgray flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${milestone.completed ? "bg-xforge-teal" : "bg-xforge-lightgray"}`}></span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Milestones;