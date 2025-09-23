import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, adminsApi } from "../lib/supabase";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // All authentication goes through Supabase database
    try {
      const foundAdmin = await authApi.signIn(username, password);

      if (foundAdmin) {
        // Check if user has admin permissions
        const adminData = foundAdmin.admin && foundAdmin.admin.length > 0 ? foundAdmin.admin[0] : null;

        // Only allow login if user is in admin table
        if (!adminData) {
          alert("Access denied! This user does not have admin privileges.");
          return;
        }

        // Check if this is the main admin using role-based system
        // Check admin role from database, fallback to username check for backward compatibility
        const isMainAdmin = (adminData?.role === "main_admin") ||
                           (foundAdmin.username === "admin") ||
                           (foundAdmin.username === "adil");

        // For main admin, ensure they have ALL permissions
        let permissions = [];
        if (isMainAdmin) {
          permissions = [
            "New Projects", "Finance", "Reports", "Project Overview",
            "Stock Management", "Gantt Chart", "Technical Files", "Legal Files",
            "Leads", "Customers", "Materials", "Activities", "Tasks",
            "Contractors", "Vendors", "Units", "Admin Management"
          ];

          // Update admin permissions and role in database if needed
          try {
            const needsUpdate = !Array.isArray(adminData.permissions) ||
                              adminData.permissions.length < 17 ||
                              adminData.role !== "main_admin";

            if (adminData && needsUpdate) {
              await adminsApi.update(adminData.id, {
                permissions,
                role: "main_admin"
              });
            }
          } catch (error) {
            console.error("Error updating admin permissions:", error);
          }
        } else {
          permissions = Array.isArray(adminData.permissions) ? adminData.permissions : [];
        }

        const admin = {
          id: foundAdmin.id,
          name: foundAdmin.full_name || foundAdmin.username,
          username: foundAdmin.username,
          email: foundAdmin.email,
          position: isMainAdmin ? "Main Administrator" : "Admin",
          status: foundAdmin.status,
          isMainAdmin: isMainAdmin,
          permissions: permissions,
          mobile: foundAdmin.mobile
        };

        localStorage.setItem("admin", JSON.stringify(admin));
        localStorage.setItem("userId", foundAdmin.id);
        navigate("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Database authentication error:", error);
    }

    alert("Invalid credentials! Contact system administrator.");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Sticker Panel */}
      <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 justify-center items-center">
        <div className="text-white text-center p-6">
          <div className="text-6xl md:text-9xl mb-4">🏗️</div>
          <h2 className="text-2xl md:text-3xl font-bold">Build with Confidence</h2>
          <p className="mt-2 text-base md:text-lg">
            Professional admin access for MANTRI CONSTRUCTIONS
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-white min-h-screen">
        <div className="max-w-md w-full p-6 sm:p-8 md:p-12">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="bg-blue-600 text-white text-3xl sm:text-4xl font-bold rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-4 shadow-lg">
              MC
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
              MANTRI CONSTRUCTIONS
            </h1>
          
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Name
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </form>

          <p className="text-gray-400 text-sm text-center mt-8">
            &copy; 2025 MANTRI CONSTRUCTIONS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}