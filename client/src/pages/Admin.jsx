import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Heart, LayoutDashboard, User, Shield, BarChart3, Trash2, ArrowLeft } from 'lucide-react';

export default function Admin() {
  const { api } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error('Error fetching admin details:', err.message);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('WARNING: Deleting this user will cascade delete all their proposals, uploads, visits, and recipient answers. This is irreversible. Proceed?')) return;
    
    try {
      const res = await api.delete(`/api/admin/users/${id}`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans flex flex-col">
      
      {/* Top Header */}
      <header className="h-16 border-b border-slate-900 bg-slate-950 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-rose-500" />
            <span className="font-fantasy font-bold text-lg text-white">DateCraft Admin Center</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-6 md:p-8 flex-1 w-full space-y-8">
        
        {/* Global Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Creators</p>
              <p className="text-2xl font-extrabold text-white mt-1">{stats.totalUsers}</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Proposals</p>
              <p className="text-2xl font-extrabold text-white mt-1">{stats.totalProposals}</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Recipient Answers</p>
              <p className="text-2xl font-extrabold text-white mt-1">{stats.totalResponses}</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Views</p>
              <p className="text-2xl font-extrabold text-white mt-1">{stats.totalViews}</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Global Accept Rate</p>
              <p className="text-2xl font-extrabold text-green-400 mt-1">{stats.acceptanceRate}%</p>
            </div>
          </div>
        )}

        {/* Users Management Grid List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white font-fantasy">Platform Creators</h3>
          
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                  <th className="p-4">Creator Info</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50">
                {users.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-900/10">
                    <td className="p-4 flex items-center gap-3 font-semibold text-white">
                      <img src={usr.avatar} alt={usr.name} className="h-8 w-8 rounded-full object-cover border border-slate-800" />
                      <span>{usr.name}</span>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">{usr.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                        usr.role === 'admin' 
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' 
                          : 'bg-slate-950 text-slate-400 border border-slate-850'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(usr.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {usr.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(usr._id)}
                          className="p-1.5 hover:bg-rose-500/15 rounded-lg border border-slate-850 hover:border-rose-500/35 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
