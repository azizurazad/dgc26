import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Star, Download, ExternalLink, Bookmark, Share2, Search, SlidersHorizontal, 
  Eye, Clock, ArrowUpDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, 
  Check, CheckCircle2, Info, X, BookOpen, Sparkles, Flame, History, Award, BookOpenCheck
} from 'lucide-react';
import { AcademicNote } from '../types';

interface AcademicNotesProps {
  notes: AcademicNote[];
  onDownloadNote: (id: string) => void;
  isAdmin?: boolean;
}

const CATEGORIES = [
  'Class Note', 'Lecture Note', 'Hand Note', 'Lab Manual', 'Practical Sheet', 
  'Assignment', 'Presentation', 'Question Bank', 'Previous Question', 'Suggestion', 
  'Research Paper', 'Field Guide', 'Taxonomic Key', 'Book', 'Seminar', 'Others'
];

const SUBJECTS = [
  'Plant Physiology', 'Plant Taxonomy', 'Plant Anatomy', 'Plant Ecology', 'Genetics', 
  'Microbiology', 'Biochemistry', 'Bryophyte', 'Pteridophyte', 'Gymnosperm', 
  'Angiosperm', 'Plant Pathology', 'Economic Botany', 'Systematic Botany', 'Others'
];

const SEMESTERS = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester', 'M.S. General', 'Others'];

