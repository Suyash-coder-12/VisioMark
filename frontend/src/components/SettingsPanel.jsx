import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings2, Shield, Bell, Database, Camera, 
  Clock, Sliders, Trash2, Download, Save, CheckCircle2
} from 'lucide-react';

const SettingsPanel = () => {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    tolerance: 0.6,
    cooldown: 5,
    resolution: '720p',
    lateThreshold: '09:30',
    autoCheckout: true,
    weekendScan: false,
    emailAlerts: true,
    dailyReport: true,
    adminEmail: 'admin@college.edu',
    dataRetention: '30'
  });

  const handleChange = (key, value) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // In a real app, this would POST to /api/settings
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[800px]">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
            <Settings2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Configuration</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Manage AI parameters and access rules.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {saved && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-emerald-600 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Preferences Saved
            </motion.div>
          )}
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Save Changes
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Section 1: AI Recognition Settings */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-2">
              <Camera className="w-5 h-5 text-slate-500" />
              <h3 className="text-lg font-bold text-slate-800">AI Recognition Engine</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex justify-between">
                  Strictness (Tolerance) <span className="text-blue-600">{config.tolerance}</span>
                </label>
                <input 
                  type="range" min="0.1" max="1.0" step="0.1" 
                  value={config.tolerance} 
                  onChange={(e) => handleChange('tolerance', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
                <p className="text-xs text-slate-500 font-medium">Lower values mean stricter matching (less false positives).</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Security Alert Cooldown (Seconds)</label>
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-slate-400" />
                  <input 
                    type="number" min="1" max="60" 
                    value={config.cooldown}
                    onChange={(e) => handleChange('cooldown', e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 font-medium">Wait time before capturing the same unknown face again.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Camera Resolution</label>
                <select 
                  value={config.resolution}
                  onChange={(e) => handleChange('resolution', e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="480p">480p (Fastest, High FPS)</option>
                  <option value="720p">720p (Balanced)</option>
                  <option value="1080p">1080p (Highest Accuracy, High CPU)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Attendance Rules */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-2">
              <Clock className="w-5 h-5 text-slate-500" />
              <h3 className="text-lg font-bold text-slate-800">Attendance Rules</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Late Mark Threshold Time</label>
                <input 
                  type="time" 
                  value={config.lateThreshold}
                  onChange={(e) => handleChange('lateThreshold', e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-4 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={config.autoCheckout} onChange={(e) => handleChange('autoCheckout', e.target.checked)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${config.autoCheckout ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.autoCheckout ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <div className="text-sm font-bold text-slate-700">Enable Auto-Checkout</div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={config.weekendScan} onChange={(e) => handleChange('weekendScan', e.target.checked)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${config.weekendScan ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.weekendScan ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <div className="text-sm font-bold text-slate-700">Allow Weekend Scanning</div>
                </label>
              </div>
            </div>
          </section>

          {/* Section 3: Notification & Security */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-2">
              <Bell className="w-5 h-5 text-slate-500" />
              <h3 className="text-lg font-bold text-slate-800">Notifications & Security</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={config.emailAlerts} onChange={(e) => handleChange('emailAlerts', e.target.checked)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${config.emailAlerts ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.emailAlerts ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <div className="text-sm font-bold text-slate-700">Email Alerts on Unknown Faces</div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={config.dailyReport} onChange={(e) => handleChange('dailyReport', e.target.checked)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${config.dailyReport ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.dailyReport ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <div className="text-sm font-bold text-slate-700">Send Daily Attendance Summary</div>
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Administrator Email</label>
                <input 
                  type="email" 
                  value={config.adminEmail}
                  onChange={(e) => handleChange('adminEmail', e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Data Management */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-2">
              <Database className="w-5 h-5 text-slate-500" />
              <h3 className="text-lg font-bold text-slate-800">Database Management</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Data Retention Policy</label>
                <select 
                  value={config.dataRetention}
                  onChange={(e) => handleChange('dataRetention', e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="7">Keep logs for 7 Days</option>
                  <option value="30">Keep logs for 30 Days</option>
                  <option value="90">Keep logs for 90 Days</option>
                  <option value="never">Never Delete (Requires manual purge)</option>
                </select>
              </div>
              <div className="flex gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-bold transition-colors">
                  <Download className="w-4 h-4" /> Backup DB
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm font-bold transition-colors">
                  <Trash2 className="w-4 h-4" /> Purge Logs
                </motion.button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
