import React, { useState, useRef } from "react";
import { Upload, Download, FileUp, FileDown, File, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockExcelPromoCodes } from "@/data/mockAdmindata";

interface PromoExcelTabProps {
  onPreviewClick: () => void;
}

export const PromoExcelTab: React.FC<PromoExcelTabProps> = ({ onPreviewClick }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [promoCodes, setPromoCodes] = useState(mockExcelPromoCodes);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setIsUploading(true);
      
      setTimeout(() => {
        setIsUploading(false);
        toast({
          title: "File Uploaded",
          description: `${file.name} has been successfully processed.`,
        });
        
        // In a real implementation, you would parse the Excel file here
        // and update the promoCodes state with the parsed data
      }, 1500);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const downloadExcelFile = () => {
    // In a real implementation, this would generate an Excel file
    // For now, we'll simulate the download with a toast notification
    toast({
      title: "File Downloaded",
      description: "Promo_Codes_Updated.xlsx has been downloaded.",
    });
  };

  return (
    <TabsContent value="promo-excel" className="space-y-6 animate-fade-in">
      <Card className="glass-dark border border-xforge-teal/10 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xl flex items-center">
            <File className="text-green-500 mr-2" size={24} />
            Excel Promo Code Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-xforge-darkgray/30 p-4 rounded-lg border border-xforge-teal/10">
                <h3 className="text-white font-medium mb-2 flex items-center">
                  <FileUp size={18} className="text-xforge-teal mr-2" />
                  Upload Promo Codes Excel
                </h3>
                <p className="text-xforge-gray text-sm mb-4">
                  Upload an Excel file (.xlsx) containing promo codes to add to the system. 
                  The file should include columns for code, value, and status.
                </p>
                <div className="flex flex-col space-y-3">
                  <div 
                    className="border-2 border-dashed border-xforge-teal/30 rounded-lg p-8 text-center cursor-pointer hover:bg-xforge-teal/5 transition-colors"
                    onClick={triggerFileUpload}
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".xlsx, .xls" 
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    <Upload size={36} className="mx-auto text-xforge-teal mb-2" />
                    <p className="text-xforge-gray">Drag & drop or click to browse</p>
                    <p className="text-xforge-gray text-xs mt-1">Supported formats: .xlsx, .xls</p>
                  </div>
                  
                  {uploadedFileName && (
                    <div className="flex items-center justify-between p-3 bg-xforge-teal/10 rounded-lg border border-xforge-teal/20">
                      <div className="flex items-center">
                        <File size={18} className="text-green-500 mr-2" />
                        <span className="text-xforge-gray">{uploadedFileName}</span>
                      </div>
                      {isUploading ? (
                        <RefreshCw size={16} className="animate-spin text-xforge-teal" />
                      ) : (
                        <Check size={16} className="text-green-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-xforge-darkgray/30 p-4 rounded-lg border border-xforge-teal/10">
                <h3 className="text-white font-medium mb-2 flex items-center">
                  <FileDown size={18} className="text-xforge-teal mr-2" />
                  Download Promo Codes Report
                </h3>
                <p className="text-xforge-gray text-sm mb-4">
                  Download an Excel file with all promo codes and their current status, 
                  including redemption information.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={downloadExcelFile}
                    className="w-full bg-gradient-to-r from-xforge-teal to-cyan-500 text-xforge-dark hover:brightness-110 shadow-glow"
                  >
                    <Download size={16} className="mr-2" />
                    Download All Promo Codes
                  </Button>
                  <Button 
                    onClick={onPreviewClick}
                    variant="outline" 
                    className="w-full text-xforge-teal border-xforge-teal hover:bg-xforge-teal hover:text-xforge-dark"
                  >
                    <File size={16} className="mr-2" />
                    Preview Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-dark border border-xforge-teal/10 shadow-lg overflow-hidden">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-white text-xl">Promo Codes Overview</CardTitle>
          <div className="bg-xforge-darkgray/60 px-3 py-1 rounded-full flex items-center text-xforge-gray text-sm">
            <File size={14} className="mr-2 text-green-500" />
            {promoCodes.length} Total Codes
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-xforge-darkgray/30">
                <TableRow>
                  <TableHead className="text-xforge-teal font-bold">ID</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Code</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Value</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Status</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Redeemed</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Redeemed By</TableHead>
                  <TableHead className="text-xforge-teal font-bold">Redeemed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((code) => (
                  <TableRow key={code.id} className="hover:bg-xforge-teal/5 border-b border-xforge-darkgray/50">
                    <TableCell className="font-medium">{code.id}</TableCell>
                    <TableCell>
                      <span className="font-mono bg-xforge-dark/50 px-2 py-1 rounded-md text-xforge-teal">
                        {code.code}
                      </span>
                    </TableCell>
                    <TableCell>{code.value}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        code.status === "Active"
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-xforge-darkgray/30 text-xforge-gray border border-xforge-gray/20'
                      }`}>
                        {code.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {code.redeemed ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <span className="text-xforge-gray">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {code.redeemedBy || <span className="text-xforge-gray">—</span>}
                    </TableCell>
                    <TableCell>
                      {code.redeemedAt || <span className="text-xforge-gray">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
