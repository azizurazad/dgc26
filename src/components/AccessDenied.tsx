import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowLeft, KeyRound, UserMinus } from 'lucide-react';
import { Student } from '../types';

interface AccessDeniedProps {
  currentUser: Student | null;
  isAuthenticated: boolean;
  onGoBack: () => void;
  onTriggerLogin: () => void;
}

export default function AccessDenied({ 
  currentUser, 
  isAuthenticated, 
  onGoBack, 
  onTriggerLogin 
}: AccessDeniedProps) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#0B0B0B] px-4 py-20 relative select-none">
      
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1200')` }}
      />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0B0B0B] pointer-events-none" />

      {/* Frame Corners */}
      <div className="absolute top-10 left-10 w-8 h-8 border-t border-l border-red-900/30 hidden md:block" />
      <div className="absolute top-10 right-10 w-8 h-8 border-t border-r border-red-900/30 hidden md:block" />
      <div className="absolute bottom-10 left-10 w-8 h-8 border-b border-l border-red-900/30 hidden md:block" />
      <div className="absolute bottom-10 right-10 w-8 h-8 border-b border-r border-red-900/30 hidden md:block" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-[#111111]/80 border border-red-900/25 rounded-xs p-8 md:p-12 text-center backdrop-blur-xl relative shadow-2xl"
      >
        {/* Warning Indicator */}
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-950/25 border border-red-900/35 mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-red-500/5 animate-ping" />
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>

        {/* Content Header */}
        <div className="space-y-2 mb-8">
          <span className="text-[10px] font-mono tracking-[0.4em] text-red-500 uppercase font-bold">
            ERROR 403 - FORBIDDEN ZONE
          </span>
          <h2 className="font-serif text-2xl font-light tracking-wide text-white uppercase">
            প্রবেশাধিকার নিষিদ্ধ
          </h2>
          <p className="text-xs text-[#8F6A48] font-mono uppercase tracking-widest mt-1">
            Access Verification Denied
          </p>
        </div>

        {/* Informative description */}
        <div className="space-y-4 mb-8 bg-[#0D0D0D] p-5 border border-red-900/10 rounded-xs">
          <p className="text-xs text-[#F5F2EE]/75 leading-relaxed">
            এই এলাকাটি শুধুমাত্র <span className="text-[#C79A6B] font-bold">সুপার অ্যাডমিন (Super Admin)</span> অ্যাক্সেসের জন্য সংরক্ষিত। সাধারণ শিক্ষার্থীদের এই ড্যাশবোর্ডে প্রবেশের অনুমতি নেই।
          </p>
          <p className="text-[11px] text-gray-500 italic">
            This workspace is strictly restricted to department administrators. General botanical directories or resources remain public.
          </p>
        </div>

        {/* Session Status Summary */}
        <div className="mb-8 border-t border-white/5 pt-5 text-left space-y-2 text-[11px] font-mono">
          <div className="flex justify-between items-center py-1 border-b border-white/5">
            <span className="text-gray-500">AUTHENTICATION STATUS:</span>
            <span className={isAuthenticated ? 'text-emerald-500 font-bold' : 'text-red-500'}>
              {isAuthenticated ? 'VERIFIED USER' : 'UNAUTHENTICATED'}
            </span>
          </div>
          {isAuthenticated && currentUser && (
            <>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-500">CURRENT USER:</span>
                <span className="text-white">{currentUser.name} ({currentUser.rollNumber})</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">ASSIGNED PORTAL ROLE:</span>
                <span className="text-amber-500 font-bold uppercase">{currentUser.role || 'student'}</span>
              </div>
            </>
          )}
        </div>

        {/* Elegant Action triggers */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGoBack}
            className="w-full sm:w-auto px-6 py-3 border border-[#C79A6B]/30 hover:border-[#C79A6B] hover:text-black hover:bg-[#C79A6B] text-xs font-mono tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Campus</span>
          </button>

          {(!isAuthenticated || currentUser?.role !== 'super_admin') && (
            <button
              onClick={onTriggerLogin}
              className="w-full sm:w-auto px-6 py-3 bg-[#C79A6B] text-black hover:bg-[#b08456] text-xs font-mono tracking-widest uppercase font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Verify Super Admin</span>
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}
