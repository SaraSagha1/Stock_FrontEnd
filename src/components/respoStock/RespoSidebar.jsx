import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
  FaBars,
  FaHome,
  FaTimes,
  FaBoxes,
  FaLayerGroup,
  FaBox,
  FaWarehouse,
  FaTruck,
  FaClipboardList,
  FaBell,
  FaPercent,
  FaSignInAlt,
  FaSignOutAlt as FaExit
} from 'react-icons/fa';
import logo from '../../assets/logo.png';

const RespoSidebar = ({ activeMenu, setActiveMenu, isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [openSubmenus, setOpenSubmenus] = useState({
    products: false,
    stock: false
  });

  const toggleSubmenu = (menu) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: <FaHome className="w-5 h-5" />,
      label: 'Dashboard',
      action: () => {
        setActiveMenu('dashboard');
        navigate('/stock-manager/dashboard');
      }
    },
    {
      id: 'products',
      icon: <FaBoxes className="w-5 h-5" />,
      label: 'Gestion Produits',
      subItems: [
        { 
          label: 'Familles', 
          action: () => {
            setActiveMenu('families');
            navigate('/stock-manager/products/families');
          }
        },
        { 
          label: 'Sous-familles', 
          action: () => {
            setActiveMenu('subfamilies');
            navigate('/stock-manager/products/subfamilies');
          }
        },
        { 
          label: 'Produits', 
          icon: <FaBox className="w-4 h-4" />,
          action: () => {
            setActiveMenu('products-list');
            navigate('/stock-manager/products/list');
          }
        },
        { 
          label: 'TVA', 
          icon: <FaPercent className="w-4 h-4" />,
          action: () => {
            setActiveMenu('tva');
            navigate('/stock-manager/products/tva');
          }
        }
      ],
      action: () => toggleSubmenu('products')
    },
    {
      id: 'stock',
      icon: <FaWarehouse className="w-5 h-5" />,
      label: 'Gestion Stock',
      subItems: [
        { 
          label: 'Entrées', 
          icon: <FaSignInAlt className="w-4 h-4" />,
          action: () => {
            setActiveMenu('stock-entries');
            navigate('/stock-manager/stock/entries');
          }
        },
        { 
          label: 'Sorties', 
          icon: <FaExit className="w-4 h-4" />,
          action: () => {
            setActiveMenu('stock-exits');
            navigate('/stock-manager/stock/exits');
          }
        },
        { 
          label: 'État du stock', 
          action: () => {
            setActiveMenu('stock-status');
            navigate('/stock-manager/stock/status');
          }
        }
      ],
      action: () => toggleSubmenu('stock')
    },
    {
      id: 'suppliers',
      icon: <FaTruck className="w-5 h-5" />,
      label: 'Fournisseurs',
      action: () => {
        setActiveMenu('suppliers');
        navigate('/stock-manager/suppliers');
      }
    },
    {
      id: 'requests',
      icon: <FaClipboardList className="w-5 h-5" />,
      label: 'Demandes',
      action: () => {
        setActiveMenu('requests');
        navigate('/stock-manager/requests');
      }
    },
    {
      id: 'alerts',
      icon: <FaBell className="w-5 h-5" />,
      label: 'Alertes',
      action: () => {
        setActiveMenu('alerts');
        navigate('/stock-manager/alerts');
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
            className="p-1 rounded-md text-green-400 hover:bg-gray-700 focus:outline-none"
          >
            {isSidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={item.action}
                className={`flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-700 transition ${
                  activeMenu === item.id ? 'bg-green-600 font-semibold' : ''
                } ${isSidebarOpen ? 'px-4' : 'px-2 justify-center'}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                </div>
                {item.subItems && isSidebarOpen && (
                  openSubmenus[item.id] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />
                )}
              </button>

              {/* Sous-menus */}
              {item.subItems && openSubmenus[item.id] && isSidebarOpen && (
                <div className="ml-8 mt-1 mb-2 space-y-1">
                  {item.subItems.map((subItem, index) => (
                    <button
                      key={index}
                      onClick={subItem.action}
                      className={`flex items-center space-x-2 w-full py-2 px-3 rounded hover:bg-gray-700 text-sm transition text-left ${
                        activeMenu === subItem.action.toString().match(/setActiveMenu\('([^']+)'\)/)?.[1] ? 'bg-gray-600' : ''
                      }`}
                    >
                      {subItem.icon && <span className="text-gray-400">{subItem.icon}</span>}
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="mb-4 px-2">
          <button 
            className={`flex items-center ${
              isSidebarOpen ? 'justify-start space-x-3 px-4' : 'justify-center'
            } p-3 w-full rounded-lg bg-red-600 hover:bg-red-700 transition text-white`}
          >
            <FaSignOutAlt />
            {isSidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RespoSidebar;