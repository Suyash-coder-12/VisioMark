import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, User, Trash2, Camera, Database, FileText } from 'lucide-react';

const API_BASE_URL = '';

export const RegisterStudent = () => {
  const [formData, setFormData] = useState({ name: '', roll_no: '', department: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.name) {
      setStatus({ type: 'error', message: 'Identity details and Biometric data required!' });
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('roll_no', formData.roll_no);
    data.append('department', formData.department);
    data.append('photo', file);

    try {
      setStatus({ type: 'info', message: 'Processing enrollment...' });
      await axios.post(`${API_BASE_URL}/api/students/register`, data);
      setStatus({ type: 'success', message: 'Subject enrolled successfully.' });
      setFormData({ name: '', roll_no: '', department: '' });
      setFile(null);
      setPreview(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Registration failed' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex items-center gap-4">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Profile Enrollment</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Add new subjects to the secure directory.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <AnimatePresence>
          {status.message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-lg flex items-center gap-3 border ${status.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'} shadow-sm`}
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="font-bold text-sm">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Subject Full Name <span className="text-red-500">*</span></label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white text-slate-800 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm" placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Roll Number</label>
              <input type="text" value={formData.roll_no} onChange={(e) => setFormData({...formData, roll_no: e.target.value})} className="w-full bg-white text-slate-800 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Department</label>
              <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full bg-white text-slate-800 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm" placeholder="Optional" />
            </div>
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-4 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer relative group shadow-sm" 
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            {preview ? (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                <img src={preview} alt="Preview" className="max-h-56 rounded-lg object-contain z-10" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center backdrop-blur-sm">
                  <p className="text-white font-bold bg-slate-800/90 px-4 py-2 rounded-md border border-slate-600 shadow-md">Change Photo</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-white p-4 rounded-full inline-block mb-4 border border-slate-200 shadow-sm group-hover:border-blue-300 transition-colors">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm font-bold text-slate-700">Upload Reference Photo</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">JPG/PNG (Max 5MB)</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <User className="w-5 h-5" />
          Complete Enrollment
        </motion.button>
      </form>
    </motion.div>
  );
};

export const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students`);
      setStudents(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (name) => {
    if(window.confirm(`Are you sure you want to remove ${name} from the directory?`)) {
      await axios.delete(`${API_BASE_URL}/api/students/${name}`);
      fetchStudents();
    }
  };

  if (loading) return <div className="text-slate-500 font-medium text-center mt-20 animate-pulse">Loading directory...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Active Directory</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Manage enrolled subjects.</p>
          </div>
        </div>
        <span className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-bold shadow-sm">
          {students.length} Records
        </span>
      </div>
      <div className="p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <AnimatePresence>
          {students.length > 0 ? students.map((student, i) => {
            const safeName = student.name.replace(/[^a-zA-Z0-9 ]/g, "");
            return (
              <motion.div 
                key={student.id} 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div className="aspect-square relative bg-slate-100 border-b border-slate-200">
                  <img src={`${API_BASE_URL}/known_faces/${safeName}.jpg`} alt={student.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => {e.target.src = 'https://via.placeholder.com/150/f8fafc/94a3b8?text=No+Photo'}} />
                  
                  <motion.button 
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(student.name)} 
                    className="absolute top-3 right-3 bg-white text-red-600 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm border border-slate-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="p-4 bg-white relative z-10">
                  <p className="font-bold text-slate-800 truncate text-base">{student.name}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">{student.roll_no || 'N/A'} • {student.department || 'N/A'}</p>
                </div>
              </motion.div>
            )
          }) : (
            <div className="col-span-full text-center py-20 text-slate-500 font-medium">Directory is empty.</div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
