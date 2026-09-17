import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import StatsOverview from './components/StatsOverview';
import { RegisterStudent, ManageStudents } from './components/StudentManager';
import AttendanceLogs from './components/AttendanceLogs';
import SecurityAlerts from './components/SecurityAlerts';
import LiveScanner from './components/LiveScanner';
import SettingsPanel from './components/SettingsPanel';

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: 'spring', bounce: 0.4 } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StatsOverview key="dashboard" />;
      case 'scanner':
        return <LiveScanner key="scanner" />;
      case 'register':
        return <RegisterStudent key="register" />;
      case 'students':
        return <ManageStudents key="students" />;
      case 'attendance':
        return <AttendanceLogs key="attendance" />;
      case 'alerts':
        return <SecurityAlerts key="alerts" />;
      case 'settings':
        return <SettingsPanel key="settings" />;
      default:
        return <StatsOverview key="dashboard" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
        <div className="max-w-7xl mx-auto p-8 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full origin-top"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
