import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, UserPlus, ClipboardList, ShieldAlert, Settings, Building2, Camera, Menu, X } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, core: true },
    { id: 'scanner', label: 'Live Scanner', icon: Camera, core: true },
    { id: 'students', label: 'Directory', icon: Users, core: true },
    { id: 'register', label: 'Enroll Subject', icon: UserPlus, core: false },
    { id: 'attendance', label: 'Access Logs', icon: ClipboardList, core: false },
    { id: 'alerts', label: 'Security Alerts', icon: ShieldAlert, core: true },
    { id: 'settings', label: 'Settings', icon: Settings, core: false },
  ];

  const coreItems = menuItems.filter(item => item.core);

  // Desktop Animation Variants
  const navContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const navItem = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <>
      {/* 
        ========================
        MOBILE VIEWS
        ========================
      */}

      {/* Mobile Top App Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 rounded-lg shadow-md overflow-hidden border border-slate-200">
            <img src="/logo.jpg" alt="Logo" className="w-9 h-9 object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">VisioMark</h1>
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest leading-none">Enterprise</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-slate-600 hover:text-slate-900 active:bg-slate-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Fullscreen Menu (Drawer/Overlay) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-30 bg-white pt-20 pb-24 px-4 overflow-y-auto"
          >
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">All Modules</p>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors font-semibold text-base ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (Glassmorphism) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-lg border-t border-slate-200 z-40 px-2 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="h-full flex items-center justify-around">
          {coreItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className="relative flex flex-col items-center justify-center w-16 h-14"
              >
                <div className={`flex flex-col items-center transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                  <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                    {item.label.split(' ')[0]} {/* Shorten label for bottom nav */}
                  </span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="mobileActiveTabIndicator"
                    className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 
        ========================
        DESKTOP VIEW (hidden on mobile)
        ========================
      */}
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col z-20 shadow-sm h-screen sticky top-0"
      >
        <div className="p-8 flex items-center gap-4 border-b border-slate-100">
          <motion.div 
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="bg-slate-900 rounded-lg shadow-md overflow-hidden border border-slate-200 shrink-0"
          >
            <img src="/logo.jpg" alt="Logo" className="w-11 h-11 object-cover" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">VisioMark</h1>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Enterprise</p>
          </div>
        </div>
        
        <motion.div 
          variants={navContainer}
          initial="hidden"
          animate="show"
          className="flex-1 px-4 space-y-1.5 mt-8 overflow-y-auto custom-scrollbar pb-4"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                variants={navItem}
                whileHover={{ x: 6, backgroundColor: isActive ? '' : '#f8fafc' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium relative overflow-hidden ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeSidebar" 
                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md" 
                  />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </motion.button>
            );
          })}
        </motion.div>
        
        <div className="p-6 border-t border-slate-100 bg-white">
          <motion.div 
            whileHover={{ y: -2 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shrink-0">
              AD
            </div>
            <div className="truncate flex-1">
              <p className="text-sm font-bold text-slate-800 truncate">Suyash@VisioMark</p>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Authenticated
              </p>
            </div>
            {onLogout && (
              <button 
                onClick={(e) => { e.stopPropagation(); onLogout(); }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Secure Logout"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
