import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, AlertCircle, Clock } from 'lucide-react';

function App() {
  const [controls, setControls] = useState([]);

  // Data fetch karne ke liye
  useEffect(() => {
    axios.get('http://localhost:5000/api/controls')
      .then(res => setControls(res.data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  // UPDATE STATUS LOGIC (Yahan hona chahiye)
  const updateStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Compliant' ? 'Non-Compliant' : 'Compliant';
    try {
      await axios.put(`http://localhost:5000/api/controls/${id}`, { status: nextStatus });
      setControls(controls.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Compliant') return <ShieldCheck className="text-green-500" />;
    if (status === 'Non-Compliant') return <AlertCircle className="text-red-500" />;
    return <Clock className="text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-10 border-b border-gray-700 pb-5">
        <h1 className="text-3xl font-bold text-blue-400">Compliance Armor GRC</h1>
        <p className="text-gray-400">Cybersecurity Audit Dashboard</p>
      </header>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Control Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => (
              <tr key={control.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="p-4 font-mono text-blue-300">{control.control_id}</td>
                <td className="p-4">
                  <div className="font-semibold">{control.title}</div>
                  <div className="text-xs text-gray-400">{control.description}</div>
                </td>
                <td className="p-4 flex items-center gap-2">
                  {getStatusIcon(control.status)} {control.status}
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => updateStatus(control.id, control.status)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition"
                  >
                    Toggle Status
                  </button>
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
