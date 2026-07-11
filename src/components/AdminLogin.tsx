import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, KeyRound, Eye, EyeOff, ArrowLeft, Leaf, Lock } from 'lucide-react';
import logoUrl from '../assets/logo.svg';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLogin({ onLoginSuccess, onCancel }: AdminLoginProps) {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate authentic security delay
    setTimeout(() => {
      if (passcode.trim().toLowerCase() === 'admin' || passcode.trim() === 'botany2026') {
        onLoginSuccess();
      } else {
        setError('Access Denied: Invalid security signature or passcode.');
        setIsLoading(false);
      }
    }, 600);
  };

  const handleQuickBypass = () => {
    setPasscode('admin');
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess();
    }, 350);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-[#0B0B0B] text-[#F5F2EE] px-6 py-20 select-none overflow-hidden">
      
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200')` }}
      />
      
      {/* Editorial Decorative Grid lines */}
      <div className="absolute inset-0 pointer-events-none border-x border-[#C79A6B]/5 max-w-7xl mx-auto flex justify-between">
        <div className="w-[1px] h-full border-r border-[#C79A6B]/5 ml-1/4 hidden lg:block" />
        <div className="w-[1px] h-full border-r border-[#C79A6B]/5 mr-1/4 hidden lg:block" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Return Button */}
        <button
          onClick={onCancel}
          className="group flex items-center gap-2 mb-8 text-xs font-mono text-[#8F6A48] hover:text-[#C79A6B] transition-all uppercase tracking-widest cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Public Site
        </button>

        {/* Central Card */}
        <div className="bg-[#111111]/90 border border-[#C79A6B]/20 rounded p-8 md:p-10 backdrop-blur-xl shadow-2xl relative">
          
          {/* Top Frame Gold Accents */}
          <div className="absolute top-0 left-0 w-8 h-[1px] bg-[#C79A6B]" />
          <div className="absolute top-0 left-0 w-[1px] h-8 bg-[#C79A6B]" />
          <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-[#C79A6B]" />
          <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-[#C79A6B]" />

          {/* Icon Header */}
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="w-14 h-14 flex items-center justify-center border border-[#C79A6B]/40 bg-white rounded-full p-1 overflow-hidden shadow-md">
              <img src={logoUrl} alt="DGC Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-[0.35em] text-[#C79A6B] uppercase font-bold">
                Security Protocol
              </span>
              <h2 className="font-serif text-2xl font-light text-white uppercase tracking-wider">
                Nexus <span className="font-serif italic text-[#C79A6B]">Curator Portal</span>
              </h2>
              <p className="text-[10.5px] text-[#8F6A48] font-light max-w-xs leading-relaxed">
                Authorized students & department curators only.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-mono tracking-widest text-[#8F6A48] uppercase font-bold">
                  Administrative Passcode
                </label>
                <span className="text-[8px] font-mono text-[#8F6A48]/50 uppercase">
                  hint: admin
                </span>
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter secure passcode..."
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isLoading}
                  className="w-full bg-[#0B0B0B] border border-[#C79A6B]/30 focus:border-[#C79A6B] text-sm font-mono text-center tracking-widest text-[#F5F2EE] py-3.5 px-10 rounded outline-none transition-all placeholder:text-[#8F6A48]/40 placeholder:tracking-normal disabled:opacity-50"
                />
                
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F6A48]/70">
                  <KeyRound className="w-4 h-4" />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8F6A48] hover:text-[#C79A6B] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-950/20 border border-red-900/30 rounded flex items-start gap-2 text-xs font-mono text-red-400"
              >
                <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 border border-[#C79A6B] bg-[#C79A6B] hover:bg-transparent text-black hover:text-[#C79A6B] font-mono text-xs tracking-widest uppercase font-bold rounded cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-[#0B0B0B] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Access Database</>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickBypass}
                disabled={isLoading}
                className="w-full py-2.5 bg-[#111111] hover:bg-[#C79A6B]/5 border border-[#C79A6B]/15 hover:border-[#C79A6B]/30 text-[#C79A6B] font-mono text-[10px] tracking-widest uppercase rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Leaf className="w-3.5 h-3.5" />
                Quick Unlock (Bypass)
              </button>
            </div>
          </form>
        </div>

        {/* Curator footer notice */}
        <p className="mt-6 text-center text-[9px] font-mono text-[#8F6A48] tracking-widest uppercase">
          Department of Botany • Dinajpur Govt. College
        </p>
      </motion.div>
    </div>
  );
}
