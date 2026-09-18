import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Optional: If you are using Lucide or Heroicons, you can import icons here
// import { Users, AlertTriangle } from 'lucide-react';

const API_BASE_URL = '';

const Dashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [presentCount, setPresentCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from our Node.js Express backend
  const fetchData = async () => {
    try {
      const [attendanceRes, countRes, alertsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/attendance`),
        axios.get(`${API_BASE_URL}/api/attendance/count`),
        axios.get(`${API_BASE_URL}/api/alerts`)
      ]);
      
      setAttendance(attendanceRes.data);
      setPresentCount(countRes.data.count);
      setAlerts(alertsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh data every 5 seconds to keep the dashboard real-time
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-xl font-bold text-gray-600">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Smart AI Attendance</h1>
          <p className="text-gray-500 mt-1">Live College Attendance & Security Monitoring</p>
        </div>
        
        {/* Top Stats Widget */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            {/* SVG Icon for Users */}
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Today's Present</p>
            <p className="text-3xl font-bold text-gray-900">{presentCount}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Attendance Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
          <div className="border-b border-gray-100 bg-white px-6 py-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Attendance Log (Today)</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                <tr className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.length > 0 ? (
                  attendance.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-400 font-medium">#{log.id}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{log.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">{log.time}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Present</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        <p>No attendance recorded today yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Security Alerts Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
          <div className="border-b border-gray-100 bg-red-50/50 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <h2 className="text-xl font-bold text-gray-800">Security Alerts</h2>
            </div>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {alerts.length} Incidents
            </span>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
            {alerts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all">
                    <div className="relative aspect-square">
                      <img 
                        src={`${API_BASE_URL}/unknown_faces/${alert.image_path}`} 
                        alt="Unknown detection" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-sm">
                        UNKNOWN
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {alert.timestamp.split(' ')[1]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center flex-col text-gray-400">
                <svg className="w-16 h-16 mb-4 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="font-medium text-gray-500">All clear!</p>
                <p className="text-sm">No unknown faces detected.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
