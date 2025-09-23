import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"; // 🚀 pour rediriger
import API from "../../api/axios";
import logo from '../../assets/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // 🚀 hook navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await API.post('/login', formData);
    console.log("Réponse complète:", response.data);

    const { data } = response.data;
    const { token, user } = data;

    // ✅ Changez 'token' par 'auth_token' pour correspondre à axios.js
    localStorage.setItem('auth_token', token); // ← ICI
    localStorage.setItem('user', JSON.stringify(user));

    setMessage("✅ Connexion réussie !");

    // Redirection selon le rôle
    if (user.role === "admin") {
      navigate("/admin");
    } else if (user.role === "responsablestock") {
      navigate("/stock-manager/dashboard");
    } else if (user.role === "employe") {
      navigate("/employe/Home");
    } else {
      navigate("/");
    }

  } catch (error) {
    setMessage("❌ Erreur : " + (error.response?.data?.message || error.message));
    console.error("Erreur détaillée:", error.response?.data);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-green-50 to-green-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo AL OMRANE" className="h-16 w-auto" />
        </div>

        {/* Titre */}
        <h1 className="text-center text-2xl font-bold text-gray-800">AL OMRANE</h1>
        <h2 className="text-center text-xl font-semibold text-gray-700 mt-2">Connexion</h2>
        <p className="text-center text-gray-500 mb-6">Accédez à votre espace de travail</p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-gray-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              placeholder="exemple@alomrane.ma"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-600 mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-700 to-red-700 hover:from-green-800 hover:to-red-800 text-white py-2 rounded-md font-semibold transition"
          >
            Se connecter
          </button>
        </form>

        {/* Message */}
        {message && <p className="text-center mt-4 text-gray-700">{message}</p>}

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          © {new Date().getFullYear()} AL OMRANE - Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default Login;
