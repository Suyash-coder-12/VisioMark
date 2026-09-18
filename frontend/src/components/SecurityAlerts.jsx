import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, UserPlus, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';

const API_BASE_URL = '';

const SecurityAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [registerData, setRegisterData] = useState({ name: '', roll_no: '', department: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/alerts`);
      setAlerts(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!selectedAlert || !registerData.name) return;

    try {
      await axios.post(`${API_BASE_URL}/api/alerts/convert`, {
        alertId: selectedAlert.id,
        image_path: selectedAlert.image_path,
        name: registerData.name,
        roll_no: registerData.roll_no,
        department: registerData.department
      });
      
      setSuccessMsg(`Successfully registered ${registerData.name}!`);
      setSelectedAlert(null);
      setRegisterData({ name: '', roll_no: '', department: '' });
      fetchAlerts();
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert("Error converting alert: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteAlert = async (e, alertId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/api/alerts/${alertId}`);
      setSuccessMsg('Alert deleted successfully');
      fetchAlerts();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert("Error deleting alert: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl shadow-red-500/10 overflow-hidden flex flex-col h-[800px] relative">
      {/* Red ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-red-600/10 blur-[80px] pointer-events-none" />

      <div className="border-b border-red-500/20 bg-red-950/30 px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-red-500/20 p-3 rounded-xl border border-red-500/30"
          >
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-red-400">Security Breach Alerts</h2>
            <p className="text-sm text-red-300/70 mt-1 tracking-wide">Unknown faces detected by AI cameras.</p>
          </div>
        </div>
        <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold px-5 py-2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          {alerts.length} Incidents
        </span>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="m-6 mb-0 p-4 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center gap-3 border border-emerald-500/20 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-8 overflow-y-auto flex-1 custom-scrollbar relative z-10">
        {loading && alerts.length === 0 ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Scanning logs...</div>
        ) : alerts.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div 
                  key={alert.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="group bg-slate-800/50 backdrop-blur-md rounded-2xl overflow-hidden border border-red-500/20 shadow-lg flex flex-col"
                >
                  <div className="relative aspect-square bg-slate-900 overflow-hidden">
                    <img 
                      src={`${API_BASE_URL}/unknown_faces/${alert.image_path}`} 
                      alt="Unknown detection" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <span className="bg-red-500/90 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm tracking-widest uppercase">
                        Unknown
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium mb-1">Detected Time</p>
                      <p className="text-xl font-bold text-slate-200 mb-1">{alert.timestamp.split(' ')[1]}</p>
                      <p className="text-xs text-slate-500 mb-5">{alert.timestamp.split(' ')[0]}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedAlert(alert)}
                        className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      >
                        <UserPlus className="w-4 h-4" /> Identify
                      </button>
                      <button
                        onClick={(e) => handleDeleteAlert(e, alert.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-semibold p-2.5 rounded-xl flex items-center justify-center transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                 </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex h-full items-center justify-center flex-col text-slate-500"
          >
            <div className="bg-emerald-500/10 p-6 rounded-full mb-6 border border-emerald-500/20">
              <ShieldAlert className="w-16 h-16 text-emerald-400" />
            </div>
            <p className="font-bold text-emerald-400 text-2xl tracking-tight">Perimeter Secure</p>
            <p className="text-slate-400 mt-2">No unknown faces detected by the vision system.</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedAlert && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-slate-800/50 p-5 flex justify-between items-center border-b border-slate-700">
                <h3 className="font-bold text-lg text-white">Identify & Register Subject</h3>
                <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full p-1">&times;</button>
              </div>
              <div className="p-6">
                <div className="flex gap-5 mb-6 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                  <img src={`${API_BASE_URL}/unknown_faces/${selectedAlert.image_path}`} className="w-24 h-24 rounded-lg object-cover border border-slate-600 shadow-md" />
                  <div className="text-sm text-slate-300">
                    <p className="text-slate-500 font-medium mb-1">Incident Time</p>
                    <p className="font-semibold text-slate-200 bg-slate-800 px-2 py-1 rounded inline-block">{selectedAlert.timestamp}</p>
                    <p className="mt-3 text-xs text-blue-400/80 leading-relaxed">Registering will move this photo to Known Faces and retrain the Neural Network instantly.</p>
                  </div>
                </div>
                
                <form onSubmit={handleConvert} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Subject Full Name</label>
                    <input autoFocus type="text" required value={registerData.name} onChange={e => setRegisterData({...registerData, name: e.target.value})} className="w-full bg-slate-950/50 text-white px-4 py-3 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Enter recognized name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Roll No</label>
                      <input type="text" value={registerData.roll_no} onChange={e => setRegisterData({...registerData, roll_no: e.target.value})} className="w-full bg-slate-950/50 text-white px-4 py-3 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Optional" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Department</label>
                      <input type="text" value={registerData.department} onChange={e => setRegisterData({...registerData, department: e.target.value})} className="w-full bg-slate-950/50 text-white px-4 py-3 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Optional" />
                    </div>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setSelectedAlert(null)} className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-colors shadow-lg shadow-blue-500/25">Register Subject</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecurityAlerts;
