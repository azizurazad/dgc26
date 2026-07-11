import { motion } from 'motion/react';
import { ChevronDown, ArrowRight, Award, Compass, Heart, Users, Lock, Key } from 'lucide-react';
import { AppStats } from '../types';

interface HeroProps {
  stats: AppStats;
  heroBgImage?: string;
  heroBgBrightness?: number;
  heroBgBlur?: number;
  onExploreArchive: () => void;
  onMeetContributors: () => void;
  isAuthenticated: boolean;
  onLoginClick: () => void;
}

export default function Hero({ 
  stats, 
  heroBgImage, 
  heroBgBrightness = 65, 
  heroBgBlur = 0, 
  onExploreArchive, 
  onMeetContributors,
  isAuthenticated,
  onLoginClick
}: HeroProps) {
  // Generate random coordinates/speeds for dust particles
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * -20,
  }));

  const statsItems = [
    { value: `${stats.plantsCount}+`, label: 'Plant Records', icon: Compass },
    { value: `${stats.studentsCount}+`, label: 'Students', icon: Users },
    { value: `${stats.resourcesCount}+`, label: 'Resources', icon: Award },
    { value: `${stats.fieldVisitsCount}+`, label: 'Field Visits', icon: Heart }
  ];

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#0B0B0B] text-[#F5F2EE] px-6 md:px-12 pt-32 pb-12">
      {/* Cinematic Background Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.02, opacity: heroBgBrightness / 100 }}
          transition={{ duration: 8, ease: 'easeOut' }}
          className="w-full h-full bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: `url('${heroBgImage || '/src/assets/images/botany_college_building_1783496321472.jpg'}')`,
            filter: `blur(${heroBgBlur}px)`,
          }}
        />
        {/* Rich dark vignettes & overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/60 to-[#0B0B0B]/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/80 via-[#0B0B0B]/30 to-transparent z-10" />
        
        {/* Subtle Fog Effect */}
        <div className="absolute inset-0 fog-layer mix-blend-overlay opacity-80 z-20 pointer-events-none" />

        {/* Floating dust particles */}
        <div className="absolute inset-0 z-25 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: `${p.x}%`, y: '110%' }}
              animate={{
                opacity: [0, 0.45, 0.45, 0],
                y: '-10%',
                x: [`${p.x}%`, `${p.x + (Math.random() * 10 - 5)}%`]
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut'
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                backgroundColor: '#C79A6B',
                borderRadius: '50%',
                boxShadow: p.size > 2 ? '0 0 4px #C79A6B' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="w-full max-w-7xl mx-auto z-30 flex-grow flex flex-col justify-center items-center">
        <div className="max-w-4xl space-y-8 mt-12 text-center flex flex-col items-center">
          {/* Subtitle / Header badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 border border-[#C79A6B]/25 bg-[#111111]/90 backdrop-blur"
          >
            <span className="w-8 h-px bg-[#C79A6B]"></span>
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#8F6A48] uppercase font-semibold">
              Department of Botany
            </span>
            <span className="w-8 h-px bg-[#C79A6B]"></span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-[#F5F2EE] font-light mb-4 text-center uppercase"
          >
            Botany <br className="hidden md:inline" />
            Nexus <span className="italic-accent font-normal text-[#C79A6B]">DGC</span>
          </motion.h1>

          {/* Welcome Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1.2 }}
            className="text-lg md:text-xl font-light text-[#F5F2EE]/80 max-w-xl leading-relaxed font-serif text-center"
          >
            Preserving people, plants and <span className="italic-accent text-[#C79A6B]">knowledge</span> through curated discovery and academic research.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1.2 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-4"
          >
            {isAuthenticated ? (
              <>
                <button
                  onClick={onExploreArchive}
                  className="px-8 py-4 border border-[#C79A6B] bg-transparent hover:bg-[#F5F2EE] hover:text-[#0B0B0B] text-xs font-mono tracking-[0.2em] uppercase transition-colors duration-500 rounded-none flex items-center gap-3 group cursor-pointer"
                >
                  Explore Archive
                  <ArrowRight className="w-4 h-4 text-[#C79A6B] group-hover:text-[#0B0B0B] group-hover:translate-x-1.5 transition-all duration-300" />
                </button>
                <button
                  onClick={onMeetContributors}
                  className="px-8 py-4 text-xs font-mono tracking-[0.2em] uppercase bg-transparent border border-transparent opacity-60 hover:opacity-100 transition-opacity rounded-none cursor-pointer"
                >
                  Meet Contributors
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={onLoginClick}
                  className="px-10 py-5 border-2 border-[#C79A6B] bg-[#C79A6B] text-[#0b0b0b] font-bold text-xs font-mono tracking-[0.25em] uppercase hover:bg-transparent hover:text-white transition-all duration-500 rounded-none flex items-center gap-3 cursor-pointer shadow-[0_0_20px_rgba(199,154,107,0.35)]"
                >
                  <Lock className="w-4 h-4 text-[#0B0B0B]" />
                  <span>Enter Student Portal</span>
                  <Key className="w-4 h-4 text-[#0B0B0B]" />
                </button>
                
                <p className="text-[10px] font-mono tracking-widest text-[#8F6A48] uppercase animate-pulse">
                  🔒 Intranet Gateway Restricted to Enrolled Students
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Stats Panel & Scroll Indicator */}
      <div className="w-full max-w-7xl mx-auto z-30 pt-12 border-t border-[#C79A6B]/15 mt-12">
        {isAuthenticated ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {statsItems.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.15, duration: 1 }}
                    className="flex flex-col gap-1.5"
                  >
                    <div className="flex items-center gap-2 text-left">
                      <Icon className="w-4 h-4 text-[#8F6A48]" />
                      <span className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-[#F5F2EE] tracking-tight">
                        {stat.value}
                      </span>
                    </div>
                    <span className="text-[10px] md:text-xs font-mono tracking-widest text-[#8F6A48] uppercase text-left">
                      {stat.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Floating scroll down indicator */}
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="flex justify-center pt-8 cursor-pointer"
              onClick={() => {
                document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ChevronDown className="w-6 h-6 text-[#C79A6B]/60 hover:text-[#C79A6B] transition-colors" />
            </motion.div>
          </>
        ) : (
          <div className="py-2 text-center text-[10.5px] font-mono tracking-[0.2em] text-[#8F6A48]/80 uppercase">
            © {new Date().getFullYear()} Dinajpur Government College • Botany Batch Intranet
          </div>
        )}
      </div>
    </section>
  );
}
