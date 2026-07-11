import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  syncCollection, 
  addFirestoreDoc, 
  updateFirestoreDoc, 
  deleteFirestoreDoc 
} from './lib/firebase';
import Header from './components/Header';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import ResearchArchive from './components/ResearchArchive';
import Community from './components/Community';
import CommunityChat from './components/CommunityChat';
import Gallery from './components/Gallery';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import PortalLogin from './components/PortalLogin';
import AccessDenied from './components/AccessDenied';
import Footer from './components/Footer';

import { Plant, Student, GalleryItem, Contributor, AppStats, AcademicNote, DepartmentEvent, AppSettings } from './types';
import AcademicNotes from './components/AcademicNotes';

const INITIAL_SETTINGS: AppSettings = {
  id: 'main_settings',
  sessionYear: '2025-2026',
  communityTitle: 'Botany Community',
  communitySubtitle: 'Meet the students, contributors, explorers, and the growing botanical community of the Department of Botany.',
  heroBgImage: '/src/assets/images/botany_college_building_1783496321472.jpg',
  heroBgBrightness: 65,
  heroBgBlur: 0,
  philosophyImage: '/src/assets/images/botanical_laboratory_interior_1783496441053.jpg'
};

export default function App() {
  const [currentView, setCurrentView] = useState<'site' | 'admin' | 'community'>('site');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('dgc_admin_auth') === 'true';
  });
  
  // Student Portal Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('dgc_portal_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<Student | null>(() => {
    const cached = localStorage.getItem('dgc_portal_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);

  const [sessionYear, setSessionYear] = useState<string>(() => {
    return localStorage.getItem('dgc_session_year') || '2025-2026';
  });

  const [communityTitle, setCommunityTitle] = useState<string>(() => {
    return localStorage.getItem('dgc_community_title') || 'Botany Community';
  });

  const [communitySubtitle, setCommunitySubtitle] = useState<string>(() => {
    return localStorage.getItem('dgc_community_subtitle') || 'Meet the students, contributors, explorers, and the growing botanical community of the Department of Botany.';
  });

  const [heroBgImage, setHeroBgImage] = useState<string>(() => {
    return localStorage.getItem('dgc_hero_bg_image') || '/src/assets/images/botany_college_building_1783496321472.jpg';
  });

  const [heroBgBrightness, setHeroBgBrightness] = useState<number>(() => {
    const val = localStorage.getItem('dgc_hero_bg_brightness');
    return val ? parseInt(val, 10) : 65;
  });

  const [heroBgBlur, setHeroBgBlur] = useState<number>(() => {
    const val = localStorage.getItem('dgc_hero_bg_blur');
    return val ? parseInt(val, 10) : 0;
  });

  const [philosophyImage, setPhilosophyImage] = useState<string>(() => {
    return localStorage.getItem('dgc_philosophy_image') || '/src/assets/images/botanical_laboratory_interior_1783496441053.jpg';
  });

  const updateSettingsDoc = (partial: Partial<AppSettings>) => {
    const sYear = partial.sessionYear !== undefined ? partial.sessionYear : localStorage.getItem('dgc_session_year') || '2025-2026';
    const cTitle = partial.communityTitle !== undefined ? partial.communityTitle : localStorage.getItem('dgc_community_title') || 'Botany Community';
    const cSubtitle = partial.communitySubtitle !== undefined ? partial.communitySubtitle : localStorage.getItem('dgc_community_subtitle') || 'Meet the students, contributors, explorers, and the growing botanical community of the Department of Botany.';
    const hBgImage = partial.heroBgImage !== undefined ? partial.heroBgImage : localStorage.getItem('dgc_hero_bg_image') || '/src/assets/images/botany_college_building_1783496321472.jpg';
    
    const brightnessVal = localStorage.getItem('dgc_hero_bg_brightness');
    const hBgBrightness = partial.heroBgBrightness !== undefined ? partial.heroBgBrightness : (brightnessVal ? parseInt(brightnessVal, 10) : 65);
    
    const blurVal = localStorage.getItem('dgc_hero_bg_blur');
    const hBgBlur = partial.heroBgBlur !== undefined ? partial.heroBgBlur : (blurVal ? parseInt(blurVal, 10) : 0);

    const philImg = partial.philosophyImage !== undefined ? partial.philosophyImage : localStorage.getItem('dgc_philosophy_image') || '/src/assets/images/botanical_laboratory_interior_1783496441053.jpg';

    const updatedSettings: AppSettings = {
      id: 'main_settings',
      sessionYear: sYear,
      communityTitle: cTitle,
      communitySubtitle: cSubtitle,
      heroBgImage: hBgImage,
      heroBgBrightness: hBgBrightness,
      heroBgBlur: hBgBlur,
      philosophyImage: philImg,
    };
    updateFirestoreDoc('settings', updatedSettings);
  };

  const handleUpdateCommunityTitle = (title: string) => {
    setCommunityTitle(title);
    localStorage.setItem('dgc_community_title', title);
    updateSettingsDoc({ communityTitle: title });
  };

  const handleUpdateCommunitySubtitle = (subtitle: string) => {
    setCommunitySubtitle(subtitle);
    localStorage.setItem('dgc_community_subtitle', subtitle);
    updateSettingsDoc({ communitySubtitle: subtitle });
  };

  const handleUpdateHeroBgImage = (url: string) => {
    setHeroBgImage(url);
    localStorage.setItem('dgc_hero_bg_image', url);
    updateSettingsDoc({ heroBgImage: url });
  };

  const handleUpdateHeroBgBrightness = (val: number) => {
    setHeroBgBrightness(val);
    localStorage.setItem('dgc_hero_bg_brightness', val.toString());
    updateSettingsDoc({ heroBgBrightness: val });
  };

  const handleUpdateHeroBgBlur = (val: number) => {
    setHeroBgBlur(val);
    localStorage.setItem('dgc_hero_bg_blur', val.toString());
    updateSettingsDoc({ heroBgBlur: val });
  };

  const handleUpdatePhilosophyImage = (url: string) => {
    setPhilosophyImage(url);
    localStorage.setItem('dgc_philosophy_image', url);
    updateSettingsDoc({ philosophyImage: url });
  };

  // Database States
  const [plants, setPlants] = useState<Plant[]>([]);

  const [students, setStudents] = useState<Student[]>([]);

  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  const [events, setEvents] = useState<DepartmentEvent[]>([]);

  const [academicNotes, setAcademicNotes] = useState<AcademicNote[]>([]);

  const [contributors, setContributors] = useState<Contributor[]>([]);

  const [stats, setStats] = useState<AppStats>({
    plantsCount: 0,
    studentsCount: 0,
    resourcesCount: 0,
    fieldVisitsCount: 0
  });

  // Watch hash change for direct URL mapping
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('site');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);


  // Synchronize all data collections with Firestore in real-time!
  useEffect(() => {
    const unsubPlants = syncCollection<Plant>('plants', [], setPlants);
    const unsubStudents = syncCollection<Student>('students', [], setStudents);
    const unsubGallery = syncCollection<GalleryItem>('gallery', [], setGallery);
    const unsubEvents = syncCollection<DepartmentEvent>('events', [], setEvents);
    const unsubAcademicNotes = syncCollection<AcademicNote>('academic_notes', [], setAcademicNotes);
    const unsubContributors = syncCollection<Contributor>('contributors', [], setContributors);
    const unsubStats = syncCollection<AppStats & { id: string }>(
      'stats',
      [{ plantsCount: 0, studentsCount: 0, resourcesCount: 0, fieldVisitsCount: 0, id: 'main_stats' }],
      (data) => {
        if (data.length > 0) {
          const { id, ...rest } = data[0];
          setStats(rest as AppStats);
        }
      }
    );
    const unsubSettings = syncCollection<AppSettings>(
      'settings',
      [INITIAL_SETTINGS],
      (data) => {
        if (data.length > 0) {
          const s = data[0];
          setSessionYear(s.sessionYear);
          setCommunityTitle(s.communityTitle);
          setCommunitySubtitle(s.communitySubtitle);
          setHeroBgImage(s.heroBgImage);
          setHeroBgBrightness(s.heroBgBrightness);
          setHeroBgBlur(s.heroBgBlur);
          if (s.philosophyImage) {
            setPhilosophyImage(s.philosophyImage);
          }
        }
      }
    );

    return () => {
      unsubPlants();
      unsubStudents();
      unsubGallery();
      unsubEvents();
      unsubAcademicNotes();
      unsubContributors();
      unsubStats();
      unsubSettings();
    };
  }, []);


  // Remember Me persistent login state verification
  useEffect(() => {
    if (!isAuthenticated) {
      const rememberedId = localStorage.getItem('dgc_remembered_student_id');
      const rememberTimeStr = localStorage.getItem('dgc_remember_time');
      if (rememberedId && rememberTimeStr) {
        const rememberTime = parseInt(rememberTimeStr, 10);
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - rememberTime < thirtyDaysMs) {
          const student = students.find(s => s.id === rememberedId);
          if (student && student.status === 'Active') {
            setIsAuthenticated(true);
            setCurrentUser(student);
            localStorage.setItem('dgc_portal_auth', 'true');
            localStorage.setItem('dgc_portal_user', JSON.stringify(student));
          }
        }
      }
    }
  }, [students, isAuthenticated]);

  // If anyone scrolls down without logging in, automatically redirect them back to top and trigger login
  useEffect(() => {
    if (isAuthenticated) return;

    const handleScroll = () => {
      if (window.scrollY > 250) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsLoginOpen(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthenticated]);

  const handlePortalLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('dgc_portal_auth');
    localStorage.removeItem('dgc_portal_user');
    localStorage.removeItem('dgc_remembered_student_id');
    localStorage.removeItem('dgc_remember_time');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStudentPassword = (studentId: string, newPass: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const updatedObj = { ...student, password: newPass, isTemporaryPassword: false };
      updateFirestoreDoc('students', updatedObj);

      // If the student being updated is currently logged in, sync their local state
      if (currentUser && currentUser.id === studentId) {
        const updatedUser = { ...currentUser, password: newPass, isTemporaryPassword: false };
        setCurrentUser(updatedUser);
        localStorage.setItem('dgc_portal_user', JSON.stringify(updatedUser));
      }
    }
  };

  // Sync methods to LocalStorage on changes
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Stats updates
  const handleUpdateStats = (newStats: AppStats) => {
    updateFirestoreDoc('stats', { ...newStats, id: 'main_stats' });
  };

  // Plant mutators
  const handleAddPlant = (plant: Plant) => {
    addFirestoreDoc('plants', plant);
  };
  const handleEditPlant = (plant: Plant) => {
    updateFirestoreDoc('plants', plant);
  };
  const handleDeletePlant = (id: string) => {
    deleteFirestoreDoc('plants', id);
  };

  // Student mutators
  const handleAddStudent = (student: Student) => {
    addFirestoreDoc('students', student);
  };
  const handleEditStudent = (student: Student) => {
    updateFirestoreDoc('students', student);
  };
  const handleDeleteStudent = (id: string) => {
    deleteFirestoreDoc('students', id);
  };

  // Gallery mutators
  const handleAddGallery = (item: GalleryItem) => {
    addFirestoreDoc('gallery', item);
  };
  const handleEditGallery = (item: GalleryItem) => {
    updateFirestoreDoc('gallery', item);
  };
  const handleDeleteGallery = (id: string) => {
    deleteFirestoreDoc('gallery', id);
  };

  // Event mutators
  const handleAddEvent = (event: DepartmentEvent) => {
    addFirestoreDoc('events', event);
  };
  const handleEditEvent = (event: DepartmentEvent) => {
    updateFirestoreDoc('events', event);
  };
  const handleDeleteEvent = (id: string) => {
    deleteFirestoreDoc('events', id);
  };

  // Academic Notes mutators
  const handleAddAcademicNote = (note: AcademicNote) => {
    addFirestoreDoc('academic_notes', note);
  };
  const handleEditAcademicNote = (note: AcademicNote) => {
    updateFirestoreDoc('academic_notes', note);
  };
  const handleDeleteAcademicNote = (id: string) => {
    deleteFirestoreDoc('academic_notes', id);
  };
  const handleDownloadAcademicNote = (id: string) => {
    const note = academicNotes.find(n => n.id === id);
    if (note) {
      updateFirestoreDoc('academic_notes', { ...note, downloadCount: (note.downloadCount || 0) + 1 });
    }
  };

  // Contributor mutators
  const handleAddContributor = (cont: Contributor) => {
    addFirestoreDoc('contributors', cont);
  };
  const handleEditContributor = (cont: Contributor) => {
    updateFirestoreDoc('contributors', cont);
  };
  const handleDeleteContributor = (id: string) => {
    deleteFirestoreDoc('contributors', id);
  };

  // Session period setter
  const handleUpdateSessionYear = (year: string) => {
    setSessionYear(year);
    localStorage.setItem('dgc_session_year', year);
    updateSettingsDoc({ sessionYear: year });
  };

  // Scroll navigation helper
  const handleNavigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Hash routing handler
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setCurrentView('admin');
      } else if (hash === '#community') {
        setCurrentView('community');
      } else {
        setCurrentView('site');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dynamic Page Title on Scroll / View Change
  useEffect(() => {
    if (currentView === 'admin') {
      document.title = 'Admin Dashboard | Botany Nexus DGC';
      return;
    }

    if (!isAuthenticated) {
      document.title = 'Botany Nexus DGC | Department of Botany';
      return;
    }

    // Default title is Home when logged in
    document.title = 'Botany Nexus DGC | Home';

    const sections = [
      { id: 'hero', title: 'Botany Nexus DGC | Home' },
      { id: 'philosophy', title: 'Botany Nexus DGC | Home' },
      { id: 'archive', title: 'Botany Nexus DGC | Plant Archive' },
      { id: 'community', title: 'Botany Nexus DGC | Community' },
      { id: 'gallery', title: 'Botany Nexus DGC | Journal' },
      { id: 'academic-notes', title: 'Botany Nexus DGC | Resources' },
      { id: 'contributors', title: 'Botany Nexus DGC | Home' }
    ];

    const observerOptions = {
      root: null,
      rootMargin: '-35% 0px -35% 0px', // Trigger when section occupies the mid-viewport
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const matched = sections.find(s => s.id === sectionId);
          if (matched && !document.documentElement.hasAttribute('data-dossier-open')) {
            document.title = matched.title;
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    // Also listen to direct scroll as backup
    const handleBackupScroll = () => {
      if (document.documentElement.hasAttribute('data-dossier-open')) return;
      
      let currentSection = 'hero';
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = s.id;
            break;
          }
        }
      }
      const matched = sections.find(s => s.id === currentSection);
      if (matched) {
        document.title = matched.title;
      }
    };

    window.addEventListener('scroll', handleBackupScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleBackupScroll);
    };
  }, [currentView, isAuthenticated]);

  return (
    <div className="bg-[#0B0B0B] text-[#F5F2EE] min-h-screen relative font-sans">
      
      {/* Editorial Header */}
      {currentView !== 'community' && (
        <Header 
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            if (view === 'admin') {
              window.location.hash = 'admin';
            } else if (view === 'community') {
              window.location.hash = 'community';
            } else {
              window.location.hash = '';
            }
          }}
          onNavigate={handleNavigateToSection}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLogout={handlePortalLogout}
        />
      )}

      {/* Main Switch View Container */}
      <AnimatePresence mode="wait">
        {currentView === 'admin' ? (
          !(isAuthenticated && currentUser?.role === 'super_admin') ? (
            <AccessDenied 
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
              onGoBack={() => {
                setCurrentView('site');
                window.location.hash = '';
              }}
              onTriggerLogin={() => setIsLoginOpen(true)}
            />
          ) : (
            <motion.div
              key="admin-workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <AdminPanel 
                stats={stats}
                onUpdateStats={handleUpdateStats}
                plants={plants}
                onAddPlant={handleAddPlant}
                onEditPlant={handleEditPlant}
                onDeletePlant={handleDeletePlant}
                students={students}
                onAddStudent={handleAddStudent}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                gallery={gallery}
                onAddGallery={handleAddGallery}
                onEditGallery={handleEditGallery}
                onDeleteGallery={handleDeleteGallery}
                events={events}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                academicNotes={academicNotes}
                onAddAcademicNote={handleAddAcademicNote}
                onEditAcademicNote={handleEditAcademicNote}
                onDeleteAcademicNote={handleDeleteAcademicNote}
                contributors={contributors}
                onAddContributor={handleAddContributor}
                onEditContributor={handleEditContributor}
                onDeleteContributor={handleDeleteContributor}
                sessionYear={sessionYear}
                onUpdateSessionYear={handleUpdateSessionYear}
                communityTitle={communityTitle}
                onUpdateCommunityTitle={handleUpdateCommunityTitle}
                communitySubtitle={communitySubtitle}
                onUpdateCommunitySubtitle={handleUpdateCommunitySubtitle}
                heroBgImage={heroBgImage}
                onUpdateHeroBgImage={handleUpdateHeroBgImage}
                heroBgBrightness={heroBgBrightness}
                onUpdateHeroBgBrightness={handleUpdateHeroBgBrightness}
                heroBgBlur={heroBgBlur}
                onUpdateHeroBgBlur={handleUpdateHeroBgBlur}
                philosophyImage={philosophyImage}
                onUpdatePhilosophyImage={handleUpdatePhilosophyImage}
                userRole="super_admin"
                currentUser={currentUser}
                onLogout={() => {
                  handlePortalLogout();
                  setCurrentView('site');
                  window.location.hash = '';
                }}
              />
            </motion.div>
          )
        ) : currentView === 'community' ? (
          <motion.div
            key="community-workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full min-h-screen"
          >
            <CommunityChat 
              currentUser={currentUser}
              students={students}
              onBackToSite={() => {
                setCurrentView('site');
                window.location.hash = '';
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="public-site"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Cinematic Hero Block */}
            <Hero 
              stats={stats} 
              heroBgImage={heroBgImage}
              heroBgBrightness={heroBgBrightness}
              heroBgBlur={heroBgBlur}
              onExploreArchive={() => handleNavigateToSection('archive')}
              onMeetContributors={() => handleNavigateToSection('contributors')}
              isAuthenticated={isAuthenticated}
              onLoginClick={() => setIsLoginOpen(true)}
            />

            {/* Conditionally render all main sections ONLY if Authenticated */}
            {isAuthenticated ? (
              <>
                {/* Alternating Section 1: Philosophy (Image Left + Text Right) */}
                <Philosophy philosophyImage={philosophyImage} />

                {/* Public Botanical Specimen Archive Grid */}
                <ResearchArchive plants={plants} events={events} gallery={gallery} />

                {/* Public Interactive Community Registry */}
                <Community 
                  students={students} 
                  communityTitle={communityTitle} 
                  communitySubtitle={communitySubtitle} 
                  currentUser={currentUser}
                  onOpenChat={() => {
                    setCurrentView('community');
                    window.location.hash = 'community';
                  }}
                />

                {/* Premium Event Archive & Visual Journal */}
                <Gallery events={events} />

                {/* Premium Academic Notes & PDF Library */}
                <AcademicNotes notes={academicNotes} onDownloadNote={handleDownloadAcademicNote} />

                {/* Advisory Board / Contributors Section */}
                <section id="contributors" className="relative w-full py-16 md:py-20 bg-[#111111] text-[#F5F2EE] px-6 md:px-12 border-b border-[#C79A6B]/15">
                  <div className="w-full max-w-7xl mx-auto space-y-10">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                      <span className="text-xs font-mono tracking-[0.3em] text-[#C79A6B] uppercase font-semibold">
                        — BOARD OF CURATORS
                      </span>
                      <h2 className="font-serif text-3xl md:text-4xl font-light text-[#F5F2EE]">
                        Mentorship & <span className="font-serif italic text-[#C79A6B]">academic guidance</span>
                      </h2>
                      <p className="text-xs md:text-sm text-[#F5F2EE]/60 font-light leading-relaxed">
                        Under direct supervision of the DGC Botany faculty, our systematic digital indices follow strict international herbarium standards.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                      {contributors.map((c) => (
                        <div key={c.id} className="bg-[#0B0B0B]/90 border border-[#C79A6B]/15 rounded p-6 text-center space-y-4 hover:border-[#C79A6B]/40 transition-colors">
                          <div className="w-20 h-20 rounded-full border border-[#C79A6B]/30 mx-auto overflow-hidden bg-[#111111]">
                            <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif text-lg font-medium text-[#F5F2EE]">{c.name}</h4>
                            <p className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-wider">{c.role}</p>
                          </div>
                          <div className="text-[10.5px] font-mono text-[#8F6A48]/80 border-t border-[#C79A6B]/10 pt-3">
                            Curatorial Index: {c.contributionsCount} items approved
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            ) : null}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant Editorial Footer */}
      {currentView !== 'community' && (
        <Footer 
          sessionYear={sessionYear} 
          onViewChange={(view) => {
            setCurrentView(view);
            if (view === 'admin') {
              window.location.hash = 'admin';
            } else if (view === 'community') {
              window.location.hash = 'community';
            } else {
              window.location.hash = '';
            }
          }}
          onNavigate={handleNavigateToSection}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* Student Portal Login Overlay modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <PortalLogin 
            students={students}
            onLoginSuccess={(student) => {
              setIsAuthenticated(true);
              setCurrentUser(student);
              localStorage.setItem('dgc_portal_auth', 'true');
              localStorage.setItem('dgc_portal_user', JSON.stringify(student));
              setIsLoginOpen(false);
            }}
            onClose={() => setIsLoginOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
