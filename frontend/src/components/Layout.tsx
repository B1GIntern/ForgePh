import React from "react";
import Header from "@/components/Header"; // ✅ Import your navbar
import Footer from "@/components/Footer"; // ✅ Import footer (optional)

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header /> {/* ✅ Navbar appears on every page */}
      <main className="pt-20">{children}</main> {/* ✅ Prevents navbar overlap */}
      <Footer /> {/* Optional Footer */}
    </>
  );
};

export default Layout;
