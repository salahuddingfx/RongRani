import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Copy, Check, AlertTriangle, ShieldCheck, RefreshCcw, XCircle } from 'lucide-react';
import axios from 'axios';

const AdminSecurity = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [step, setStep] = useState('initial'); // initial, setup, enabled

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

  const startSetup = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/auth/2fa/setup', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSetupData(response.data.data);
      setStep('setup');
      setMessage({ type: 'info', text: 'Scan the QR code with Google Authenticator or Authy.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to start 2FA setup' });
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!verificationCode) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/2fa/verify', { otp: verificationCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIs2FAEnabled(true);
      setStep('enabled');
      setMessage({ type: 'success', text: 'Two-Factor Authentication has been enabled!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Invalid verification code' });
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!verificationCode) {
      setMessage({ type: 'error', text: 'Please enter the code from your app to disable 2FA.' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/2fa/disable', { otp: verificationCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIs2FAEnabled(false);
      setStep('initial');
      setVerificationCode('');
      setMessage({ type: 'success', text: 'Two-Factor Authentication has been disabled.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to disable 2FA' });
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
        <p className="text-slate-600 mt-2">Manage your account security and two-factor authentication.</p>
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
          <div className="card bg-white p-8 border border-slate-100 shadow-soft">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${is2FAEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Two-Factor Authentication (2FA)</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Adds an extra layer of security to your account.
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                is2FAEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>

            {step === 'initial' && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-700 mb-6 leading-relaxed">
                  Protect your account with an extra layer of security. When enabled, you will need to provide a unique code from your authenticator app each time you log in.
                </p>
                <button
                  onClick={startSetup}
                  disabled={loading}
                  className="btn-primary w-full md:w-auto px-8 py-3 flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Smartphone className="h-5 w-5" />}
                  Enable Two-Factor Authentication
                </button>
              </div>
            )}

            {step === 'setup' && setupData && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800">1. Scan QR Code</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Scan this code with Google Authenticator, Authy, or any TOTP app. 
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between group">
                      <code className="text-maroon font-bold tracking-widest">{setupData.secret}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(setupData.secret);
                          setMessage({ type: 'success', text: 'Secret copied to clipboard!' });
                        }}
                        className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 group-hover:text-maroon"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800">2. Enter Verification Code</h4>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input-field text-center text-2xl tracking-[0.5em] font-black max-w-[200px]"
                    />
                    <button
                      onClick={verifySetup}
                      disabled={loading || verificationCode.length !== 6}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                      Verify & Enable
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 'enabled' && (
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3 text-emerald-800 font-bold mb-4">
                  <ShieldCheck className="h-6 w-6" />
                  Your account is protected
                </div>
                <p className="text-emerald-700 text-sm leading-relaxed mb-6">
                  Two-factor authentication is currently active on your account. To disable it, please enter the current code from your authenticator app below.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs font-bold text-emerald-800 mb-1">Enter Code to Disable</label>
                    <input
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input-field text-center font-bold tracking-widest max-w-[160px] border-emerald-200 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    onClick={disable2FA}
                    disabled={loading || verificationCode.length !== 6}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-red-100"
                  >
                    {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Disable 2FA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-maroon text-white p-6 shadow-lg">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-pink-300" />
              Security Tips
            </h4>
            <ul className="space-y-4 text-sm text-pink-100 opacity-90">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-1.5 shrink-0" />
                Never share your 2FA secret or recovery codes with anyone.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-1.5 shrink-0" />
                Use a trusted authenticator app like Google Authenticator or Bitwarden.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-1.5 shrink-0" />
                If you lose your phone, you will need your backup secret to regain access.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;
