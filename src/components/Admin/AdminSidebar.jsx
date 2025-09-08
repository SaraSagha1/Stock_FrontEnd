// components/Admin/AdminSidebar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaUsersCog, 
  FaProjectDiagram, 
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
  FaBars,
  FaHome,
  FaTimes
} from 'react-icons/fa';
import logo from '../../assets/logo.png';

const AdminSidebar = ({ activeMenu, setActiveMenu, isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showOrganigramme, setShowOrganigramme] = useState(false);

  const toggleOrganigramme = () => {
    setShowOrganigramme(!showOrganigramme);
    setActiveMenu(activeMenu === 'organigramme' ? null : 'organigramme');
  };

  const menuItems = [
    {
      id: 'home',
      icon: <FaHome />,
      label: 'Home',
      action: () => {
        setActiveMenu('home');
        navigate('/admin/Home');
      }
    },

    {
      id: 'enregistrement',
      icon: <FaUserPlus />,
      label: 'Enregistrement',
      action: () => {
        setActiveMenu('enregistrement');
        navigate('/admin/createAcc');
      }
    },
    {
      id: 'organigramme',
      icon: <FaProjectDiagram />,
      label: 'Organigramme',
      subItems: [
        { label: 'Direction', path: '/organigramme/direction' },
        { label: 'Division', path: '/organigramme/division' },
        { label: 'Département', path: '/organigramme/departement' }
      ],
      action: toggleOrganigramme
    },
    {
      id: 'utilisateurs',
      icon: <FaUsersCog />,
      label: 'Gestion Utilisateurs',
         action: () => {
        setActiveMenu('utilisateurs');
        navigate('/admin/users');
      }
    }
  ];

  return (
      <div 
      className={`bg-gray-800 text-white h-full fixed transition-all duration-300 ease-in-out z-20
        ${isSidebarOpen ? 'w-64' : 'w-30'}`}
    >
      <div className="h-full flex flex-col">
        {/* Logo et bouton toggle */}
         <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-2">
              <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
              <span className="text-xl text-green-500 font-bold">AL OMRANE SOUSS MASSA</span>
            </div>
          ) : (
            <img src={logo} alt="Logo" className="w-12 h-12 object-contain mx-auto" />
          )}
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-green-600 hover:bg-green-200 focus:outline-none"
          >
            {isSidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={item.action}
                className={`flex items-center justify-between w-full p-3 rounded hover:bg-green-400 transition ${
                  activeMenu === item.id ? 'bg-green-500 font-semibold' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  {item.icon}
                  {isSidebarOpen && <span>{item.label}</span>}
                </div>
                {item.subItems && isSidebarOpen && (
                  showOrganigramme ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />
                )}
              </button>

              {/* Sous-menu Organigramme */}
              {item.id === 'organigramme' && showOrganigramme && isSidebarOpen && (
                <div className="ml-8 mt-1 mb-2 space-y-1">
                  {item.subItems.map((subItem, index) => (
                    <a
                      key={index}
                      href={subItem.path}
                      className="block py-2 px-3 rounded hover:bg-green-400 text-sm transition"
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="mb-4 px-4">
          <button className="flex items-center justify-center space-x-2 p-3 w-full rounded bg-red-600 hover:bg-red-700 transition text-white">
            <FaSignOutAlt />
            {isSidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;