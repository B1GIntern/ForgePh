import React from "react";
import { Award } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockWinners } from "@/data/mockAdmindata";

export const WinnersTab: React.FC = () => {
  return (
    <TabsContent value="winners" className="glass-dark p-6 rounded-lg border border-xforge-teal/10 shadow-lg animate-fade-in">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center">
        <Award className="text-amber-400 mr-2" size={24} />
        Prize Winners
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {mockWinners.slice(0, 2).map((winner) => (
          <Card key={winner.id} className="bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
              <Award size={96} />
            </div>
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-amber-400 font-bold text-lg">{winner.name}</p>
                <p className="text-xforge-gray text-sm">{winner.date}</p>
              </div>
              <div className="text-center px-4 py-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
                <p className="text-white">Won</p>
                <p className="text-amber-300 font-bold">{winner.prize}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-xforge-darkgray/30">
            <TableRow>
              <TableHead className="text-xforge-teal font-bold">ID</TableHead>
              <TableHead className="text-xforge-teal font-bold">Winner</TableHead>
              <TableHead className="text-xforge-teal font-bold">Prize</TableHead>
              <TableHead className="text-xforge-teal font-bold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockWinners.map((winner) => (
              <TableRow key={winner.id} className="hover:bg-xforge-teal/5 border-b border-xforge-darkgray/50">
                <TableCell className="font-medium">{winner.id}</TableCell>
                <TableCell>{winner.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                    <Award size={14} className="text-amber-400" />
                    {winner.prize}
                  </span>
                </TableCell>
                <TableCell>{winner.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
};
