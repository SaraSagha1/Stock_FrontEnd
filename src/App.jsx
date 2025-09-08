import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';

import AdminHome from './pages/Admin/Home.jsx';
import Login from './pages/auth/login';
import Creation from './pages/Admin/CreateUserForm.jsx';
import UserManagement from './pages/Admin/UsersList.jsx';
import EditUserForm from './pages/Admin/EditUserForm.jsx';
import FamillyManagement from './pages/RespoStock/GestionFamilles.jsx';
import SubFamillyManagement from './pages/RespoStock/GestionSFamilles.jsx';
import ProductsManagement from './pages/RespoStock/GestionProduits.jsx';
import TVAManagement from './pages/RespoStock/GestionTVA.jsx';
import AddProduct from './pages/RespoStock/AddProduct.jsx';
import AddTVA from './pages/RespoStock/AddTVA.jsx';
import SupplierManagement from './pages/RespoStock/GestionFounisseurs.jsx';
import SuplierAdd from './pages/RespoStock/SuplierAdd.jsx';
import EmployeeRequests from './pages/RespoStock/GestionDemandes.jsx';
import StockAlerts from './pages/RespoStock/StockAlerts.jsx';
import ProductEdit from './pages/RespoStock/ProdutEdit.jsx';
import EntryManagement from './pages/RespoStock/GestionEntrees.jsx';
import AddEntry from './pages/RespoStock/AddEntry.jsx';
import EntryEdit from './pages/RespoStock/EditEntry.jsx';
import ExitManagement from './pages/RespoStock/GestionSortie.jsx';
import AddExit from './pages/RespoStock/AddSortie.jsx';
import EditExit from './pages/RespoStock/EditSortie.jsx';
import Dashboard from './pages/RespoStock/Dashboard.jsx';

const AppContent = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Charge l'utilisateur au montage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser(null); // Pas d'utilisateur si rien dans localStorage
    }
  }, [location]); // Re-vérifie à chaque changement de route

  const getDefaultPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/Home';
      case 'responsablestock':
        return '/stock-manager/dashboard';
      case 'employee':
        return '/employee/Home';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Route publique */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to={getDefaultPath(user.role)} />}
      />
      {/* Redirection racine */}
      <Route
        path="/"
        element={<Navigate to={user ? getDefaultPath(user.role) : '/login'} />}
      />





      {/* Routes Admin */}
      <Route
        path="/admin/Home"
        element={user?.role === 'admin' ? <AdminHome /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin/createAcc"
        element={user?.role === 'admin' ? <Creation /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin/users"
        element={user?.role === 'admin' ? <UserManagement /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin/edit-user/:userId"
        element={user?.role === 'admin' ? <EditUserForm /> : <Navigate to="/login" />}
      />




      {/* Routes Responsable Stock */}
       <Route
        path="/stock-manager/dashboard"
        element={user?.role === 'responsablestock' ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/products/families"
        element={user?.role === 'responsablestock' ? <FamillyManagement /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/products/subfamilies"
        element={user?.role === 'responsablestock' ? <SubFamillyManagement /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/products/list"
        element={user?.role === 'responsablestock' ? <ProductsManagement /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/products/tva"
        element={user?.role === 'responsablestock' ? <TVAManagement /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/products/add"
        element={user?.role === 'responsablestock' ? <AddProduct /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/tva/add"
        element={user?.role === 'responsablestock' ? <AddTVA /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/suppliers"
        element={user?.role === 'responsablestock' ? <SupplierManagement /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/suppliers/add"
        element={user?.role === 'responsablestock' ? <SuplierAdd /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/requests"
        element={user?.role === 'responsablestock' ? <EmployeeRequests /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/alerts"
        element={user?.role === 'responsablestock' ? <StockAlerts /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/products/edit/:id"
        element={user?.role === 'responsablestock' ? <ProductEdit /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/stock/entries"
        element={user?.role === 'responsablestock' ? <EntryManagement /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/entries/add"
        element={user?.role === 'responsablestock' ? <AddEntry /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/entries/edit/:id"
        element={user?.role === 'responsablestock' ? <EntryEdit /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/stock/exits"
        element={user?.role === 'responsablestock' ? <ExitManagement /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/exits/add"
        element={user?.role === 'responsablestock' ? <AddExit /> : <Navigate to="/login" />}
      />
      <Route
        path="/stock-manager/exits/edit/:id"
        element={user?.role === 'responsablestock' ? <EditExit /> : <Navigate to="/login" />}
      />

      {/* Route par défaut */}
      <Route path="*" element={<Navigate to={user ? getDefaultPath(user.role) : '/login'} />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

export default App;