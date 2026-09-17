import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, UserCheck, ShieldAlert, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

const StatsOverview = () => {
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, alertsToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/stats`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { title: 'Registered Directory', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Present Personnel', value: stats.presentToday, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Security Exceptions', value: stats.alertsToday, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { title: 'Operational Rate', value: stats.totalStudents > 0 ? Math.round((stats.presentToday / stats.totalStudents) * 100) + '%' : '0%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">System Overview</h2>
        <p className="text-slate-500 mt-2 flex items-center gap-2 font-medium">
          <Activity className="w-4 h-4 text-blue-500" /> Active System Status Report
        </p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={index} 
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)' }}
              className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm transition-all relative overflow-hidden group`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`${card.bg} ${card.color} ${card.border} border p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="bg-slate-50 text-slate-400 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-4xl font-extrabold text-slate-800 mt-1 tracking-tight">
                  {card.value}
                </h3>
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide mt-2">{card.title}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-white border border-slate-200 rounded-xl p-8 h-96 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden shadow-sm"
      >
        <TrendingUp className="w-16 h-16 mb-6 text-slate-200" />
        <p className="font-bold text-2xl text-slate-600 relative z-10">Historical Data Insights</p>
        <p className="text-sm mt-2 relative z-10 text-slate-500 font-medium">Detailed trend visualization and reports module coming soon.</p>
      </motion.div>
    </div>
  );
};

export default StatsOverview;