export default function AcademicNotes({ notes, onDownloadNote }: AcademicNotesProps) {
  // Main states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest'); // newest, oldest, downloads, featured, alphabetical
  
  // Interaction states
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks'>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const cached = localStorage.getItem('dgc_bookmarked_notes');
    return cached ? JSON.parse(cached) : [];
  });
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const cached = localStorage.getItem('dgc_recently_viewed_notes');
    return cached ? JSON.parse(cached) : [];
  });
  
  // UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedNoteForPreview, setSelectedNoteForPreview] = useState<AcademicNote | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Sync bookmarks
  useEffect(() => {
    localStorage.setItem('dgc_bookmarked_notes', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Sync recently viewed
  useEffect(() => {
    localStorage.setItem('dgc_recently_viewed_notes', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleCopyLink = (note: AcademicNote, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?noteId=${note.id}#academic-notes`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedNoteId(note.id);
      setTimeout(() => setCopiedNoteId(null), 2000);
    });
  };

  const handleOpenPreview = (note: AcademicNote) => {
    setSelectedNoteForPreview(note);
    
    // Track recently viewed
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== note.id);
      return [note.id, ...filtered].slice(0, 5); // keep last 5
    });
  };

  const handleDownload = (note: AcademicNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onDownloadNote(note.id);
    
    // Simulate real file download if it points to a actual asset
    if (note.pdfUrl && note.pdfUrl !== '#') {
      const link = document.createElement('a');
      link.href = note.pdfUrl;
      link.target = '_blank';
      link.download = `${note.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Extract list of teachers and sessions from notes for filter dropdowns
  const allTeachers = useMemo(() => {
    const list = new Set<string>();
    notes.forEach(n => { if (n.teacher) list.add(n.teacher); });
    return Array.from(list);
  }, [notes]);

  const allSessions = useMemo(() => {
    const list = new Set<string>();
    notes.forEach(n => { if (n.session) list.add(n.session); });
    return Array.from(list);
  }, [notes]);

  // Filter and Sort published notes
  const filteredNotes = useMemo(() => {
    let result = notes.filter(note => note.published);

    // Bookmarks Tab filter
    if (activeTab === 'bookmarks') {
      result = result.filter(note => bookmarkedIds.includes(note.id));
    }

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(note => note.category === selectedCategory);
    }

    // Subject Filter
    if (selectedSubject !== 'All') {
      result = result.filter(note => note.subject === selectedSubject);
    }

    // Semester Filter
    if (selectedSemester !== 'All') {
      result = result.filter(note => note.semester === selectedSemester);
    }

    // Teacher Filter
    if (selectedTeacher !== 'All') {
      result = result.filter(note => note.teacher === selectedTeacher);
    }

    // Session Filter
    if (selectedSession !== 'All') {
      result = result.filter(note => note.session === selectedSession);
    }

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.title.toLowerCase().includes(q) ||
        note.subtitle?.toLowerCase().includes(q) ||
        note.subject.toLowerCase().includes(q) ||
        note.category.toLowerCase().includes(q) ||
        note.author.toLowerCase().includes(q) ||
        note.teacher.toLowerCase().includes(q) ||
        note.semester.toLowerCase().includes(q) ||
        note.session.toLowerCase().includes(q) ||
        note.description.toLowerCase().includes(q) ||
        note.keywords.some(k => k.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      // Pinned / Featured notes ALWAYS stay at the very top
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'downloads':
          return b.downloadCount - a.downloadCount;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [notes, searchQuery, selectedCategory, selectedSubject, selectedSemester, selectedTeacher, selectedSession, sortBy, activeTab, bookmarkedIds]);

  // Derived subsets
  const featuredNotes = useMemo(() => {
    return notes.filter(n => n.featured && n.published).slice(0, 3);
  }, [notes]);

  const mostDownloaded = useMemo(() => {
    return [...notes].filter(n => n.published).sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 3);
  }, [notes]);

  const popularSubjects = useMemo(() => {
    const counts: { [key: string]: number } = {};
    notes.filter(n => n.published).forEach(n => {
      counts[n.subject] = (counts[n.subject] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [notes]);

  const recentlyViewedNotes = useMemo(() => {
    return recentlyViewed
      .map(id => notes.find(n => n.id === id))
      .filter((n): n is AcademicNote => !!n && n.published);
  }, [recentlyViewed, notes]);

  // Related Notes Recommendation (based on current selected preview note)
  const relatedNotes = useMemo(() => {
    if (!selectedNoteForPreview) return [];
    return notes
      .filter(n => n.id !== selectedNoteForPreview.id && n.published && (n.subject === selectedNoteForPreview.subject || n.category === selectedNoteForPreview.category))
      .slice(0, 3);
  }, [selectedNoteForPreview, notes]);

  // Reading time estimate helper
  const estimateReadingTime = (description: string) => {
    const wordCount = description.split(/\s+/).length;
    const time = Math.ceil(wordCount / 15) + 3; // words per min estimate plus standard offset
    return `${time} min read`;
  };

  return (
    <section 
      id="academic-notes" 
      className="relative w-full py-16 md:py-20 bg-[#0B0B0B] text-[#F5F2EE] px-6 md:px-12 border-b border-[#C79A6B]/15"
    >
      <div className="w-full max-w-7xl mx-auto space-y-10">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end justify-between border-b border-[#C79A6B]/15 pb-5">
          <div className="space-y-3">
            <span className="text-xs font-mono tracking-[0.3em] text-[#C79A6B] uppercase font-semibold">
              — UNIVERSITY REPOSITORY
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-none text-[#F5F2EE]">
              Academic <span className="font-serif italic text-[#C79A6B] font-normal">Notes & PDF Library</span>
            </h2>
            <p className="text-xs md:text-sm text-[#F5F2EE]/60 font-light max-w-3xl leading-relaxed">
              A peerless, curated collection of lecture compilations, taxonomic keys, practical manuals, and research drafts maintained by Dinajpur Government College botanical scholars. Styled in elite museum-grade format.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#111111] p-1 border border-[#C79A6B]/15 rounded-full self-stretch lg:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-full text-[10px] font-mono tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-[#C79A6B] text-[#0B0B0B] font-bold shadow-md' 
                  : 'text-[#F5F2EE]/60 hover:text-[#F5F2EE]'
              }`}
            >
              <BookOpenCheck className="w-3.5 h-3.5" /> All Notes
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-full text-[10px] font-mono tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'bookmarks' 
                  ? 'bg-[#C79A6B] text-[#0B0B0B] font-bold shadow-md' 
                  : 'text-[#F5F2EE]/60 hover:text-[#F5F2EE]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> Saved ({bookmarkedIds.length})
            </button>
          </div>
        </div>

        {/* TOP COMPILATIONS (FEATURED, MOST DOWNLOADED, RECENT VIEW) */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ⭐ FEATURED (PINNED) BLOCK */}
            <div className="lg:col-span-4 bg-[#111111]/70 border border-[#C79A6B]/15 p-6 rounded-xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#C79A6B]/10 to-transparent pointer-events-none" />
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#C79A6B] tracking-wider uppercase">
                  <Star className="w-4 h-4 fill-[#C79A6B]" />
                  <span>⭐ Featured Collection</span>
                </div>
                <h3 className="font-serif text-xl font-light text-[#F5F2EE]">Pinned Resources</h3>
                <p className="text-[11px] text-[#F5F2EE]/50 font-mono">HIGHEST ACADEMIC RELEVANCE</p>
                
                <div className="space-y-3 pt-2">
                  {featuredNotes.length === 0 ? (
                    <p className="text-xs italic text-[#8F6A48]">No pinned resources selected.</p>
                  ) : (
                    featuredNotes.map(note => (
                      <div 
                        key={note.id} 
                        onClick={() => handleOpenPreview(note)}
                        className="group flex gap-3 p-2.5 border border-[#C79A6B]/10 hover:border-[#C79A6B]/30 bg-[#0B0B0B]/85 transition-all duration-300 rounded-xs cursor-pointer"
                      >
                        <div className="w-10 h-12 flex-shrink-0 bg-[#161616] border border-[#C79A6B]/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#C79A6B]" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs font-medium text-[#F5F2EE] group-hover:text-[#C79A6B] transition-colors truncate">{note.title}</p>
                          <p className="text-[9px] text-[#8F6A48] font-mono tracking-wider uppercase">{note.category} • {note.subject}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="border-t border-[#C79A6B]/10 pt-4 mt-6 text-center">
                <span className="text-[9px] font-mono tracking-widest text-[#8F6A48] uppercase">PINNED BY THE DEPARTMENT OF BOTANY</span>
              </div>
            </div>

            {/* 🔥 MOST DOWNLOADED BLOCK */}
            <div className="lg:col-span-4 bg-[#111111]/70 border border-[#C79A6B]/15 p-6 rounded-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#C79A6B] tracking-wider uppercase">
                  <Flame className="w-4 h-4 text-[#C79A6B]" />
                  <span>🔥 Most Downloaded</span>
                </div>
                <h3 className="font-serif text-xl font-light text-[#F5F2EE]">Popular References</h3>
                <p className="text-[11px] text-[#F5F2EE]/50 font-mono">PEER-CITATIONS LEADERBOARD</p>
                
                <div className="space-y-3 pt-2">
                  {mostDownloaded.map((note, index) => (
                    <div 
                      key={note.id} 
                      onClick={() => handleOpenPreview(note)}
                      className="group flex items-center justify-between p-2.5 border border-[#C79A6B]/10 hover:border-[#C79A6B]/30 bg-[#0B0B0B]/85 transition-all duration-300 rounded-xs cursor-pointer"
                    >
                      <div className="flex gap-3 min-w-0 items-center">
                        <span className="font-serif text-xl text-[#8F6A48] font-light w-4">0{index + 1}</span>
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs font-medium text-[#F5F2EE] group-hover:text-[#C79A6B] transition-colors truncate">{note.title}</p>
                          <p className="text-[9px] text-[#8F6A48] font-mono">{note.category} • {note.downloadCount} downloads</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-[#C79A6B]/10 pt-4 mt-6 flex justify-between items-center text-[10px] font-mono text-[#8F6A48] uppercase">
                <span>Total Index Downloads</span>
                <span className="text-[#C79A6B] font-bold">
                  {notes.reduce((acc, n) => acc + n.downloadCount, 0)} Stats
                </span>
              </div>
            </div>

            {/* 🕰️ RECENTLY VIEWED & POPULAR SUBJECTS */}
            <div className="lg:col-span-4 bg-[#111111]/70 border border-[#C79A6B]/15 p-6 rounded-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#C79A6B] tracking-wider uppercase">
                  <History className="w-4 h-4 text-[#C79A6B]" />
                  <span>Recently Viewed / Topics</span>
                </div>
                
                {recentlyViewedNotes.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-[10px] text-[#F5F2EE]/50 font-mono tracking-wider uppercase">YOUR RECENT EXPLORATIONS</p>
                    {recentlyViewedNotes.slice(0, 2).map(note => (
                      <div 
                        key={note.id} 
                        onClick={() => handleOpenPreview(note)}
                        className="group flex gap-2.5 p-2 bg-[#0B0B0B]/80 border border-[#C79A6B]/10 hover:border-[#C79A6B]/30 transition-all rounded-xs cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-[#C79A6B]/70" />
                        <span className="text-xs text-[#F5F2EE]/80 group-hover:text-[#C79A6B] truncate">{note.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-[#F5F2EE]/50 font-mono tracking-wider uppercase">POPULAR SUBJECTS</p>
                    <div className="grid grid-cols-2 gap-2">
                      {popularSubjects.map(({ subject, count }) => (
                        <div 
                          key={subject}
                          onClick={() => { setSelectedSubject(subject); setSelectedCategory('All'); }}
                          className="p-2 border border-[#C79A6B]/10 hover:border-[#C79A6B]/30 bg-[#0B0B0B]/85 rounded text-center cursor-pointer transition-all duration-300"
                        >
                          <p className="text-[10px] font-serif text-[#F5F2EE] truncate">{subject}</p>
                          <p className="text-[8px] font-mono text-[#8F6A48] uppercase mt-0.5">{count} notes</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t border-[#C79A6B]/10 pt-4 mt-6">
                <p className="text-[10px] text-[#8F6A48] font-mono tracking-wider uppercase">LIBRARIAN REVIEWS</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 rounded-full bg-[#C79A6B]/20 border border-[#C79A6B]/40 flex items-center justify-center text-[8px] text-[#C79A6B]">DGC</div>
                  <span className="text-[9px] text-[#F5F2EE]/60 italic font-serif">"Empirical taxonomic verification active"</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* Real-time search */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search notes by Title, Subject, Category, Author, Teacher, Keywords, Semester..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111111] border border-[#C79A6B]/20 focus:border-[#C79A6B] text-[#F5F2EE] text-xs font-mono tracking-wider pl-11 pr-4 py-3.5 rounded-xs outline-none transition-all duration-300"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C79A6B]" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F6A48] hover:text-[#F5F2EE]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-5 py-3.5 border text-xs font-mono tracking-widest uppercase transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                showAdvancedFilters || selectedSubject !== 'All' || selectedSemester !== 'All' || selectedTeacher !== 'All' || selectedSession !== 'All'
                  ? 'border-[#C79A6B] bg-[#C79A6B]/10 text-[#C79A6B]' 
                  : 'border-[#C79A6B]/20 bg-[#111111] text-[#F5F2EE]/70 hover:border-[#C79A6B]/55 hover:text-[#F5F2EE]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#111111] border border-[#C79A6B]/20 focus:border-[#C79A6B] text-[#F5F2EE] text-xs font-mono tracking-wider px-4 py-3.5 rounded-xs outline-none transition-all duration-300 appearance-none cursor-pointer pr-10 min-w-[160px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="downloads">Most Downloaded</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F6A48] pointer-events-none" />
            </div>
          </div>

          {/* ADVANCED FILTERS PANEL */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-[#111111] border border-[#C79A6B]/15 p-6 rounded-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Subject Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-[#8F6A48] uppercase tracking-wider block">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#C79A6B]/15 focus:border-[#C79A6B] text-[#F5F2EE] text-[11px] font-mono p-2.5 rounded-xs outline-none transition-colors"
                    >
                      <option value="All">All Subjects</option>
                      {SUBJECTS.map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-[#8F6A48] uppercase tracking-wider block">Semester</label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#C79A6B]/15 focus:border-[#C79A6B] text-[#F5F2EE] text-[11px] font-mono p-2.5 rounded-xs outline-none transition-colors"
                    >
                      <option value="All">All Semesters</option>
                      {SEMESTERS.map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>

                  {/* Teacher Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-[#8F6A48] uppercase tracking-wider block">Verified Teacher</label>
                    <select
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#C79A6B]/15 focus:border-[#C79A6B] text-[#F5F2EE] text-[11px] font-mono p-2.5 rounded-xs outline-none transition-colors"
                    >
                      <option value="All">All Teachers</option>
                      {allTeachers.map(teach => (
                        <option key={teach} value={teach}>{teach}</option>
                      ))}
                    </select>
                  </div>

                  {/* Session Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-[#8F6A48] uppercase tracking-wider block">Academic Session</label>
                    <select
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#C79A6B]/15 focus:border-[#C79A6B] text-[#F5F2EE] text-[11px] font-mono p-2.5 rounded-xs outline-none transition-colors"
                    >
                      <option value="All">All Sessions</option>
                      {allSessions.map(sess => (
                        <option key={sess} value={sess}>{sess}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-1.5 border text-[9px] font-mono tracking-widest uppercase transition-all duration-300 rounded-full cursor-pointer whitespace-nowrap ${
                selectedCategory === 'All' 
                  ? 'border-[#C79A6B] bg-[#C79A6B]/15 text-[#C79A6B]' 
                  : 'border-[#C79A6B]/10 bg-transparent text-[#F5F2EE]/50 hover:border-[#C79A6B]/30 hover:text-[#F5F2EE]'
              }`}
            >
              All Categories ({notes.filter(n => n.published).length})
            </button>
            {CATEGORIES.map((cat) => {
              const noteCount = notes.filter(n => n.category === cat && n.published).length;
              if (noteCount === 0) return null; // Only show active categories
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 border text-[9px] font-mono tracking-widest uppercase transition-all duration-300 rounded-full cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'border-[#C79A6B] bg-[#C79A6B]/15 text-[#C79A6B]' 
                      : 'border-[#C79A6B]/10 bg-transparent text-[#F5F2EE]/50 hover:border-[#C79A6B]/30 hover:text-[#F5F2EE]'
                  }`}
                >
                  {cat} ({noteCount})
                </button>
              );
            })}
          </div>

          {/* Active filter badges indicator */}
          {(selectedCategory !== 'All' || selectedSubject !== 'All' || selectedSemester !== 'All' || selectedTeacher !== 'All' || selectedSession !== 'All' || searchQuery) && (
            <div className="flex flex-wrap gap-2 items-center text-[10px] font-mono">
              <span className="text-[#8F6A48] uppercase tracking-wider">Active Filters:</span>
              
              {searchQuery && (
                <span className="px-2.5 py-0.5 bg-[#C79A6B]/5 border border-[#C79A6B]/20 text-[#C79A6B] rounded-full flex items-center gap-1.5">
                  Search: "{searchQuery}"
                  <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="px-2.5 py-0.5 bg-[#C79A6B]/5 border border-[#C79A6B]/20 text-[#C79A6B] rounded-full flex items-center gap-1.5">
                  Cat: {selectedCategory}
                  <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setSelectedCategory('All')} />
                </span>
              )}
              {selectedSubject !== 'All' && (
                <span className="px-2.5 py-0.5 bg-[#C79A6B]/5 border border-[#C79A6B]/20 text-[#C79A6B] rounded-full flex items-center gap-1.5">
                  Sub: {selectedSubject}
                  <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setSelectedSubject('All')} />
                </span>
              )}
              {selectedSemester !== 'All' && (
                <span className="px-2.5 py-0.5 bg-[#C79A6B]/5 border border-[#C79A6B]/20 text-[#C79A6B] rounded-full flex items-center gap-1.5">
                  Sem: {selectedSemester}
                  <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setSelectedSemester('All')} />
                </span>
              )}
              {selectedTeacher !== 'All' && (
                <span className="px-2.5 py-0.5 bg-[#C79A6B]/5 border border-[#C79A6B]/20 text-[#C79A6B] rounded-full flex items-center gap-1.5">
                  Teacher: {selectedTeacher}
                  <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setSelectedTeacher('All')} />
                </span>
              )}
              {selectedSession !== 'All' && (
                <span className="px-2.5 py-0.5 bg-[#C79A6B]/5 border border-[#C79A6B]/20 text-[#C79A6B] rounded-full flex items-center gap-1.5">
                  Session: {selectedSession}
                  <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setSelectedSession('All')} />
                </span>
              )}

              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedSubject('All');
                  setSelectedSemester('All');
                  setSelectedTeacher('All');
                  setSelectedSession('All');
                }}
                className="text-[#C79A6B] underline tracking-widest uppercase hover:text-[#F5F2EE] ml-2 cursor-pointer"
              >
                Reset All
              </button>
            </div>
          )}
        </div>

        {/* REPOSITORY GRID */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[#C79A6B]/15 rounded-xs bg-[#111111]/30">
            <BookOpen className="w-12 h-12 text-[#8F6A48] mx-auto opacity-40 mb-4" />
            <p className="font-serif text-lg text-[#F5F2EE]/60">No academic resources located</p>
            <p className="text-xs font-mono text-[#8F6A48] uppercase mt-2 max-w-md mx-auto leading-relaxed">
              We could not find any archived assets matching your filters or searches. Adjust your selections or clear queries to reveal all library indexes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNotes.map((note, index) => {
              const isBookmarked = bookmarkedIds.includes(note.id);
              const readTime = estimateReadingTime(note.description);
              
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: (index % 3) * 0.1 }}
                  className={`group relative bg-[#111111]/90 border hover:border-[#C79A6B]/45 rounded-xs p-6 transition-all duration-500 flex flex-col justify-between h-[450px] shadow-2xl relative overflow-hidden ${
                    note.featured ? 'border-[#C79A6B]/30 bg-[#161411]/50' : 'border-[#C79A6B]/15'
                  }`}
                >
                  {/* Subtle Featured Glow */}
                  {note.featured && (
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#C79A6B] to-transparent" />
                  )}

                  {/* Header Row */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      {/* Category Badge & Icon */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#C79A6B]/10 border border-[#C79A6B]/25 flex items-center justify-center text-[#C79A6B] group-hover:bg-[#C79A6B] group-hover:text-[#0B0B0B] transition-colors duration-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="px-2.5 py-0.5 bg-[#C79A6B]/5 border border-[#C79A6B]/20 rounded-full text-[8px] font-mono tracking-widest text-[#C79A6B] uppercase font-semibold">
                          {note.category}
                        </span>
                      </div>

                      {/* Featured Pinned Badge / Action buttons */}
                      <div className="flex items-center gap-2">
                        {note.featured && (
                          <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#C79A6B] text-[#0B0B0B] rounded-full text-[7.5px] font-mono tracking-widest uppercase font-bold">
                            <Star className="w-2.5 h-2.5 fill-[#0B0B0B]" /> Featured
                          </span>
                        )}
                        <button
                          onClick={(e) => handleToggleBookmark(note.id, e)}
                          className="p-1.5 rounded-full bg-[#0B0B0B] border border-[#C79A6B]/10 text-[#8F6A48] hover:text-[#C79A6B] hover:border-[#C79A6B]/30 transition-all cursor-pointer"
                          title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#C79A6B] text-[#C79A6B]' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata indicators */}
                    <div className="flex items-center gap-2 text-[9px] font-mono text-[#8F6A48] tracking-wider uppercase">
                      <span>{note.subject}</span>
                      <span>•</span>
                      <span>{note.semester}</span>
                    </div>

                    {/* Title and description */}
                    <div className="space-y-2">
                      <h3 className="font-serif text-xl font-light text-[#F5F2EE] group-hover:text-[#C79A6B] transition-colors leading-snug line-clamp-2">
                        {note.title}
                      </h3>
                      {note.subtitle && (
                        <p className="text-[11px] font-mono text-[#F5F2EE]/50 italic leading-snug line-clamp-1">
                          {note.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-[#F5F2EE]/65 leading-relaxed font-light line-clamp-3">
                        {note.description}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic footer details */}
                  <div className="space-y-4 pt-4 border-t border-[#C79A6B]/10">
                    
                    {/* Authorship details */}
                    <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                      <div>
                        <span className="text-[#8F6A48] uppercase tracking-wider block text-[8px]">Compiled By:</span>
                        <span className="text-[#F5F2EE]/85 block truncate">{note.author}</span>
                      </div>
                      <div>
                        <span className="text-[#8F6A48] uppercase tracking-wider block text-[8px]">Verified By:</span>
                        <span className="text-[#F5F2EE]/85 block truncate">{note.teacher}</span>
                      </div>
                    </div>

                    {/* Technical stats */}
                    <div className="flex justify-between items-center text-[9px] font-mono text-[#8F6A48]/85">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>{readTime}</span>
                      </div>
                      <div>
                        <span>Size: {note.fileSize}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{note.downloadCount} downloads</span>
                      </div>
                    </div>

                    {/* Button grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleOpenPreview(note)}
                        className="w-full py-2.5 bg-[#C79A6B]/5 border border-[#C79A6B]/20 hover:border-[#C79A6B] text-[9.5px] font-mono tracking-widest text-[#C79A6B] hover:text-[#F5F2EE] uppercase transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-1.5 group-hover:bg-[#C79A6B]/10"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={(e) => handleDownload(note, e)}
                        className="w-full py-2.5 bg-[#C79A6B] border border-[#C79A6B] text-[9.5px] font-mono tracking-widest text-[#0B0B0B] font-bold uppercase hover:bg-transparent hover:text-[#C79A6B] transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>

                    {/* Action copy/share bar */}
                    <div className="flex items-center justify-between text-[8px] font-mono text-[#8F6A48] border-t border-[#C79A6B]/5 pt-2">
                      <span>Archived: {new Date(note.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => handleCopyLink(note, e)}
                        className="hover:text-[#C79A6B] flex items-center gap-1 cursor-pointer"
                        title="Copy Share Link"
                      >
                        {copiedNoteId === note.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-green-400" />
                            <span className="text-green-400 font-bold uppercase">Copied Link!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-2.5 h-2.5" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>

      {/* ==================================================
          ULTRA-PREMIUM DOCUMENT PREVIEW MODAL (REDESIGNED)
          ================================================== */}
      <AnimatePresence>
        {selectedNoteForPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0B]/90 backdrop-blur-md">
            
            {/* Elegant Glass Card container */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg bg-[#080808]/95 border border-[#C79A6B]/25 rounded-[18px] p-5 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col justify-between"
            >
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedNoteForPreview(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full border border-[#C79A6B]/10 hover:border-[#C79A6B]/30 bg-black/40 text-[#8F6A48] hover:text-[#C79A6B] transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6 text-center select-text">
                {/* 📄 Document Icon in golden ring */}
                <div className="mx-auto w-14 h-14 bg-[#C79A6B]/10 border border-[#C79A6B]/20 rounded-full flex items-center justify-center text-[#C79A6B]">
                  <FileText className="w-6 h-6" />
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-[#C79A6B] tracking-widest uppercase bg-[#C79A6B]/5 border border-[#C79A6B]/15 px-2.5 py-0.5 rounded-full">
                    {selectedNoteForPreview.category}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-white leading-snug">
                    {selectedNoteForPreview.title}
                  </h3>
                  {selectedNoteForPreview.subtitle && (
                    <p className="text-xs font-mono text-[#8F6A48] italic">{selectedNoteForPreview.subtitle}</p>
                  )}
                </div>

                {/* Metadata list */}
                <div className="border-t border-b border-[#C79A6B]/15 py-4 space-y-2.5 text-xs text-left">
                  <div className="flex justify-between items-center gap-4">
                    <span className="font-mono text-[#8F6A48] uppercase text-[10px] tracking-wider">Subject</span>
                    <span className="font-serif text-[#F5F2EE] font-medium text-right">{selectedNoteForPreview.subject}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="font-mono text-[#8F6A48] uppercase text-[10px] tracking-wider">Semester</span>
                    <span className="font-serif text-[#F5F2EE] font-medium text-right">{selectedNoteForPreview.semester}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="font-mono text-[#8F6A48] uppercase text-[10px] tracking-wider">Session</span>
                    <span className="font-mono text-[#F5F2EE] text-right">{selectedNoteForPreview.session}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="font-mono text-[#8F6A48] uppercase text-[10px] tracking-wider">Teacher</span>
                    <span className="font-serif text-[#F5F2EE] text-right">{selectedNoteForPreview.teacher}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="font-mono text-[#8F6A48] uppercase text-[10px] tracking-wider">Uploaded By</span>
                    <span className="font-serif text-[#F5F2EE] text-right">{selectedNoteForPreview.author}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="font-mono text-[#8F6A48] uppercase text-[10px] tracking-wider">Upload Date</span>
                    <span className="font-mono text-[#F5F2EE] text-right">
                      {new Date(selectedNoteForPreview.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="font-mono text-[#8F6A48] uppercase text-[10px] tracking-wider">File Size</span>
                    <span className="font-mono text-[#F5F2EE] text-right">{selectedNoteForPreview.fileSize || 'Unknown'}</span>
                  </div>
                </div>

                {/* Optional Description */}
                {selectedNoteForPreview.description && (
                  <div className="bg-[#0f0e0c]/60 border border-[#C79A6B]/10 p-4 rounded-lg text-left text-xs text-[#F5F2EE]/85 font-light leading-relaxed">
                    <span className="text-[9px] font-mono text-[#C79A6B] uppercase tracking-wider block mb-1">Curation Summary:</span>
                    {selectedNoteForPreview.description}
                  </div>
                )}

                {/* Bottom Action */}
                <a
                  href={selectedNoteForPreview.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleDownload(selectedNoteForPreview)}
                  className="w-full mt-4 py-3 bg-[#C79A6B] hover:bg-[#F5F2EE] text-black font-mono text-[11px] tracking-widest uppercase font-bold transition-all duration-300 rounded-[12px] flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.01]"
                >
                  <Download className="w-4 h-4" /> Download Note
                </a>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
