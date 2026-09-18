import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, Download, FileSpreadsheet } from 'lucide-react';

const API_BASE_URL = '';

const AttendanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async (date) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/attendance/history${date ? `?date=${date}` : ''}`);
      setLogs(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(dateFilter);
  }, [dateFilter]);

  const filteredLogs = logs.filter(log => log.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Date,Time\n" 
      + filteredLogs.map(e => `${e.id},${e.name},${e.date},${e.time}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${dateFilter || 'history'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-10rem)] md:h-[800px]">
      <div className="border-b border-slate-200 bg-slate-50 px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Access Records</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Historical access and attendance logs.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group w-full sm:w-auto flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search subject..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-sm bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-56 transition-shadow shadow-sm"
              />
            </div>
            <div className="relative group flex-1 min-w-[150px]">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm"
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport} 
              className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-500" /> Export CSV
            </motion.button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-white z-10 border-b border-slate-200 shadow-sm">
              <tr className="text-slate-500 text-xs uppercase tracking-widest font-bold">
                <th className="px-4 md:px-8 py-5">Log ID</th>
                <th className="px-4 md:px-8 py-5">Subject Name</th>
                <th className="px-4 md:px-8 py-5">Date</th>
                <th className="px-4 md:px-8 py-5">Timestamp</th>
                <th className="px-4 md:px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-medium animate-pulse">Loading records...</td></tr>
              ) : filteredLogs.length > 0 ? (
                <AnimatePresence>
                  {filteredLogs.map((log, index) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 24 }}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-4 md:px-8 py-4 text-sm text-slate-400 font-medium">#{log.id}</td>
                      <td className="px-4 md:px-8 py-4 text-sm font-bold text-slate-800">{log.name}</td>
                      <td className="px-4 md:px-8 py-4 text-sm text-slate-500 font-medium">{log.date}</td>
                      <td className="px-4 md:px-8 py-4 text-sm text-slate-600 font-mono">{log.time}</td>
                      <td className="px-4 md:px-8 py-4 text-sm">
                        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-md text-xs font-bold tracking-wide">AUTHORIZED</span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-base font-medium">No records found for the selected date.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLogs;
