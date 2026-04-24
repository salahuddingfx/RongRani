import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Copy, Check, AlertTriangle, ShieldCheck, RefreshCcw, XCircle } from 'lucide-react';
import axios from 'axios';

const AdminSecurity = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [step, setStep] = useState('initial'); // initial, enabled

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIs2FAEnabled(response.data.data.isTwoFactorEnabled || false);
      if (response.data.data.isTwoFactorEnabled) {
        setStep('enabled');
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    }
  };

  const setupPin = async () => {
    if (!pin || pin.length < 4) {
      setMessage({ type: 'error', text: 'PIN must be at least 4 digits' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/2fa/setup', { pin }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIs2FAEnabled(true);
      setStep('enabled');
      setPin('');
      setMessage({ type: 'success', text: 'Security PIN has been set and 2FA enabled!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to set PIN' });
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!pin) {
      setMessage({ type: 'error', text: 'Please enter your current PIN to disable 2FA.' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/2fa/disable', { pin }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIs2FAEnabled(false);
      setStep('initial');
      setPin('');
      setMessage({ type: 'success', text: 'Two-Factor Authentication has been disabled.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Invalid PIN' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-maroon flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Security Settings
        </h1>
        <p className="text-slate-600 mt-2">Manage your account security and your personal Security PIN.</p>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-xl border-l-4 flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' :
          message.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
          'bg-blue-50 border-blue-500 text-blue-800'
        }`}>
          {message.type === 'success' ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="card bg-white p-8 border border-slate-100 shadow-soft rounded-[30px]">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${is2FAEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  <Smartphone className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Security PIN</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Your personal code for 2FA verification.
                  </p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                is2FAEnabled ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>

            {step === 'initial' && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-700 font-medium leading-relaxed">
                    Set a secure PIN that you will use to verify your identity every time you log in. This adds an essential second layer of protection to your account.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Set New Security PIN</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="password"
                      placeholder="••••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input-field text-center text-3xl tracking-[0.5em] font-black max-w-[240px] py-4 rounded-2xl border-2 border-slate-200 focus:border-maroon focus:ring-0 transition-all"
                    />
                    <button
                      onClick={setupPin}
                      disabled={loading || pin.length < 4}
                      className="btn-primary flex-1 py-4 rounded-2xl font-black text-lg shadow-xl shadow-maroon/20 hover:bg-[#701e2a] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCcw className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                      Enable Security PIN
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-medium italic">* Enter 4 to 6 digits. Keep this PIN safe.</p>
                </div>
              </div>
            )}

            {step === 'enabled' && (
              <div className="bg-emerald-50 p-8 rounded-[30px] border border-emerald-100 shadow-inner">
                <div className="flex items-center gap-3 text-emerald-800 text-xl font-black mb-4">
                  <ShieldCheck className="h-8 w-8" />
                  Protection Active
                </div>
                <p className="text-emerald-700 font-medium leading-relaxed mb-10">
                  Your account is now secured with a Security PIN. You will be prompted to enter this PIN whenever you access the admin panel.
                </p>
                
                <div className="pt-6 border-t border-emerald-200/50">
                  <label className="block text-sm font-black text-emerald-800 mb-3 uppercase tracking-wider">Enter PIN to Disable</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <input
                      type="password"
                      placeholder="••••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input-field text-center text-2xl font-black tracking-[0.5em] max-w-[180px] py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-0 bg-white"
                    />
                    <button
                      onClick={disable2FA}
                      disabled={loading || !pin}
                      className="bg-white hover:bg-red-50 text-red-600 px-8 py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 border-2 border-red-100 hover:border-red-200 shadow-sm"
                    >
                      {loading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                      Disable PIN Protection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-maroon to-[#6A112B] text-white p-8 shadow-xl rounded-[30px] relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <h4 className="font-black text-xl mb-6 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-pink-300" />
              Security Tips
            </h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                <p className="text-sm font-medium text-pink-50 leading-relaxed opacity-90">
                  Choose a PIN that is easy for you to remember but hard for others to guess.
                </p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                <p className="text-sm font-medium text-pink-50 leading-relaxed opacity-90">
                  Do not use obvious sequences like "1234" or your birth date.
                </p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                <p className="text-sm font-medium text-pink-50 leading-relaxed opacity-90">
                  If you ever suspect your PIN has been compromised, change it immediately here.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;
