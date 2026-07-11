import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, LogIn, RefreshCw, User, Mail, Hash, ShieldCheck, ShieldAlert, Award
} from 'lucide-react';
import { Student } from '../types';

interface PortalLoginProps {
  students: Student[];
  onLoginSuccess: (student: Student) => void;
  onClose: () => void;
}

export default function PortalLogin({ 
  students, 
  onLoginSuccess, 
  onClose 
}: PortalLoginProps) {
  // Input fields
  const [email, setEmail] = useState('');
  const [roll, setRoll] = useState('');
  const [fullName, setFullName] = useState('');
  
  // App UI states
  const [showNameModal, setShowNameModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form submission - step 1 & 2
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !roll.trim()) {
      setError('দয়া করে আপনার ইমেল এবং রোল নম্বর প্রদান করুন।');
      return;
    }
    // Open the premium full name modal
    setShowNameModal(true);
  };

  // Verification process - step 3
  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setError(null);
    setIsLoading(true);

    // Simulate luxury verification loader for premium aesthetic
    setTimeout(() => {
      const inputEmail = email.trim().toLowerCase();
      const inputRoll = roll.trim().toLowerCase();
      const inputName = fullName.trim().toLowerCase();

      // Helper function to check if names are highly similar (tolerant of dots, spelling, spacing, and casing differences)
      const isNameSimilar = (name1: string, name2: string): boolean => {
        const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const c1 = clean(name1);
        const c2 = clean(name2);
        if (!c1 || !c2) return false;
        return c1 === c2 || c1.includes(c2) || c2.includes(c1);
      };

      // Check for Super Admin bypass / hardcoded spec
      // Email: mr4233388@gmail.com
      // Roll: 73
      // Name: Masud Rana Bappii
      const isSuperAdminMatch = 
        inputEmail === 'mr4233388@gmail.com' && 
        inputRoll === '73' && 
        (isNameSimilar(inputName, 'masud rana bappii') || isNameSimilar(inputName, 'masud rana bappi'));

      let matchedStudent: Student | undefined = undefined;

      if (isSuperAdminMatch) {
        // Find existing or construct super admin session student
        matchedStudent = students.find(s => s.email.toLowerCase() === 'mr4233388@gmail.com');
        if (!matchedStudent) {
          // Fallback structure in case it wasn't preloaded in directory
          matchedStudent = {
            id: 'student-super-admin',
            full_name: 'Masud Rana Bappii',
            name: 'Masud Rana Bappii',
            email: 'mr4233388@gmail.com',
            roll: '73',
            rollNumber: '73',
            registration: 'DGC-2025-0073',
            registrationNumber: 'DGC-2025-0073',
            studentId: 'DGC-2025-0073',
            batch: '21st Batch',
            session: '2025-2026',
            profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            role: 'super_admin',
            skills: ['Super Admin Powers', 'Full Database Control'],
            interests: ['Academic Systems', 'Database Optimization'],
            contributions: 73,
            badge: 'Super Admin',
            bio: 'Super Admin & Lead Curator for Department Access Verification and Campus Botanical Registries.'
          };
        } else {
          matchedStudent = { ...matchedStudent, role: 'super_admin' };
        }
      } else {
        // Search student database with highly robust and flexible multi-criteria matching:
        // We look for any student who matches the roll, and then loosely matches email or name.
        // This solves issues with auto-generated domain emails vs personal emails, minor spelling mistakes, etc.
        matchedStudent = students.find(s => {
          const dbEmail = (s.email || '').trim().toLowerCase();
          const dbRoll = (s.roll || s.rollNumber || '').trim().toLowerCase();
          const dbName = (s.full_name || s.name || '').trim().toLowerCase();

          const rollMatches = dbRoll === inputRoll;
          const emailMatches = dbEmail === inputEmail;
          const nameMatches = isNameSimilar(dbName, inputName);

          // Standard 3-point matches
          if (emailMatches && rollMatches && nameMatches) return true;

          // Highly flexible matches:
          // 1. Roll matches and Name matches loosely (handles cases where email is blank/generated as name@dgc.edu but user types personal email)
          if (rollMatches && nameMatches) return true;

          // 2. Email matches and Roll matches (handles minor name typos)
          if (emailMatches && rollMatches) return true;

          // 3. Email matches and Name matches loosely (handles roll number format variations)
          if (emailMatches && nameMatches) return true;

          return false;
        });
      }

      if (matchedStudent) {
        // Force status check if present
        if (matchedStudent.status === 'Inactive') {
          setError('আপনার অ্যাকাউন্টটি সাময়িকভাবে নিষ্ক্রিয় করা হয়েছে। অনুগ্রহ করে প্রশাসকের সাথে যোগাযোগ করুন।');
          setIsLoading(false);
          setShowNameModal(false);
          return;
        }

        // Access Granted! Save persistent session in localStorage
        localStorage.setItem('dgc_verified_student', JSON.stringify(matchedStudent));
        onLoginSuccess(matchedStudent);
        setIsLoading(false);
        setShowNameModal(false);
      } else {
        // Failed verification
        setError('আপনার তথ্য আমাদের Student Directory-এর সাথে মিলছে না। অনুগ্রহ করে সঠিক তথ্য দিন অথবা প্রশাসকের সাথে যোগাযোগ করুন।');
        setIsLoading(false);
        setShowNameModal(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-[#0B0B0B]/95 px-4 md:px-6 py-12 select-none">
      
      {/* Botanical Overlay Backing */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.07] pointer-events-none scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200')` }}
      />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0B0B0B] pointer-events-none" />

      {/* Luxury Botanical Top Gradient Rim */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-950 via-[#C79A6B] to-emerald-950" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Editorial Corner Lines */}
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t border-l border-[#C79A6B]/40" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t border-r border-[#C79A6B]/40" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b border-l border-[#C79A6B]/40" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b border-r border-[#C79A6B]/40" />

        <div className="bg-[#111111]/90 border border-[#C79A6B]/20 rounded-xs p-6 md:p-8 backdrop-blur-xl shadow-2xl relative space-y-6">
          
          {/* Close Trigger */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#8F6A48] hover:text-[#F5F2EE] border border-transparent hover:border-[#C79A6B]/20 transition-all rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Core Login Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 flex items-center justify-center border border-[#C79A6B]/30 bg-[#0B0B0B] rounded-xs shadow-inner">
              <Award className="w-6 h-6 text-[#C79A6B]" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[8px] font-mono tracking-[0.4em] text-[#C79A6B] uppercase font-bold block">
                Department Access Verification
              </span>
              <h2 className="font-serif text-xl font-light text-[#F5F2EE] uppercase tracking-wider">
                Student Directory Portal
              </h2>
              <p className="text-[10px] text-[#8F6A48] font-light max-w-xs mx-auto leading-relaxed">
                অনুগ্রহ করে আপনার অ্যাকাউন্টের অ্যাক্সেস যাচাই করার জন্য প্রাতিষ্ঠানিক তথ্য প্রদান করুন।
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleContinue} className="space-y-5 text-left">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono tracking-widest text-[#8F6A48] uppercase font-bold block">
                Institutional Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. name@dgc.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-[#0B0B0B]/80 border border-[#C79A6B]/20 focus:border-[#C79A6B]/60 text-xs font-mono text-[#F5F2EE] py-3 pl-10 pr-4 rounded-none outline-none transition-all placeholder:text-[#8F6A48]/25"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F6A48]">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Roll Number Field */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono tracking-widest text-[#8F6A48] uppercase font-bold block">
                Class Roll Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 10112 or 73"
                  value={roll}
                  onChange={(e) => {
                    setRoll(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-[#0B0B0B]/80 border border-[#C79A6B]/20 focus:border-[#C79A6B]/60 text-xs font-mono text-[#F5F2EE] py-3 pl-10 pr-4 rounded-none outline-none transition-all placeholder:text-[#8F6A48]/25"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F6A48]">
                  <Hash className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-950/20 border border-red-900/35 text-xs text-red-400 rounded-none flex items-start gap-2.5 leading-relaxed"
              >
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Trigger */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#C79A6B] hover:bg-transparent border border-[#C79A6B] text-black hover:text-[#C79A6B] font-mono text-xs tracking-widest uppercase font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Continue Verification</span>
            </button>



          </form>
        </div>
      </motion.div>

      {/* Step 3: Premium Name Verification Modal */}
      <AnimatePresence>
        {showNameModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#0D0D0D] border border-[#C79A6B]/30 rounded-xs p-6 md:p-8 space-y-6 shadow-2xl relative text-left"
            >
              {/* Corner Accents */}
              <div className="absolute -top-3 -left-3 w-5 h-5 border-t border-l border-[#C79A6B]/40" />
              <div className="absolute -top-3 -right-3 w-5 h-5 border-t border-r border-[#C79A6B]/40" />
              <div className="absolute -bottom-3 -left-3 w-5 h-5 border-b border-l border-[#C79A6B]/40" />
              <div className="absolute -bottom-3 -right-3 w-5 h-5 border-b border-r border-[#C79A6B]/40" />

              <button
                onClick={() => setShowNameModal(false)}
                className="absolute top-4 right-4 p-1.5 text-[#8F6A48] hover:text-[#F5F2EE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-950/40 border border-[#C79A6B]/25 flex items-center justify-center text-[#C79A6B]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-light text-[#F5F2EE] uppercase tracking-wider">
                  চূড়ান্ত যাচাইকরণ
                </h3>
                <p className="text-[10px] text-[#8F6A48] font-mono uppercase tracking-widest">
                  Departmental Access Verification
                </p>
              </div>

              <form onSubmit={handleVerifyAndLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-serif tracking-wide text-[#C79A6B] block">
                    আপনার পূর্ণ নাম লিখুন (Enter Full Name)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="e.g. Masud Rana Bappii"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#111111] border border-[#C79A6B]/30 focus:border-[#C79A6B] text-xs text-white p-3.5 pl-10 rounded-none outline-none transition-all placeholder:text-[#8F6A48]/25"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F6A48]">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="bg-[#161616] p-3 border border-white/5 rounded-none space-y-1.5 text-[10px] font-mono text-[#8F6A48]">
                  <div className="flex justify-between">
                    <span>EMAIL:</span>
                    <span className="text-white font-semibold">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROLL NUMBER:</span>
                    <span className="text-white font-semibold">{roll}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 font-mono text-[10px] uppercase tracking-wider pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNameModal(false)}
                    className="px-4 py-2.5 border border-[#C79A6B]/20 text-[#8F6A48] hover:text-white transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !fullName.trim()}
                    className="px-5 py-2.5 bg-[#C79A6B] text-black hover:bg-[#b08456] disabled:bg-gray-800 disabled:text-gray-500 font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>যাচাই করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>প্রবেশ করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
