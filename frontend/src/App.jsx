import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, AlertCircle, Clock, Upload, Lock, LogOut, FileCheck } from 'lucide-react';

function App() {
  const [controls, setControls] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Headers helper
  const getAuthHeaders = (t) => ({
    headers: { Authorization: `Bearer ${t || token}` }
  });

  const fetchControls = async (userToken) => {
    const activeToken = userToken || token;
    if (!activeToken) return;
    try {
      const res = await axios.get('http://localhost:5000/api/controls', getAuthHeaders(activeToken));
      setControls(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) handleLogout();
    }
  };

  useEffect(() => {
    if (token) fetchControls();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      fetchControls(res.data.token);
    } catch (err) { alert("Invalid Credentials!"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const updateStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Compliant' ? 'Non-Compliant' : 'Compliant';
    try {
      await axios.put(`http://localhost:5000/api/controls/${id}`, { status: nextStatus }, getAuthHeaders());
      fetchControls();
    } catch (err) { console.error("Update failed"); }
  };

  const handleFileUpload = async (id, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('evidence', file);
    try {
      await axios.post(`http://localhost:5000/api/upload/${id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Evidence Uploaded!");
      fetchControls();
    } catch (err) { alert("Upload failed"); }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 font-sans">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-2xl border border-gray-700 w-full max-w-sm shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-500/10 p-3 rounded-full mb-3"><Lock className="text-blue-400" /></div>
            <h2 className="text-2xl font-bold text-white">Auditor Login</h2>
          </div>
          <input type="text" placeholder="Username" className="w-full p-3 mb-3 bg-gray-700 border border-gray-600 rounded-lg text-white outline-none focus:border-blue-500" onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full p-3 mb-6 bg-gray-700 border border-gray-600 rounded-lg text-white outline-none focus:border-blue-500" onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold text-white transition">Access System</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10 font-sans">
      <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 tracking-tight">Compliance Armor</h1>
          <p className="text-gray-500 text-sm font-mono mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Secure Audit Session
          </p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-gray-800 hover:bg-red-900/30 text-gray-400 hover:text-red-400 px-4 py-2 rounded-lg border border-gray-700 transition">
          <LogOut size={18} /> Logout
        </button>
      </header>

      <div className="grid grid-cols-1 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50 text-gray-400 text-xs uppercase tracking-widest">
            <tr>
              <th className="p-5">Control ID</th>
              <th className="p-5">Framework Detail</th>
              <th className="p-5">Audit Status</th>
              <th className="p-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {controls.map(c => (
              <tr key={c.id} className="hover:bg-gray-700/20 transition">
                <td className="p-5 font-mono text-blue-300 font-bold">{c.control_id}</td>
                <td className="p-5">
                  <p className="font-semibold">{c.title}</p>
                  {c.evidence_path && <p className="text-[10px] text-green-500 mt-1 flex items-center gap-1"><FileCheck size={12}/> Evidence Logged</p>}
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${c.status === 'Compliant' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-5 flex items-center gap-4">
                  <button onClick={() => updateStatus(c.id, c.status)} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md transition">Toggle</button>
                  <label className="cursor-pointer bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 p-2 rounded-md transition border border-blue-500/20">
                    <Upload size={16} />
                    <input type="file" className="hidden" onChange={e => handleFileUpload(c.id, e.target.files[0])} />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
