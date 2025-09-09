import React, { useState } from 'react';
import background from '../../assets/interface.jpg';
import AdminSidebar from '../../components/Admin/AdminSidebar';

const AdminHome = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [currentInterface, setCurrentInterface] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <img
        src={background}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 z-0"></div>

      {/* Content */}
      <div className="relative z-10 flex h-full">
        {/* Sidebar */}
        <AdminSidebar 
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          setCurrentInterface={setCurrentInterface}
          isSidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main content */}
        <main className={`flex-1 flex flex-col relative transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          {/* Bande de bienvenue - Centered vertically and horizontally within main content */}
          <div className="bg-red-800/90 py-6 flex items-center justify-center shadow-md absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-10">
            <h1 className="text-4xl font-bold text-white">Bienvenue Admin</h1>
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 p-5 text-white backdrop-blur-sm overflow-auto">
            {/* Votre contenu principal ici */}
          </div>

          {/* Footer */}
          <p className="text-center text-gray-300 text-sm mt-6">
            © {new Date().getFullYear()} AL OMRANE - Tous droits réservés.
          </p>
        </main>
      </div>
    </div>
  );
};

export default AdminHome;