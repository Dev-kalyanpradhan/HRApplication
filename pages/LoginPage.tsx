

import React, { useState } from 'react';
import { Zap, AlertTriangle, Globe, Linkedin, Instagram } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const LoginPage: React.FC = () => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, companyLogo } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(employeeCode, password);
      // On success, the App component will automatically redirect
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          {companyLogo ? (
              <img src={companyLogo} alt="Company Logo" className="h-10 w-auto object-contain" />
          ) : (
              <Zap className="text-blue-500" size={32} />
          )}
          <h1 className="text-4xl font-bold ml-2 text-slate-800">AI4S Smart HR</h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-center text-slate-700 mb-1">Welcome Back!</h2>
          <p className="text-center text-slate-500 mb-6">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="employeeCode" className="block text-sm font-medium text-slate-700 mb-1">
                Employee Code or Login ID
              </label>
              <input
                id="employeeCode"
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                required
                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                <AlertTriangle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </div>
        
      </div>
      <div className="mt-8 text-center">
        <div className="flex justify-center items-center gap-6">
          <a href="https://ai4spro.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors" aria-label="Visit our website">
            <Globe size={24} />
          </a>
          <a href="https://in.linkedin.com/company/ai4ssolutions" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors" aria-label="Follow us on LinkedIn">
            <Linkedin size={24} />
          </a>
          <a href="https://www.instagram.com/ai4s.solutions/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors" aria-label="Follow us on Instagram">
            <Instagram size={24} />
          </a>
        </div>
      </div>
       <p className="text-xs text-slate-400 text-center mt-4">&copy; 2025 AI4S Solutions.</p>
    </div>
  );
};

export default LoginPage;
