import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Calendar, Clock, MapPin, User, Users, Award, 
  BookOpen, Youtube, Facebook, X, ChevronLeft, ChevronRight, 
  Maximize2, Minimize2, Tag, Compass, Layers, PlayCircle, ExternalLink 
} from 'lucide-react';
import { DepartmentEvent } from '../types';

interface GalleryProps {
  events: DepartmentEvent[];
  initialEventId?: string | null;
  onClearInitialEvent?: () => void;
}

export default function Gallery({ events, initialEventId, onClearInitialEvent }: GalleryProps) {
  // State variables
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<DepartmentEvent | null>(null);

  // Handle initial/deep-linked event selection
  useEffect(() => {
    if (initialEventId && events.length > 0) {
      const ev = events.find(item => item.id === initialEventId);
      if (ev) {
        setSelectedEvent(ev);
        const el = document.getElementById('gallery');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        if (onClearInitialEvent) onClearInitialEvent();
      }
    }
  }, [initialEventId, events, onClearInitialEvent]);
  
  // Lightbox States
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState<number>(-1);
  const [isLightboxFullscreen, setIsLightboxFullscreen] = useState<boolean>(false);

  // Categories definition
  const filters = [
    { label: 'All', value: 'All' },
    { label: 'Seminars', value: 'Seminar' },
    { label: 'Workshops', value: 'Workshop' },
    { label: 'Field Visits', value: 'Field Visit' },
    { label: 'Practical Classes', value: 'Practical Class' },
    { label: 'Research', value: 'Research' },
    { label: 'Tours', value: 'Botanical Tour' },
    { label: 'Cultural Programs', value: 'Cultural Program' },
    { label: 'Competitions', value: 'Competition' }
  ];

  // Map filters to match events accurately
  const filteredEvents = useMemo(() => {
    let result = events;

    // Filter by Category Mapping
    if (selectedFilter !== 'All') {
      if (selectedFilter === 'Cultural Program') {
        result = events.filter(e => e.category === 'Cultural Program' || e.category === 'Fresher Reception' || e.category === 'Farewell');
      } else if (selectedFilter === 'Competition') {
        result = events.filter(e => e.category === 'Competition' || e.category === 'Exhibition');
      } else {
        result = events.filter(e => e.category === selectedFilter);
      }
    }

    // Filter by Search Query (title, description, tags, year/date)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.date.toLowerCase().includes(q) ||
        (e.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort by date descending
    return [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, selectedFilter, searchQuery]);

  // If not expanded, display only the latest 6 events on the homepage
  const displayedEvents = useMemo(() => {
    if (!isExpanded && searchQuery.trim() === '' && selectedFilter === 'All') {
      return filteredEvents.slice(0, 6);
    }
    return filteredEvents;
  }, [filteredEvents, isExpanded, searchQuery, selectedFilter]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentLightboxIndex === -1) return;
      if (e.key === 'ArrowRight') {
        handlePrevNextLightbox(1);
      } else if (e.key === 'ArrowLeft') {
        handlePrevNextLightbox(-1);
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLightboxIndex, lightboxImages]);

  // Open Lightbox
  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setCurrentLightboxIndex(index);
  };

  // Close Lightbox
  const closeLightbox = () => {
    setCurrentLightboxIndex(-1);
    setIsLightboxFullscreen(false);
  };

  // Lightbox index changes
  const handlePrevNextLightbox = (direction: number) => {
    if (lightboxImages.length === 0) return;
    let nextIndex = currentLightboxIndex + direction;
    if (nextIndex >= lightboxImages.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = lightboxImages.length - 1;
    }
    setCurrentLightboxIndex(nextIndex);
  };

  // Find related events (sharing tags or category)
  const relatedEvents = useMemo(() => {
    if (!selectedEvent) return [];
    return events
      .filter(e => e.id !== selectedEvent.id && (e.category === selectedEvent.category || (e.tags || []).some(t => (selectedEvent.tags || []).includes(t))))
      .slice(0, 3);
  }, [selectedEvent, events]);

  return (
    <section 
      id="gallery" 
      className="relative w-full py-16 md:py-20 bg-[#0B0B0B] text-[#F5F2EE] px-6 md:px-12 border-b border-[#C79A6B]/15"
    >
      <div className="w-full max-w-7xl mx-auto space-y-12">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3 text-left">
            <span className="text-xs font-mono tracking-[0.35em] text-[#C79A6B] uppercase font-semibold block">
              — Premium Event Archive
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-tight text-[#F5F2EE]">
              Departmental <span className="font-serif italic text-[#C79A6B] font-normal">Event Chronicle</span>
            </h2>
            <p className="text-xs md:text-sm text-[#F5F2EE]/60 font-light max-w-xl">
              An elegant, high-fidelity visual index detailing botanical field expeditions, seminars, practical workshops, academic tours, and cultural celebrations.
            </p>
          </div>

          {/* Expanded controls (Filters and Search) */}
          {(isExpanded || searchQuery || selectedFilter !== 'All') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-stretch sm:items-center"
            >
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-3.5 h-3.5 text-[#C79A6B]/50" />
                </span>
                <input
                  type="text"
                  placeholder="Search events, years, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111111]/80 border border-[#C79A6B]/20 rounded-xs pl-9 pr-4 py-2 text-xs text-[#F5F2EE] placeholder-[#F5F2EE]/45 outline-none focus:border-[#C79A6B]/60 transition-all font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#F5F2EE]/40 hover:text-[#C79A6B] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Filter Pills Panel */}
        {(isExpanded || searchQuery || selectedFilter !== 'All') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#C79A6B]/20 max-w-full"
          >
            {filters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setSelectedFilter(filter.value)}
                className={`px-4 py-2 border text-[9px] font-mono tracking-widest uppercase transition-all duration-300 rounded-full cursor-pointer whitespace-nowrap ${
                  selectedFilter === filter.value 
                    ? 'border-[#C79A6B] bg-[#C79A6B]/15 text-[#C79A6B] font-bold' 
                    : 'border-[#C79A6B]/10 bg-transparent text-[#F5F2EE]/50 hover:border-[#C79A6B]/30 hover:text-[#F5F2EE]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Cinematic Masonry/Bento Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {displayedEvents.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                onClick={() => setSelectedEvent(item)}
                className="break-inside-avoid relative overflow-hidden bg-[#111111] border border-[#C79A6B]/15 hover:border-[#C79A6B]/50 group cursor-pointer transition-all duration-500 rounded-xs flex flex-col justify-between"
              >
                {/* Visual Cover */}
                <div className="relative w-full overflow-hidden">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-transparent opacity-60" />
                </div>

                {/* Badges on top */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="px-2.5 py-0.5 bg-[#0B0B0B]/85 backdrop-blur border border-[#C79A6B]/25 rounded-full text-[8px] font-mono tracking-widest text-[#C79A6B] uppercase font-bold">
                    {item.category}
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#C79A6B]/10 backdrop-blur border border-[#C79A6B]/25 rounded-full text-[8px] font-mono tracking-widest text-[#F5F2EE]/80">
                    {item.session}
                  </span>
                </div>

                {/* Card Info Overlay & Bottom Panel */}
                <div className="p-5 space-y-3 relative z-10 bg-gradient-to-b from-transparent to-[#111111]">
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-mono text-[#8F6A48] uppercase tracking-wider block">
                      {item.date} • {item.location}
                    </span>
                    <h4 className="font-serif text-lg leading-snug font-light text-[#F5F2EE] group-hover:text-[#C79A6B] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#F5F2EE]/60 font-light line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Tags indicator */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#C79A6B]/10">
                    {(item.tags || []).slice(0, 3).map((tag, tIdx) => (
                      <span key={tIdx} className="text-[9px] font-mono text-[#8F6A48] flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-[#C79A6B]/50" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Elegant Hover Glow Overlay */}
                <div className="absolute -inset-px bg-gradient-to-r from-transparent via-[#C79A6B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {displayedEvents.length === 0 && (
          <div className="text-center py-20 border border-dashed border-[#C79A6B]/20 rounded bg-[#111111]/40">
            <Layers className="w-8 h-8 text-[#C79A6B]/50 mx-auto mb-4" />
            <p className="text-sm font-mono text-[#8F6A48]">No events found matching current criteria.</p>
          </div>
        )}

        {/* Toggle Expand Button on Homepage */}
        {!isExpanded && searchQuery.trim() === '' && selectedFilter === 'All' && events.length > 6 && (
          <div className="text-center pt-8">
            <button
              onClick={() => {
                setIsExpanded(true);
                // Scroll to filters smoothly
                setTimeout(() => {
                  document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-8 py-3.5 bg-gradient-to-b from-[#111111] to-[#0D0D0D] border border-[#C79A6B]/30 hover:border-[#C79A6B] text-[10px] font-mono tracking-[0.2em] uppercase text-[#C79A6B] hover:text-[#F5F2EE] hover:shadow-[0_0_15px_rgba(199,154,107,0.15)] transition-all rounded-xs cursor-pointer inline-flex items-center gap-2"
            >
              View All Departmental Events ({events.length})
            </button>
          </div>
        )}

        {/* Dynamic Premium Event Details Overlay */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0B0B]/98 backdrop-blur-md p-4 md:p-8 flex items-start justify-center"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#111111] border border-[#C79A6B]/30 rounded-xs w-full max-w-5xl shadow-2xl overflow-hidden relative select-text"
                onClick={(e) => e.stopPropagation()}
              >
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-[#0B0B0B]/90 border border-[#C79A6B]/30 text-[#C79A6B] hover:text-[#F5F2EE] hover:border-[#C79A6B] transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>

                {/* Hero Cover Frame */}
                <div className="relative w-full aspect-[21/9] bg-[#070707] overflow-hidden group">
                  <img
                    src={selectedEvent.coverImage}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-[1.01] transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent" />
                  
                  {/* Category Pill Floating */}
                  <div className="absolute bottom-6 left-6 md:left-8 z-10 flex gap-2">
                    <span className="px-3 py-1 bg-[#C79A6B] text-[9px] font-mono font-bold tracking-widest text-[#0B0B0B] uppercase rounded-full">
                      {selectedEvent.category}
                    </span>
                    <span className="px-3 py-1 bg-[#0B0B0B]/80 backdrop-blur border border-[#C79A6B]/30 text-[9px] font-mono tracking-widest text-[#C79A6B] rounded-full uppercase">
                      {selectedEvent.session}
                    </span>
                  </div>
                </div>

                {/* Details Content Split Layout */}
                <div className="p-6 md:p-10 space-y-10">
                  
                  {/* Main Header Information */}
                  <div className="border-b border-[#C79A6B]/15 pb-6 space-y-2 text-left">
                    <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#F5F2EE]">
                      {selectedEvent.title}
                    </h3>
                    <p className="font-serif italic text-[#C79A6B] text-base md:text-lg">
                      {selectedEvent.subtitle}
                    </p>
                  </div>

                  {/* Core Event Grid Metadata & Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    
                    {/* LEFT SIDE: Description, Media Links, Participants, Event Images */}
                    <div className="lg:col-span-8 space-y-10 text-left">
                      
                      {/* Description */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-[#C79A6B] tracking-[0.2em] uppercase font-bold block">
                          — Chronicle Description
                        </span>
                        <p className="text-sm text-[#F5F2EE]/85 leading-relaxed font-light whitespace-pre-line">
                          {selectedEvent.description}
                        </p>
                      </div>

                      {/* Video and Live Media Links */}
                      {(selectedEvent.youtubeUrl || selectedEvent.facebookLiveUrl) && (
                        <div className="p-5 bg-[#0B0B0B]/60 border border-[#C79A6B]/15 rounded-xs space-y-3">
                          <h4 className="text-[10px] font-mono tracking-widest text-[#C79A6B] uppercase font-bold flex items-center gap-2">
                            <PlayCircle className="w-4 h-4" /> Broadcast & Media Coverage
                          </h4>
                          <div className="flex flex-wrap gap-4">
                            {selectedEvent.youtubeUrl && (
                              <a 
                                href={selectedEvent.youtubeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/30 rounded text-xs font-mono text-[#FF5555] transition-colors cursor-pointer"
                              >
                                <Youtube className="w-4 h-4" /> Watch YouTube Video <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {selectedEvent.facebookLiveUrl && (
                              <a 
                                href={selectedEvent.facebookLiveUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 rounded text-xs font-mono text-[#5599FF] transition-colors cursor-pointer"
                              >
                                <Facebook className="w-4 h-4" /> Facebook Live Feed <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Segmented Image Gallery */}
                      {selectedEvent.additionalImages && selectedEvent.additionalImages.length > 0 && (
                        <div className="space-y-4">
                          <span className="text-[10px] font-mono text-[#C79A6B] tracking-[0.2em] uppercase font-bold block">
                            — Dynamic Photographic Logs
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {selectedEvent.additionalImages.map((img, imgIdx) => (
                              <div 
                                key={imgIdx}
                                onClick={() => openLightbox(selectedEvent.additionalImages, imgIdx)}
                                className="aspect-[4/3] rounded-xs overflow-hidden border border-[#C79A6B]/10 hover:border-[#C79A6B]/40 cursor-pointer relative group"
                              >
                                <img 
                                  src={img} 
                                  alt={`Log ${imgIdx + 1}`} 
                                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-[#0B0B0B]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <Maximize2 className="w-4 h-4 text-[#C79A6B]" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Participants Panel */}
                      {selectedEvent.participants && (
                        <div className="space-y-4 pt-4 border-t border-[#C79A6B]/10">
                          <span className="text-[10px] font-mono text-[#C79A6B] tracking-[0.2em] uppercase font-bold block">
                            — Interactive Participants
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {/* Students */}
                            {selectedEvent.participants.students.length > 0 && (
                              <div className="space-y-1.5">
                                <h5 className="text-[9px] font-mono uppercase text-[#8F6A48]/80 font-bold tracking-widest flex items-center gap-1">
                                  <Users className="w-3 h-3 text-[#C79A6B]" /> Students
                                </h5>
                                <ul className="text-xs space-y-1 text-[#F5F2EE]/80 font-mono">
                                  {selectedEvent.participants.students.map((p, pIdx) => (
                                    <li key={pIdx}>• {p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Teachers */}
                            {selectedEvent.participants.teachers.length > 0 && (
                              <div className="space-y-1.5">
                                <h5 className="text-[9px] font-mono uppercase text-[#8F6A48]/80 font-bold tracking-widest flex items-center gap-1">
                                  <User className="w-3 h-3 text-[#C79A6B]" /> Faculty
                                </h5>
                                <ul className="text-xs space-y-1 text-[#F5F2EE]/80 font-mono">
                                  {selectedEvent.participants.teachers.map((p, pIdx) => (
                                    <li key={pIdx}>• {p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Guests */}
                            {selectedEvent.participants.guests.length > 0 && (
                              <div className="space-y-1.5">
                                <h5 className="text-[9px] font-mono uppercase text-[#8F6A48]/80 font-bold tracking-widest flex items-center gap-1">
                                  <Award className="w-3 h-3 text-[#C79A6B]" /> Invited Guests
                                </h5>
                                <ul className="text-xs space-y-1 text-[#F5F2EE]/80 font-mono">
                                  {selectedEvent.participants.guests.map((p, pIdx) => (
                                    <li key={pIdx}>• {p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* RIGHT SIDE: Key Event Information Block & Dynamic Timeline */}
                    <div className="lg:col-span-4 space-y-8 lg:border-l lg:border-[#C79A6B]/15 lg:pl-8 text-left">
                      
                      {/* Metadata Table */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono text-[#C79A6B] tracking-[0.2em] uppercase font-bold block">
                          — Key Chronicle Info
                        </span>
                        <div className="bg-[#0B0B0B]/60 border border-[#C79A6B]/15 rounded-xs p-5 space-y-3.5 font-mono text-xs">
                          <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-[#C79A6B] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] text-[#8F6A48]/80 uppercase font-bold">Date</p>
                              <p className="text-[#F5F2EE]/90">{selectedEvent.date}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-[#C79A6B] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] text-[#8F6A48]/80 uppercase font-bold">Duration</p>
                              <p className="text-[#F5F2EE]/90">{selectedEvent.time}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-[#C79A6B] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] text-[#8F6A48]/80 uppercase font-bold">Location</p>
                              <p className="text-[#F5F2EE]/90">{selectedEvent.location}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Compass className="w-4 h-4 text-[#C79A6B] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] text-[#8F6A48]/80 uppercase font-bold">Organizer</p>
                              <p className="text-[#F5F2EE]/90">{selectedEvent.organizer}</p>
                            </div>
                          </div>

                          {selectedEvent.chiefGuest && (
                            <div className="flex items-start gap-3">
                              <Award className="w-4 h-4 text-[#C79A6B] flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[9px] text-[#8F6A48]/80 uppercase font-bold">Chief Guest</p>
                                <p className="text-[#F5F2EE]/90">{selectedEvent.chiefGuest}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-[#C79A6B] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] text-[#8F6A48]/80 uppercase font-bold">Faculty Lead</p>
                              <p className="text-[#F5F2EE]/90">{selectedEvent.facultyCoordinator}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <BookOpen className="w-4 h-4 text-[#C79A6B] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] text-[#8F6A48]/80 uppercase font-bold">Target Cohort</p>
                              <p className="text-[#F5F2EE]/90">{selectedEvent.batch}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Structured Botanical Timeline */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono text-[#C79A6B] tracking-[0.2em] uppercase font-bold block">
                          — Program Timeline
                        </span>
                        <div className="space-y-6 relative pl-4 border-l border-[#C79A6B]/20">
                          {/* Item 1 */}
                          <div className="relative">
                            <div className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 bg-[#C79A6B] border border-[#0B0B0B] rounded-full" />
                            <p className="text-[9.5px] font-mono text-[#C79A6B] uppercase font-bold">Commencement & Registry</p>
                            <p className="text-[11.5px] text-[#F5F2EE]/75 font-light leading-relaxed mt-1">
                              Gathering and registration at {selectedEvent.location}. Preparatory briefings and curation setups.
                            </p>
                          </div>

                          {/* Item 2 */}
                          <div className="relative">
                            <div className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 bg-[#C79A6B] border border-[#0B0B0B] rounded-full" />
                            <p className="text-[9.5px] font-mono text-[#C79A6B] uppercase font-bold">Principal Activity Session</p>
                            <p className="text-[11.5px] text-[#F5F2EE]/75 font-light leading-relaxed mt-1">
                              Interactive core of {selectedEvent.category} orchestrated by {selectedEvent.facultyCoordinator}.
                            </p>
                          </div>

                          {/* Item 3 */}
                          <div className="relative">
                            <div className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 bg-[#C79A6B] border border-[#0B0B0B] rounded-full" />
                            <p className="text-[9.5px] font-mono text-[#C79A6B] uppercase font-bold">Closing Remarks</p>
                            <p className="text-[11.5px] text-[#F5F2EE]/75 font-light leading-relaxed mt-1">
                              Summary, archiving, and key addresses by {selectedEvent.chiefGuest || 'Curators Board'}.
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* RELATED EVENTS PANEL */}
                  {relatedEvents.length > 0 && (
                    <div className="space-y-6 pt-10 border-t border-[#C79A6B]/15">
                      <span className="text-[10px] font-mono text-[#C79A6B] tracking-[0.2em] uppercase font-bold flex items-center gap-1.5 justify-start">
                        <Layers className="w-3.5 h-3.5 text-[#C79A6B]" /> Related Botanical Chronicles
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedEvents.map((rEvent) => (
                          <div
                            key={rEvent.id}
                            onClick={() => setSelectedEvent(rEvent)}
                            className="bg-[#0B0B0B]/80 hover:bg-[#0B0B0B] border border-[#C79A6B]/15 hover:border-[#C79A6B]/40 p-4 rounded-xs text-left cursor-pointer transition-all space-y-3 group"
                          >
                            <div className="aspect-[16/9] w-full overflow-hidden rounded-xs bg-[#111111] border border-[#C79A6B]/5">
                              <img src={rEvent.coverImage} alt={rEvent.title} className="w-full h-full object-cover opacity-75 group-hover:scale-102 transition-transform duration-500" referrerPolicy="no-referrer" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[8px] font-mono bg-[#C79A6B]/10 border border-[#C79A6B]/25 text-[#C79A6B] px-1.5 py-0.5 rounded uppercase tracking-wider">
                                {rEvent.category}
                              </span>
                              <h5 className="font-serif text-sm text-[#F5F2EE] group-hover:text-[#C79A6B] transition-colors leading-tight pt-1">
                                {rEvent.title}
                              </h5>
                              <p className="text-[9.5px] font-mono text-[#8F6A48]">
                                {rEvent.date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen Lightbox Image Viewer */}
        <AnimatePresence>
          {currentLightboxIndex !== -1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-55 bg-[#070707]/99 flex flex-col justify-between p-4 md:p-8 select-none"
              onClick={closeLightbox}
            >
              
              {/* Top Controls Panel */}
              <div className="flex items-center justify-between z-50 text-white font-mono text-xs max-w-7xl mx-auto w-full">
                <span>
                  Log Image {currentLightboxIndex + 1} of {lightboxImages.length}
                </span>
                <div className="flex items-center gap-4">
                  {/* Fullscreen Toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsLightboxFullscreen(!isLightboxFullscreen); }}
                    className="p-2 rounded-full border border-white/15 bg-[#111111]/80 hover:bg-[#111111] hover:border-white/30 text-white cursor-pointer transition-colors"
                  >
                    {isLightboxFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  {/* Close Lightbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                    className="p-2 rounded-full border border-white/15 bg-[#111111]/80 hover:bg-[#111111] hover:border-white/30 text-[#C79A6B] cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Central Frame & Navigation arrows */}
              <div className="flex-1 flex items-center justify-between max-w-7xl mx-auto w-full relative">
                
                {/* Left Arrow */}
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevNextLightbox(-1); }}
                  className="absolute left-2 md:left-6 z-50 p-3 md:p-4 rounded-full border border-white/10 bg-[#0B0B0B]/80 hover:bg-[#0B0B0B] text-white cursor-pointer hover:border-white/40 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Central Image Panel */}
                <div className="w-full h-full flex items-center justify-center p-6 md:p-16">
                  <motion.img
                    key={currentLightboxIndex}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    src={lightboxImages[currentLightboxIndex]}
                    alt={`Event Full ${currentLightboxIndex + 1}`}
                    className={`object-contain max-w-full max-h-full rounded shadow-2xl transition-all duration-300 ${
                      isLightboxFullscreen ? 'scale-105' : ''
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Right Arrow */}
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevNextLightbox(1); }}
                  className="absolute right-2 md:right-6 z-50 p-3 md:p-4 rounded-full border border-white/10 bg-[#0B0B0B]/80 hover:bg-[#0B0B0B] text-white cursor-pointer hover:border-white/40 transition-all"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>

              </div>

              {/* Bottom indicators */}
              <div className="text-center z-50 font-mono text-[10px] text-white/50 max-w-7xl mx-auto w-full">
                Use Left/Right keyboard arrows to navigate • Escape to exit
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
