import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Heart, LayoutDashboard, FileText, LayoutTemplate, BarChart3, Bell, Settings, LogOut, Plus, 
  ExternalLink, Copy, QrCode, Trash2, Shield, Eye, Calendar, Sparkles, CheckCircle2, 
  Clock, Check, Share2, Compass, Smartphone, Monitor, Globe, Search, Filter, RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';

export default function Dashboard() {
  const { user, logout, api } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [proposals, setProposals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [stats, setStats] = useState({ totalProposals: 0, totalViews: 0, totalAcceptances: 0, pendingResponses: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Proposal Creator Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProposalName, setNewProposalName] = useState('');
  const [newProposalTitle, setNewProposalTitle] = useState('');
  const [newProposalTemplate, setNewProposalTemplate] = useState('Romantic Rose');
  const [creating, setCreating] = useState(false);

  // QR Code Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Individual Proposal Analytics Detail Modal
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [proposalAnalytics, setProposalAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const navigate = useNavigate();

  // Load basic data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [proposalRes, notifyRes] = await Promise.all([
        api.get('/api/proposals'),
        api.get('/api/notifications')
      ]);

      if (proposalRes.data.success) {
        const props = proposalRes.data.proposals;
        setProposals(props);

        // Fetch analytics for each proposal to aggregate total views/acceptances
        let views = 0;
        let accepts = 0;
        
        // Asynchronously load analytical sums
        const statsPromises = props.map(p => api.get(`/api/analytics/proposal/${p._id}`).catch(() => null));
        const statsResults = await Promise.all(statsPromises);
        
        statsResults.forEach(res => {
          if (res && res.data && res.data.success) {
            views += res.data.analytics.totalViews;
            accepts += res.data.analytics.totalAcceptances;
          }
        });

        setStats({
          totalProposals: props.length,
          totalViews: views,
          totalAcceptances: accepts,
          pendingResponses: Math.max(0, views - accepts)
        });
      }

      if (notifyRes.data.success) {
        setNotifications(notifyRes.data.notifications);
        setUnreadNotifications(notifyRes.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    if (!newProposalName) return;

    try {
      setCreating(true);
      const res = await api.post('/api/proposals', {
        girlName: newProposalName,
        title: newProposalTitle,
        templateName: newProposalTemplate
      });

      if (res.data.success) {
        setShowCreateModal(false);
        setNewProposalName('');
        setNewProposalTitle('');
        // Refresh and route to builder
        fetchData();
        navigate(`/builder/${res.data.proposal._id}`);
      }
    } catch (error) {
      console.error('Error creating proposal:', error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/api/proposals/${id}/duplicate`);
      if (res.data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error duplicating proposal:', error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this proposal and all its response logs? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/api/proposals/${id}`);
      if (res.data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting proposal:', error.message);
    }
  };

  const handleOpenQr = async (slug) => {
    const fullUrl = `${window.location.origin}/p/${slug}`;
    setSelectedSlug(slug);
    try {
      const qrDataUrl = await QRCode.toDataURL(fullUrl, { width: 300, margin: 2 });
      setQrCodeUrl(qrDataUrl);
      setShowQrModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error.message);
    }
  };

  const handleOpenAnalytics = async (id) => {
    setSelectedProposalId(id);
    setShowAnalyticsModal(true);
    setLoadingAnalytics(true);
    try {
      const res = await api.get(`/api/analytics/proposal/${id}`);
      if (res.data.success) {
        setProposalAnalytics(res.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics details:', error.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      const res = await api.put('/api/notifications/read-all');
      if (res.data.success) {
        setUnreadNotifications(0);
        // Mark local as read
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error.message);
    }
  };

  // Filter proposals list
  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.girlName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Custom logic if filter states are built
    return matchesSearch;
  });

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex font-sans">
      
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-900">
            <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
            <span className="font-fantasy font-bold text-lg text-white">DateCraft</span>
          </div>

          {/* User profile brief */}
          <div className="p-4 flex items-center gap-3 border-b border-slate-900 bg-slate-900/10">
            <img src={user?.avatar} alt={user?.name} className="h-9 w-9 rounded-full object-cover border border-rose-500/20" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
            {user?.role === 'admin' && (
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ml-auto">
                Admin
              </span>
            )}
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </button>

            <button 
              onClick={() => setActiveTab('proposals')}
              className={`w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'proposals' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <FileText className="h-4 w-4" /> My Proposals
            </button>

            <button 
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'templates' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <LayoutTemplate className="h-4 w-4" /> Preset Themes
            </button>

            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-colors relative ${
                activeTab === 'notifications' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Bell className="h-4 w-4" /> Notifications
              {unreadNotifications > 0 && (
                <span className="absolute right-3 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {user?.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900/50"
              >
                <Shield className="h-4 w-4" /> Admin Console
              </button>
            )}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-900">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="h-16 border-b border-slate-900 px-4 flex items-center justify-between md:hidden bg-slate-950">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
            <span className="font-fantasy font-bold text-base text-white">DateCraft</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('notifications')} className="relative p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white">
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 w-2.5 h-2.5 rounded-full animate-ping" />}
            </button>
            <button onClick={logout} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 hover:text-rose-500">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Active Tab Panel 1: Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Top Welcome Title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-fantasy">Welcome Back, {user?.name}! ✨</h1>
                  <p className="text-slate-400 text-sm mt-1">Here is how your custom romantic proposals are performing.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all w-fit cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Create Proposal
                </button>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-rose-500/10"><FileText className="h-10 w-10" /></div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Proposals</p>
                  <p className="text-3xl font-extrabold text-white mt-2">{stats.totalProposals}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Created proposals</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-rose-500/10"><Eye className="h-10 w-10" /></div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Views</p>
                  <p className="text-3xl font-extrabold text-white mt-2">{stats.totalViews}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Total visitor opens</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-rose-500/10"><Heart className="h-10 w-10 fill-rose-500/5" /></div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Yes Taps</p>
                  <p className="text-3xl font-extrabold text-rose-400 mt-2">{stats.totalAcceptances}</p>
                  <p className="text-[10px] text-rose-500/50 mt-1">Proposal acceptances</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-rose-500/10"><Clock className="h-10 w-10" /></div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pending</p>
                  <p className="text-3xl font-extrabold text-yellow-500 mt-2">{stats.pendingResponses}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Awaiting responses</p>
                </div>
              </div>

              {/* Quick Start Guide */}
              <div className="bg-gradient-to-r from-rose-950/20 via-slate-900/40 to-slate-900/40 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <h3 className="text-lg font-bold text-white flex items-center gap-1.5"><Sparkles className="h-5 w-5 text-rose-400" /> Need inspiration? Clone a preset theme!</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Instantly build custom proposal pages using our premade themes like <b>Romantic Rose</b>, <b>Starry Night</b>, or <b>Coffee Date</b>. Change color tokens, edit text templates, upload images, and launch.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('templates')}
                  className="h-10 px-5 text-sm font-semibold rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all whitespace-nowrap"
                >
                  Browse Themes
                </button>
              </div>

              {/* Recent Activity Brief */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Recent proposals block */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white font-fantasy">Recent Proposals</h3>
                    <button onClick={() => setActiveTab('proposals')} className="text-xs text-rose-400 hover:text-rose-300 font-semibold">View All</button>
                  </div>
                  
                  {proposals.length === 0 ? (
                    <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                      <FileText className="h-10 w-10 mx-auto mb-3 text-slate-600" />
                      <p className="text-sm font-medium">No proposals created yet.</p>
                      <button onClick={() => setShowCreateModal(true)} className="text-rose-400 text-xs mt-1.5 font-bold hover:underline">Create your first one</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {proposals.slice(0, 3).map((prop) => (
                        <div key={prop._id} className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">{prop.title}</h4>
                            <p className="text-xs text-slate-400 truncate mt-1">Recipient: <span className="font-semibold text-rose-400">{prop.girlName}</span> • Theme: {prop.theme?.name}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button 
                              onClick={() => handleOpenAnalytics(prop._id)}
                              className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                              title="Analytics"
                            >
                              <BarChart3 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => navigate(`/builder/${prop._id}`)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notifications Brief */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white font-fantasy">Recent Alerts</h3>
                    {unreadNotifications > 0 && (
                      <button onClick={handleMarkNotificationsRead} className="text-xs text-slate-400 hover:text-white">Mark Read</button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                      <Bell className="h-10 w-10 mx-auto mb-3 text-slate-600" />
                      <p className="text-sm">Quiet for now.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.slice(0, 4).map((n) => (
                        <div key={n._id} className={`p-3 rounded-xl border text-xs leading-relaxed ${
                          n.read ? 'bg-slate-900/10 border-slate-900 text-slate-400' : 'bg-rose-950/10 border-rose-500/20 text-slate-200'
                        }`}>
                          <p>{n.message}</p>
                          <span className="text-[9px] text-slate-500 mt-1 block">{new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Active Tab Panel 2: Proposals List */}
          {activeTab === 'proposals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white font-fantasy font-fantasy">My Proposals</h1>
                  <p className="text-slate-400 text-sm mt-1">Manage, duplicate, share, and delete your created pages.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 h-10 text-sm font-bold rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Create Proposal
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 h-10 bg-slate-900 border border-slate-800 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {filteredProposals.length === 0 ? (
                <div className="border border-dashed border-slate-800 rounded-3xl p-16 text-center text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                  <p className="text-base font-semibold">No matching proposals found.</p>
                  <p className="text-sm mt-1">Try searching for another term or launch the builder.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProposals.map((prop) => {
                    const fullUrl = `${window.location.origin}/p/${prop.slug}`;
                    return (
                      <div key={prop._id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all group relative">
                        <div>
                          {/* Theme indicator */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                              {prop.theme?.name || 'Classic'}
                            </span>
                            <span className="text-[10px] text-slate-500">{new Date(prop.createdAt).toLocaleDateString()}</span>
                          </div>

                          <h3 className="font-bold text-white text-base truncate mb-1">{prop.title}</h3>
                          <p className="text-slate-400 text-xs">For: <span className="text-rose-400 font-semibold">{prop.girlName}</span></p>

                          {/* Link display */}
                          <div className="mt-4 p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-500">
                            <span className="truncate pr-2 font-mono select-all text-slate-400">{fullUrl}</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(fullUrl);
                                  alert('Link copied to clipboard! ❤️');
                                }}
                                className="p-1 text-slate-400 hover:text-white" 
                                title="Copy Link"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleOpenQr(prop.slug)}
                                className="p-1 text-slate-400 hover:text-white" 
                                title="QR Code"
                              >
                                <QrCode className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Card controls */}
                        <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-800">
                          <button
                            onClick={() => handleOpenAnalytics(prop._id)}
                            className="inline-flex items-center justify-center gap-1.5 h-9 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            <BarChart3 className="h-3.5 w-3.5" /> Stats
                          </button>
                          
                          <button
                            onClick={() => navigate(`/builder/${prop._id}`)}
                            className="inline-flex items-center justify-center gap-1.5 h-9 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Edit
                          </button>

                          {/* Dropdown Options */}
                          <div className="flex justify-between items-center gap-1 bg-slate-950 border border-slate-800 px-1 rounded-xl">
                            <button
                              onClick={() => handleDuplicate(prop._id)}
                              className="p-1 text-slate-400 hover:text-white flex-1 flex justify-center"
                              title="Duplicate"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(prop._id)}
                              className="p-1 text-slate-400 hover:text-rose-400 flex-1 flex justify-center"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Active Tab Panel 3: Templates */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white font-fantasy font-fantasy">Preset Themes</h1>
                <p className="text-slate-400 text-sm mt-1">Select a starting theme template to initialize your proposal page layout.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Romantic Rose', desc: 'Elegant pink colors, floating hearts, script letters, and warm memories.', bg: 'from-rose-500 to-pink-500', icon: '🌹' },
                  { name: 'Starry Night', desc: 'Indigo space sky with glowing stars, interactive shooting meteor triggers.', bg: 'from-indigo-950 to-slate-900', icon: '✨' },
                  { name: 'Coffee Date', desc: 'Cozy yellow amber, wood aesthetics, clean margins. Casual and warm.', bg: 'from-amber-700 to-amber-100', icon: '☕' },
                  { name: 'Movie Night', desc: 'Retro cinema vibes, bold reds, tickets styling, movie poster images.', bg: 'from-red-700 to-slate-900', icon: '🎬' },
                  { name: 'Sunset Walk', desc: 'Vibrant orange, purple twilight sky, smooth slow hover parameters.', bg: 'from-orange-500 to-purple-800', icon: '🌇' },
                  { name: 'Minimal Luxury', desc: 'Beige backdrop, gold borders, thin serif typography. Extremely clean.', bg: 'from-neutral-200 to-neutral-400', icon: '💎' }
                ].map((tpl) => (
                  <div key={tpl.name} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-rose-500/20 transition-all group">
                    <div className={`h-32 bg-gradient-to-r ${tpl.bg} flex items-center justify-center p-6 text-center relative`}>
                      <span className="text-4xl absolute -bottom-4 bg-slate-950/90 border border-slate-800 p-2.5 rounded-2xl leading-none">{tpl.icon}</span>
                    </div>
                    <div className="p-6 pt-8">
                      <h3 className="font-bold text-white text-base mb-1.5">{tpl.name}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed mb-6">{tpl.desc}</p>
                      
                      <button
                        onClick={() => {
                          setNewProposalTemplate(tpl.name);
                          setShowCreateModal(true);
                        }}
                        className="w-full py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Use Theme Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tab Panel 4: Notifications Full Feed */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white font-fantasy font-fantasy">Notifications</h1>
                  <p className="text-slate-400 text-sm mt-1">Track actions and responses in real time.</p>
                </div>
                {unreadNotifications > 0 && (
                  <button
                    onClick={handleMarkNotificationsRead}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="border border-dashed border-slate-800 rounded-3xl p-16 text-center text-slate-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                  <p className="text-base font-semibold">No alerts logged yet.</p>
                  <p className="text-sm">We will alert you here as soon as someone visits your link!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div 
                      key={n._id} 
                      className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                        n.read ? 'bg-slate-900/10 border-slate-900 text-slate-400' : 'bg-rose-950/5 border-rose-500/10 text-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-sm leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-500 block">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* MODAL: Proposal Creation Form */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Create Proposal Wizard</h3>
            
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Her Name / Recipient</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lily ❤️"
                  value={newProposalName}
                  onChange={(e) => setNewProposalName(e.target.value)}
                  className="w-full px-4 h-11 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Proposal Title</label>
                <input
                  type="text"
                  placeholder="e.g. A Special Surpise for Lily"
                  value={newProposalTitle}
                  onChange={(e) => setNewProposalTitle(e.target.value)}
                  className="w-full px-4 h-11 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Theme Selection</label>
                <select
                  value={newProposalTemplate}
                  onChange={(e) => setNewProposalTemplate(e.target.value)}
                  className="w-full px-4 h-11 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Romantic Rose">🌹 Romantic Rose (Classic Pink)</option>
                  <option value="Starry Night">✨ Starry Night (Dark Indigo)</option>
                  <option value="Coffee Date">☕ Coffee Date (Amber Cozy)</option>
                  <option value="Movie Night">🎬 Movie Night (Cinematic Red)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 h-10 border border-slate-850 hover:bg-slate-850 text-slate-400 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 h-10 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  {creating ? 'Creating...' : 'Launch Builder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR Code Download Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white mb-2">Your Romantic Link QR Code</h3>
            <p className="text-slate-400 text-xs mb-6">Scan or share this code with her.</p>
            
            <div className="bg-white p-3 rounded-2xl inline-block mb-6 shadow-xl border-4 border-rose-500/20">
              <img src={qrCodeUrl} alt="Proposal QR" className="mx-auto h-52 w-52" />
            </div>

            <div className="flex gap-2">
              <a 
                href={qrCodeUrl} 
                download={`datecraft-qr-${selectedSlug}.png`}
                className="flex-1 inline-flex items-center justify-center h-10 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
              >
                Download QR Image
              </a>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 h-10 border border-slate-800 text-slate-400 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Consolidated Proposal Analytics View */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => {
                setShowAnalyticsModal(false);
                setProposalAnalytics(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2 font-fantasy">Proposal Insights</h3>
            <p className="text-slate-400 text-xs mb-6">Review visits, completion ratios, and questionnaire stats.</p>

            {loadingAnalytics ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
              </div>
            ) : proposalAnalytics ? (
              <div className="space-y-8">
                
                {/* 4 Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Views</p>
                    <p className="text-2xl font-bold text-white mt-1">{proposalAnalytics.totalViews}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unique Opens</p>
                    <p className="text-2xl font-bold text-white mt-1">{proposalAnalytics.uniqueVisitors}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Yes Taps</p>
                    <p className="text-2xl font-bold text-rose-400 mt-1">{proposalAnalytics.totalAcceptances}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Acceptance %</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">{proposalAnalytics.acceptanceRate}%</p>
                  </div>
                </div>

                {/* Device Breakdown with Custom Visual Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-slate-400" /> Device Distribution</h4>
                    
                    <div className="space-y-3">
                      {['mobile', 'tablet', 'desktop'].map(dev => {
                        const count = proposalAnalytics.deviceBreakdown[dev] || 0;
                        const pct = proposalAnalytics.totalViews > 0 ? Math.round((count / proposalAnalytics.totalViews) * 100) : 0;
                        return (
                          <div key={dev} className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-400 capitalize">
                              <span>{dev}</span>
                              <span className="font-semibold">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Traffic Sources */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5"><Globe className="h-4 w-4 text-slate-400" /> Traffic Sources</h4>
                    
                    <div className="space-y-3">
                      {Object.keys(proposalAnalytics.trafficSources).length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No traffic source logged yet.</p>
                      ) : (
                        Object.entries(proposalAnalytics.trafficSources).map(([src, count]) => {
                          const pct = proposalAnalytics.totalViews > 0 ? Math.round((count / proposalAnalytics.totalViews) * 100) : 0;
                          return (
                            <div key={src} className="space-y-1 text-xs">
                              <div className="flex justify-between text-slate-400">
                                <span>{src}</span>
                                <span className="font-semibold">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom Questionnaire Answers Distribution */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-slate-400" /> Custom Questions Answers</h4>
                  
                  <div className="space-y-6">
                    {Object.keys(proposalAnalytics.questionDistribution).length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No answers submitted yet.</p>
                    ) : (
                      Object.entries(proposalAnalytics.questionDistribution).map(([qId, data]) => (
                        <div key={qId} className="space-y-2.5">
                          <p className="text-xs font-bold text-rose-400 leading-snug">Q: {data.questionText}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                            {Object.entries(data.answers).map(([ans, count]) => (
                              <div key={ans} className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium truncate pr-2">{ans}</span>
                                <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold">{count} votes</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-12">Unable to retrieve analytics.</p>
            )}

            <div className="flex justify-end pt-6 mt-6 border-t border-slate-800">
              <button 
                onClick={() => {
                  setShowAnalyticsModal(false);
                  setProposalAnalytics(null);
                }}
                className="px-5 h-10 border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
