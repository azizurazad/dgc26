import { Leaf, Award, Landmark, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import logoUrl from '../assets/logo.svg';

interface FooterProps {
  sessionYear: string;
  onViewChange: (view: 'site' | 'admin' | 'community') => void;
  onNavigate: (sectionId: string) => void;
  isAuthenticated: boolean;
}

export default function Footer({ sessionYear, onViewChange, onNavigate, isAuthenticated }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (target: string) => {
    onViewChange('site');
    // Allow DOM to render then scroll
    setTimeout(() => {
      onNavigate(target);
    }, 100);
  };

  return (
    <footer className="relative bg-[#0B0B0B] text-[#F5F2EE] px-6 md:px-12 pt-20 pb-12 border-t border-[#C79A6B]/20">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#C79A6B]/40 to-transparent pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto space-y-16">
        
        {/* Upper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 items-start">
          
          {/* Logo & Narrative (Col span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-[#C79A6B]/30 flex items-center justify-center bg-white overflow-hidden p-0.5">
                <img src={logoUrl} alt="DGC Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="font-serif tracking-[0.2em] text-sm md:text-base font-medium text-[#F5F2EE] uppercase">
                BOTANY NEXUS <span className="font-serif italic text-[#C79A6B]">DGC</span>
              </span>
            </div>

            <p className="text-xs text-[#F5F2EE]/55 leading-relaxed font-light max-w-sm">
              The systematic digital herbarium archive of the Department of Botany, Dinajpur Government College. Dedicated to preserving knowledge, species taxonomy, and regional plant lore through rigorous empirical documentation.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-[#C79A6B]/15 bg-[#111111] text-[9px] font-mono text-[#8F6A48] uppercase">
                <Landmark className="w-3 h-3 text-[#C79A6B]" /> Govt. College
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-[#C79A6B]/15 bg-[#111111] text-[9px] font-mono text-[#8F6A48] uppercase">
                <Award className="w-3 h-3 text-[#C79A6B]" /> Session {sessionYear}
              </div>
            </div>
          </div>

          {/* Quick Section Navigation (Col span 3) - Only show if Authenticated */}
          {isAuthenticated ? (
            <div className="lg:col-span-3 space-y-4 text-left">
              <h5 className="text-[10px] font-mono tracking-widest text-[#C79A6B] uppercase font-bold">
                NAVIGATION
              </h5>
              <ul className="space-y-2 text-xs font-mono">
                {[
                  { name: 'Philosophy Dialogue', target: 'philosophy' },
                  { name: 'Specimen Archive', target: 'archive' },
                  { name: 'Community Registry', target: 'community' },
                  { name: 'Visual Journal', target: 'gallery' },
                  { name: 'Publication Keys', target: 'resources' }
                ].map(link => (
                  <li key={link.target}>
                    <button
                      onClick={() => handleLinkClick(link.target)}
                      className="text-[#F5F2EE]/60 hover:text-[#C79A6B] uppercase tracking-wider transition-colors duration-300 text-left cursor-pointer"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="lg:col-span-3 space-y-4 text-left">
              <h5 className="text-[10px] font-mono tracking-widest text-[#8F6A48] uppercase font-bold">
                INTRAMURALLY SECURED
              </h5>
              <p className="text-xs text-[#8F6A48]/80 leading-relaxed font-light">
                Please login with your roll number to access section navigation paths and private academic keys.
              </p>
            </div>
          )}

          {/* Institutional details (Col span 4) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <h5 className="text-[10px] font-mono tracking-widest text-[#C79A6B] uppercase font-bold">
              CURATORIAL HEADQUARTERS
            </h5>
            <div className="text-xs space-y-1.5 font-light text-[#F5F2EE]/65">
              <p className="font-serif">Department of Botany</p>
              <p>Dinajpur Government College</p>
              <p>Dinajpur, Bangladesh</p>
              <p className="pt-2 font-mono text-[10px] text-[#8F6A48]">Inquiries: botany@dgc.edu</p>
            </div>
          </div>

        </div>

        {/* Lower copyright bar */}
        <div className="border-t border-[#C79A6B]/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-mono text-[#8F6A48]/70 uppercase tracking-widest">
          <div>
            © {currentYear} Botany Nexus DGC • Dinajpur Government College
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onDoubleClick={() => onViewChange('admin')}
              className="hover:text-[#C79A6B] transition-colors duration-300 cursor-pointer"
              title="Double-click to access admin gateway"
            >
              System Gateway
            </button>
            <span className="text-[#C79A6B]/40">|</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Database
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
