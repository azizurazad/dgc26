import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Menu, X, Landmark, Lock, LogOut, User, Bell } from 'lucide-react';
import { useState } from 'react';
import logoUrl from '../assets/logo.svg';
import { AppNotification } from '../types';

interface HeaderProps {
  currentView: 'site' | 'admin' | 'community';
  onViewChange: (view: 'site' | 'admin' | 'community') => void;
  onNavigate: (sectionId: string) => void;
  isAuthenticated: boolean;
  currentUser: any;
  onLogout: () => void;
  
  // Notification fields
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  isNotificationPanelOpen: boolean;
  onToggleNotificationPanel: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: AppNotification) => void;
}

export default function Header({ 
  currentView, 
  onViewChange, 
  onNavigate,
  isAuthenticated,
  currentUser,
  onLogout,
  notifications = [],
  unreadNotificationsCount = 0,
  isNotificationPanelOpen = false,
  onToggleNotificationPanel = () => {},
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onSelectNotification = () => {}
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Philosophy', target: 'philosophy' },
    { name: 'Archive', target: 'archive' },
    { name: 'Community', target: 'community' },
    { name: 'Journal', target: 'gallery' },
    { name: 'Mentor', target: 'contributors' },
    { name: 'Academic Notes', target: 'academic-notes' }
  ];

  const handleNavClick = (target: string) => {
    setMobileMenuOpen(false);
    if (currentView === 'admin') {
      onViewChange('site');
      // Allow DOM to render then scroll
      setTimeout(() => {
        onNavigate(target);
      }, 100);
    } else {
      onNavigate(target);
    }
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full z-50 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-[#C79A6B]/20 px-6 md:px-12 py-5 flex items-center justify-between"
    >
      {/* Logo */}
      <div 
        onClick={() => {
          if (isAuthenticated) {
            onViewChange('site');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="flex items-center gap-4 cursor-pointer group"
      >
        <div className="w-10 h-10 flex items-center justify-center border border-[#C79A6B]/50 bg-white rounded-full overflow-hidden p-1 group-hover:border-[#F5F2EE] transition-all duration-500">
          <img src={logoUrl} alt="DGC Logo" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8F6A48] font-semibold leading-none mb-1">
            Department of Botany
          </span>
          <span className="font-serif text-sm md:text-base font-light text-[#F5F2EE] tracking-wider leading-none uppercase group-hover:text-[#C79A6B] transition-colors duration-300">
            BOTANY NEXUS <span className="font-serif italic text-[#C79A6B] lowercase">dgc</span>
          </span>
        </div>
      </div>

      {/* Desktop Navigation - Hidden unless Authenticated */}
      {isAuthenticated && (
        <nav className="hidden lg:flex items-center gap-10 text-[11px] uppercase tracking-[0.2em] opacity-80 font-sans">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => handleNavClick(item.target)}
              className="text-xs tracking-[0.2em] font-medium text-[#F5F2EE]/85 hover:text-[#C79A6B] transition-all duration-300 uppercase relative py-1 group cursor-pointer"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C79A6B] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>
      )}

      {/* Authenticated Student profile, Admin triggers, or session indicator */}
      <div className="flex items-center gap-3">
        
        {/* Smart Push Notification Bell & Panel */}
        {isAuthenticated && currentUser && (
          <div className="relative">
            <button
              onClick={onToggleNotificationPanel}
              title="Open Notifications"
              className="relative p-2 text-[#F5F2EE]/80 hover:text-[#C79A6B] hover:bg-[#111111] rounded-full transition-all cursor-pointer border border-transparent hover:border-[#C79A6B]/20"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 border border-[#0B0B0B] text-[8px] font-mono font-bold text-white flex items-center justify-center rounded-full animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Float Dropdown Popover */}
            <AnimatePresence>
              {isNotificationPanelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0E0E0E]/95 backdrop-blur-md border border-[#C79A6B]/30 rounded shadow-2xl p-4 z-50 text-left font-sans flex flex-col max-h-[480px]"
                >
                  <div className="flex justify-between items-center border-b border-[#C79A6B]/20 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-[#C79A6B]" />
                      <span className="font-serif text-[#F5F2EE] font-bold text-sm tracking-wide">Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="text-[9px] font-mono bg-[#C79A6B]/15 text-[#C79A6B] px-1.5 py-0.5 rounded">
                          {unreadNotificationsCount} New
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={onMarkAllAsRead}
                        className="text-[10px] font-mono text-[#C79A6B] hover:text-white hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto space-y-2.5 flex-grow pr-1 max-h-[350px]">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center text-[#8F6A48] font-mono text-xs flex flex-col items-center justify-center gap-2">
                        <Bell className="w-8 h-8 text-[#8F6A48]/30 animate-pulse" />
                        <span>No notifications yet.</span>
                      </div>
                    ) : (
                      notifications.map(notif => {
                        const isRead = notif.readBy?.includes(currentUser?.id || '');
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              onMarkAsRead(notif.id);
                              onSelectNotification(notif);
                            }}
                            className={`p-3 rounded border transition-all cursor-pointer flex gap-3 text-left ${
                              isRead 
                                ? 'bg-transparent border-[#C79A6B]/10 hover:border-[#C79A6B]/25' 
                                : 'bg-[#C79A6B]/5 border-[#C79A6B]/30 hover:bg-[#C79A6B]/10'
                            }`}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {notif.imageUrl ? (
                                <img src={notif.imageUrl} className="w-8 h-8 rounded object-cover border border-[#C79A6B]/20" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-[#111111] border border-[#C79A6B]/20 flex items-center justify-center text-[#C79A6B]">
                                  <Bell className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow space-y-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h5 className={`text-xs text-[#F5F2EE] font-semibold truncate ${!isRead && 'text-white'}`}>{notif.title}</h5>
                                <span className="text-[8px] font-mono text-[#8F6A48]/80 whitespace-nowrap">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#F5F2EE]/70 line-clamp-2 leading-relaxed">{notif.message}</p>
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-[8px] font-mono uppercase bg-[#111111] border border-[#C79A6B]/10 px-1 rounded text-[#C79A6B]">
                                  {notif.category}
                                </span>
                                {!isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Dynamic User Banner / Portal Info */}
        {isAuthenticated && currentUser ? (
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded border border-[#C79A6B]/20 bg-[#111111]/80 select-none">
            {currentUser.photoUrl ? (
              <img 
                src={currentUser.photoUrl} 
                className="w-6 h-6 rounded-full object-cover border border-[#C79A6B]/30" 
                referrerPolicy="no-referrer"
                alt="user"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-900/40 border border-[#C79A6B]/30 flex items-center justify-center text-[10px] text-[#C79A6B]">
                <User className="w-3 h-3" />
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-sans text-[#F5F2EE] font-medium leading-tight truncate max-w-[100px]" title={currentUser.full_name || currentUser.name}>
                {currentUser.name}
              </span>
              <span className={`text-[8px] font-mono leading-none font-bold uppercase ${currentUser.role === 'super_admin' ? 'text-amber-400' : 'text-[#C79A6B]'}`}>
                {currentUser.role === 'super_admin' ? 'Super Admin' : 'Student'}
              </span>
            </div>
            
            <button 
              onClick={onLogout}
              title="Sign Out of Student Portal"
              className="ml-1.5 p-1 text-red-400/80 hover:text-red-400 hover:bg-[#0B0B0B] rounded cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div 
            title="Dinajpur Govt. College Academic Session"
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C79A6B]/15 bg-[#111111]/40 select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9.5px] font-mono tracking-[0.15em] text-[#C79A6B]/80 uppercase font-semibold">
              Session 2025-26
            </span>
          </div>
        )}

        {/* Admin Gateway Trigger - restricted to super_admin */}
        {currentView === 'site' && isAuthenticated && currentUser?.role === 'super_admin' && (
          <button
            onClick={() => onViewChange('admin')}
            title="Access curator administration portal"
            className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-sm border border-[#C79A6B]/30 bg-[#111111] hover:bg-[#C79A6B]/10 hover:border-[#C79A6B] text-[10px] font-mono text-[#C79A6B] tracking-wider uppercase transition-all cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Admin Panel</span>
          </button>
        )}

        {/* Dashboard toggle indicator for test ease */}
        {currentView === 'admin' && (
          <button
            onClick={() => onViewChange('site')}
            className="px-4 py-1.5 rounded bg-[#C79A6B]/10 border border-[#C79A6B]/30 hover:bg-[#C79A6B] hover:text-black text-[10px] text-[#C79A6B] font-mono tracking-widest uppercase transition-all duration-300 cursor-pointer"
          >
            Exit Workspace
          </button>
        )}

        {/* Mobile Menu Toggle - Only if Authenticated */}
        {isAuthenticated && (
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#F5F2EE] hover:text-[#C79A6B] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && isAuthenticated && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 w-full bg-[#0B0B0B]/98 border-b border-[#C79A6B]/20 px-8 py-8 flex flex-col gap-6 lg:hidden text-left"
        >
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => handleNavClick(item.target)}
              className="text-left text-sm tracking-[0.25em] font-medium text-[#F5F2EE] hover:text-[#C79A6B] transition-all uppercase py-2 border-b border-[#C79A6B]/5"
            >
              {item.name}
            </button>
          ))}
          {currentUser?.role === 'super_admin' && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onViewChange('admin');
              }}
              className="text-left text-sm tracking-[0.25em] font-medium text-[#C79A6B] hover:text-white transition-all uppercase py-2 border-b border-[#C79A6B]/5 cursor-pointer"
            >
              Admin Panel
            </button>
          )}
          <div className="pt-4 flex items-center justify-between border-t border-[#C79A6B]/10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider text-[#C79A6B]/70 uppercase">
                {currentUser?.name} ({currentUser?.role === 'super_admin' ? 'Super Admin' : 'Student'})
              </span>
            </div>
            
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 hover:underline cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
