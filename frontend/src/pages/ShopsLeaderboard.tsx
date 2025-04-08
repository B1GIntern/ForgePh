import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Mock data for the shops leaderboard
const generateLeaderboardData = () => {
  return Array.from({ length: 100 }, (_, i) => ({
    position: i + 1,
    shopName: `Shop ${Math.floor(Math.random() * 1000)}`,
    points: Math.floor(Math.random() * 10000) + 5000,
    location: [
    "Manila",
    "Quezon City",
    "Makati",
    "Las Piñas",
    "Taguig",
    "Dasmariñas",
    "Imus",
    "Bacoor",
    "Tagaytay",
    "San Pedro",
    ][Math.floor(Math.random() * 10)],
    isCurrentUserShop: i === 42, // Mock user shop at position 43
  }))
    .sort((a, b) => b.points - a.points)
    .map((shop, index) => ({
      ...shop,
      position: index + 1,
    }));
};

const ShopsLeaderboard: React.FC = () => {
  const [originalLeaderboardData] = useState(generateLeaderboardData);
  const [leaderboardData, setLeaderboardData] = useState(
    originalLeaderboardData
  );
  const [searchTerm, setSearchTerm] = useState("");
  const userShop = originalLeaderboardData.find(
    (shop) => shop.isCurrentUserShop
  );

  // Filter leaderboard data based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setLeaderboardData(originalLeaderboardData);
      return;
    }

    const filteredData = originalLeaderboardData.filter(
      (shop) =>
        shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setLeaderboardData(filteredData);
  }, [searchTerm, originalLeaderboardData]);

  return (
    <div className="bg-xforge-dark min-h-screen text-xforge-gray">
      <Header />

      <main className="container mx-auto px-4 py-28">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">
              <span className="flex items-center gap-3">
                <Trophy className="text-xforge-teal" size={32} />
                Shops Leaderboard
              </span>
            </h1>
          </div>

          {userShop && (
            <Card className="bg-xforge-dark border-xforge-lightgray">
              <CardHeader className="pb-2">
                <CardTitle className="text-xforge-teal">
                  Your Shop Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-white">
                      #{userShop.position}
                    </span>
                    <div>
                      <p className="font-semibold text-white">
                        {userShop.shopName}
                      </p>
                      <p className="text-sm text-xforge-gray">
                        {userShop.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-xforge-teal">
                      {userShop.points.toLocaleString()}
                    </span>
                    <p className="text-sm">Total Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-xforge-dark border-xforge-lightgray">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">
                Top 100 Shops Nationwide
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="mb-4 relative">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-xforge-gray" />
                  <Input
                    placeholder="Search by shop name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-xforge-lightgray bg-opacity-20 border-xforge-lightgray text-white focus:border-xforge-teal focus:ring-xforge-teal"
                  />
                </div>
              </div>

              <div className="rounded-md overflow-hidden">
                <Table>
                  <TableCaption>Updated daily at midnight PST</TableCaption>
                  <TableHeader className="bg-xforge-lightgray bg-opacity-20">
                    <TableRow>
                      <TableHead className="w-20 text-xforge-teal">
                        Rank
                      </TableHead>
                      <TableHead className="text-xforge-teal">
                        Shop Name
                      </TableHead>
                      <TableHead className="text-xforge-teal">
                        Location
                      </TableHead>
                      <TableHead className="text-right text-xforge-teal">
                        Points
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.length > 0 ? (
                      leaderboardData.map((shop) => (
                        <TableRow
                          key={shop.position}
                          className={
                            shop.isCurrentUserShop
                              ? "bg-xforge-teal bg-opacity-10"
                              : ""
                          }
                        >
                          <TableCell className="font-medium">
                            {shop.position <= 3 ? (
                              <div
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-opacity-20 text-lg font-bold"
                                style={{
                                  backgroundColor:
                                    shop.position === 1
                                      ? "rgba(255, 215, 0, 0.2)"
                                      : shop.position === 2
                                        ? "rgba(192, 192, 192, 0.2)"
                                        : "rgba(205, 127, 50, 0.2)",
                                  color:
                                    shop.position === 1
                                      ? "rgb(255, 215, 0)"
                                      : shop.position === 2
                                        ? "rgb(192, 192, 192)"
                                        : "rgb(205, 127, 50)",
                                }}
                              >
                                {shop.position}
                              </div>
                            ) : (
                              shop.position
                            )}
                          </TableCell>
                          <TableCell
                            className={
                              shop.isCurrentUserShop
                                ? "font-bold text-xforge-teal"
                                : ""
                            }
                          >
                            {shop.shopName}
                          </TableCell>
                          <TableCell>{shop.location}</TableCell>
                          <TableCell className="text-right">
                            {shop.points.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No shops found matching "{searchTerm}"
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ShopsLeaderboard;
