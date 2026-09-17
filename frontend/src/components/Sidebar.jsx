import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, UserPlus, ClipboardList, ShieldAlert, Settings, Building2, Camera } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'scanner', label: 'Live Scanner', icon: Camera },
    { id: 'students', label: 'Directory', icon: Users },
    { id: 'register', label: 'Enroll Subject', icon: UserPlus },
    { id: 'attendance', label: 'Access Logs', icon: ClipboardList },
    { id: 'alerts', label: 'Security Alerts', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Container animation for staggering menu items
  const navContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const navItem = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm"
    >
      <div className="p-8 flex items-center gap-4 border-b border-slate-100">
        <motion.div 
          initial={{ rotate: -90, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
          className="bg-blue-600 p-2.5 rounded-lg shadow-md shadow-blue-600/20"
        >
          <Building2 className="w-6 h-6 text-white" />
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
        className="flex-1 px-4 space-y-1.5 mt-8"
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
      
      <div className="p-6 border-t border-slate-100">
        <motion.div 
          whileHover={{ y: -2 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
            AD
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Admin Portal</p>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Connected
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
