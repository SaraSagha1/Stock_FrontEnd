import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaClipboardList, FaBoxOpen, FaPlusCircle, FaSignOutAlt } from "react-icons/fa";
import logo from "../../assets/logo.png";

const SidebarEmploye = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { label: "Faire une demande", icon: <FaPlusCircle />, path: "/employe/faire-demande" },
    { label: "Mes demandes", icon: <FaClipboardList />, path: "/employe/mes-demandes" },
    { label: "Consulter stock", icon: <FaBoxOpen />, path: "/employe/consulter-stock" },
  ];

  return (
    <div
      className={`bg-gray-300 text-black fixed top-0 left-0 h-full transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-20"
      } z-20`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-red-700">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-12 h-12 object-contain mx-auto" />
          {isSidebarOpen && <h1 className="text-xl font-bold">AL OMRANE SOUSS MASSA</h1>}
        </div>

        <button onClick={toggleSidebar} className="text-black focus:outline-none">
          ☰
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-5">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
              location.pathname === item.path
                ? "bg-green-600 text-white" // actif → vert
                : "hover:bg-gray-400" // survol → gris clair
            }`}
          >
            {item.icon}
            <span className={`${!isSidebarOpen && "hidden"}`}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="absolute bottom-0 w-full">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 bg-red-700 text-white hover:bg-red-800 transition-colors"
        >
          <FaSignOutAlt />
          <span className={`${!isSidebarOpen && "hidden"}`}>Déconnexion</span>
        </Link>
      </div>
    </div>
  );
}

export default SidebarEmploye;