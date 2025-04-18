// components/auth/AuthLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../common/Header/Header";
import Footer from "../common/Footer/Footer";

export const AuthLayout = () => {
  const location = useLocation();

  // Map paths to titles
  const pageTitles = {
    "/login": "SIGN IN",
    "/register": "SIGN UP",
    "/logout": "Logging Out",
    "/unauthorized": "Access Denied",
  };

  // Get the title based on the current path
  const title = pageTitles[location.pathname] || "Account Access";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              {title}
            </h2>
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
