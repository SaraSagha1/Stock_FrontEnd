import React, { useState } from 'react';
import logo from '/src/assets/AlOmrane.jpeg';
import api from '/src/api/axios.js'; 

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Efface l'erreur quand l'utilisateur modifie les champs
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', formData);
      const { token, user } = response.data.data;

      console.log('User data:', user); // Vérifie dans la console
      console.log('Token:', token);

      // Stocke le token et les infos utilisateur
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirection selon le rôle
      if (user.role === 'admin') {
        window.location.href = '/admin/Home';
      } else if (user.role === 'responsablestock') {
        window.location.href = '/stock-manager/dashboard';
      } else if (user.role === 'employee') {
        window.location.href = '/employee-home';
      } else {
        window.location.href = '/'; // Par défaut, page d'accueil
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-green-50 to-green-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">
        {/* Logo centré */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo AL OMRANE" className="h-16 w-auto" />
        </div>

        {/* Titre principal */}
        <h1 className="text-center text-2xl font-bold text-gray-800">AL OMRANE</h1>
        <h2 className="text-center text-xl font-bold text-gray-700 mt-3">Connexion</h2>
        <p className="text-center text-gray-500 mb-6">Accédez à votre espace de travail</p>

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
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-700 to-red-700 hover:from-green-800 hover:to-red-800 text-white py-2 rounded-md font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          © {new Date().getFullYear()} AL OMRANE - Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default Login;