import React, { useState } from "react";
import background from "../../assets/interface.jpg";
import SidebarEmploye from "../../components/Employe/EmployeeSidebar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background */}
      <img src={background} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-black bg-opacity-30 z-0"></div>

      <div className="relative z-10 flex h-full">
        <SidebarEmploye isSidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className={`flex-1 relative transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="bg-red-800/90 py-6 flex items-center justify-center shadow-md absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
            <h1 className="text-4xl font-bold text-white">Bienvenue Employé</h1>
          </div>
        </main>
      </div>
    </div>
  );
}