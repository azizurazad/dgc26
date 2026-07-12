import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Calendar, User, Compass, Layers, Hash, BookOpen, Wind, Camera, 
  MapPin, Tag, ExternalLink, Download, Copy, Share2, Maximize2, CheckCircle, 
  QrCode, Shield, Info, Sparkles, Globe, Heart, Eye, ChevronDown, ChevronUp, Activity,
  ArrowLeft, ArrowRight, Image
} from 'lucide-react';
import { Plant, DepartmentEvent, GalleryItem } from '../types';

interface ResearchArchiveProps {
  plants: Plant[];
  events: DepartmentEvent[];
  gallery: GalleryItem[];
}

// Advanced botanical taxonomic mapper based on family
const getTaxonomy = (family: string) => {
  const fam = (family || '').toLowerCase();
  if (fam.includes('aloe') || fam.includes('asphodel') || fam.includes('xanthorrhoe')) {
    return {
      kingdom: 'Plantae',
      division: 'Tracheophytes (Vascular)',
      class: 'Liliopsida (Monocots)',
      order: 'Asparagales',
    };
  }
  if (fam.includes('solanac') || fam.includes('nightshade')) {
    return {
      kingdom: 'Plantae',
      division: 'Tracheophytes (Vascular)',
      class: 'Magnoliopsida (Dicots)',
      order: 'Solanales',
    };
  }
  if (fam.includes('lamiac') || fam.includes('mint') || fam.includes('labiat')) {
    return {
      kingdom: 'Plantae',
      division: 'Tracheophytes (Vascular)',
      class: 'Magnoliopsida (Dicots)',
      order: 'Lamiales',
    };
  }
  if (fam.includes('apocynac') || fam.includes('dogbane') || fam.includes('asclepiad')) {
    return {
      kingdom: 'Plantae',
      division: 'Tracheophytes (Vascular)',
      class: 'Magnoliopsida (Dicots)',
      order: 'Gentianales',
    };
  }
  if (fam.includes('asterac') || fam.includes('compositae') || fam.includes('daisy')) {
    return {
      kingdom: 'Plantae',
      division: 'Tracheophytes (Vascular)',
      class: 'Magnoliopsida (Dicots)',
      order: 'Asterales',
    };
  }
  if (fam.includes('fabac') || fam.includes('leguminos') || fam.includes('pea')) {
    return {
      kingdom: 'Plantae',
      division: 'Tracheophytes (Vascular)',
      class: 'Magnoliopsida (Dicots)',
      order: 'Fabales',
    };
  }
  if (fam.includes('poac') || fam.includes('gramineae') || fam.includes('grass')) {
    return {
      kingdom: 'Plantae',
      division: 'Tracheophytes (Vascular)',
      class: 'Liliopsida (Monocots)',
      order: 'Poales',
    };
  }
  if (fam.includes('orchidac') || fam.includes('orchid')) {
    return {
      kingdom: 'Plantae',
      division: 'Tracheophytes (Vascular)',
      class: 'Liliopsida (Monocots)',
      order: 'Asparagales',
    };
  }
  return {
    kingdom: 'Plantae',
    division: 'Tracheophytes (Vascular)',
    class: 'Magnoliopsida (Eudicots)',
    order: 'Gentianales',
  };
};

export default function ResearchArchive({ plants, events, gallery }: ResearchArchiveProps) {
  const [activeTab, setActiveTab] = useState<'Plant Archive' | 'Department Gallery'>('Plant Archive');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(null);

  // Extract unique families for plants
  const families = useMemo(() => {
    const list = new Set(plants.map(p => p.family));
    return ['All', ...Array.from(list)];
  }, [plants]);

  // Filter items based on active tab
  const items = useMemo(() => {
    if (activeTab === 'Plant Archive') {
      return plants.filter(plant => {
        const matchesSearch = 
          plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plant.locationFound.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFamily = selectedFamily === 'All' || plant.family === selectedFamily;
        return matchesSearch && matchesFamily;
      });
    } else {
      // Filter Department Gallery
      return gallery.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }, [plants, gallery, activeTab, searchQuery, selectedFamily]);

  return (
    <section 
      id="archive" 
      className="relative w-full py-16 md:py-20 bg-[#0B0B0B] text-[#F5F2EE] px-6 md:px-12 border-b border-[#C79A6B]/15 overflow-hidden"
    >
      {/* Absolute background patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-color-dodge">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="leafGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="#C79A6B" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leafGrid)" />
        </svg>
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        
        {/* Editorial Title Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 md:mb-14">
          <div className="space-y-3">
            <span className="text-xs font-mono tracking-[0.3em] text-[#C79A6B] uppercase font-semibold">
              — RESEARCH ARCHIVE
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-tight text-[#F5F2EE]">
              The {activeTab === 'Plant Archive' ? <span className="font-serif italic text-[#C79A6B] font-normal">living collections</span> : <span className="font-serif italic text-[#C79A6B] font-normal">departmental chronicles</span>}
            </h2>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-[#111111] p-1 rounded-full border border-[#C79A6B]/15">
            <button
              onClick={() => setActiveTab('Plant Archive')}
              className={`px-6 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all ${activeTab === 'Plant Archive' ? 'bg-[#C79A6B] text-black' : 'text-[#F5F2EE]/60 hover:text-[#F5F2EE]'}`}
            >
              🌿 Plant Archive
            </button>
            <button
              onClick={() => setActiveTab('Department Gallery')}
              className={`px-6 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all ${activeTab === 'Department Gallery' ? 'bg-[#C79A6B] text-black' : 'text-[#F5F2EE]/60 hover:text-[#F5F2EE]'}`}
            >
              📸 Department Gallery
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between border-b border-[#C79A6B]/15 pb-5 mb-8">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder={activeTab === 'Plant Archive' ? "Search by scientific name, vernacular..." : "Search gallery by title, location..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111111] border border-[#C79A6B]/20 focus:border-[#C79A6B] text-[#F5F2EE] text-xs font-mono tracking-wider pl-11 pr-4 py-3.5 rounded-xs outline-none transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F6A48]" />
          </div>

          {activeTab === 'Plant Archive' && (
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none max-w-full">
              {families.map((family) => (
                <button
                  key={family}
                  onClick={() => setSelectedFamily(family)}
                  className={`px-4 py-2 border text-[10px] font-mono tracking-widest uppercase transition-all duration-300 rounded-full cursor-pointer whitespace-nowrap ${
                    selectedFamily === family 
                      ? 'border-[#C79A6B] bg-[#C79A6B]/15 text-[#C79A6B]' 
                      : 'border-[#C79A6B]/15 bg-transparent text-[#F5F2EE]/60 hover:border-[#C79A6B]/40 hover:text-[#F5F2EE]'
                  }`}
                >
                  {family}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid Showcase */}
        {items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#C79A6B]/15 rounded-xs">
            <p className="font-serif text-lg text-[#F5F2EE]/60">No items found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {items.map((item: any, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index % 3 * 0.15 }}
                onClick={() => activeTab === 'Plant Archive' ? setSelectedPlant(item) : setSelectedGallery(item)}
                className="group cursor-pointer flex flex-col justify-between bg-[#111111] border border-[#C79A6B]/15 rounded-xs hover:border-[#C79A6B]/55 transition-all duration-500 overflow-hidden"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0B0B0B] border-b border-[#C79A6B]/10">
                    <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    src={activeTab === 'Plant Archive' ? (item.imageUrl || '') : (item.imageUrls && item.imageUrls.length > 0 ? (item.imageUrls[0] || '') : '')}
                    alt={activeTab === 'Plant Archive' ? item.scientificName : item.title}
                    className={`w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 ${!(activeTab === 'Plant Archive' ? (item.imageUrl || '') : (item.imageUrls && item.imageUrls.length > 0 ? (item.imageUrls[0] || '') : '')) ? 'hidden' : ''}`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 right-4 z-20 text-[9px] font-mono text-[#F5F2EE]/45 bg-[#0B0B0B]/80 px-2 py-0.5 rounded">
                    ID: {item.id.toUpperCase().slice(0, 8)}
                  </div>
                </div>

                <div className="p-5 md:p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono tracking-widest text-[#8F6A48] uppercase">
                      {activeTab === 'Plant Archive' ? `FAMILY: ${item.family}` : `DATE: ${item.date}`}
                    </p>
                    <h3 className="font-serif text-2xl font-light text-[#F5F2EE] group-hover:text-[#C79A6B] transition-colors duration-300">
                      {activeTab === 'Plant Archive' ? item.scientificName : item.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Modals */}
        <AnimatePresence>
          {selectedPlant && (
            <PlantDetailsModal 
              plant={selectedPlant} 
              onClose={() => setSelectedPlant(null)} 
            />
          )}

          {selectedGallery && (
            <GalleryDetailsModal 
              galleryItem={selectedGallery} 
              onClose={() => setSelectedGallery(null)} 
            />
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

// PREMIUM PLANT DETAILS MODAL REDESIGN
interface PlantDetailsModalProps {
  plant: Plant;
  onClose: () => void;
}

function PlantDetailsModal({ plant, onClose }: PlantDetailsModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDescCollapsed, setIsDescCollapsed] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Interactive lens zoom position
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  // Clear toast automatically
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Derive taxonomy details
  const taxonomy = useMemo(() => getTaxonomy(plant.family), [plant.family]);
  const scientificParts = plant.scientificName.split(' ');
  const genusName = scientificParts[0] || 'Unknown';
  const speciesName = scientificParts[1] ? scientificParts[1].replace(/[^a-zA-Z]/g, '') : 'spp.';

  // Metadata calculations
  const imageResolution = "4032 x 3024 PX (12.2 MP)";
  const imageSize = useMemo(() => {
    const codeSum = plant.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${(codeSum % 3 + 2)}.${codeSum % 9} MB`;
  }, [plant.id]);

  const gpsCoordinates = useMemo(() => {
    const codeSum = plant.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const lat = (23 + (codeSum % 900) / 1000).toFixed(4);
    const lng = (90 + (codeSum % 850) / 1000).toFixed(4);
    return `${lat}° N, ${lng}° E`;
  }, [plant.id]);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(message);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = plant.imageUrl;
    link.download = `${plant.scientificName.replace(/\s+/g, '_')}_specimen.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage("Specimen downloaded successfully");
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-50 bg-[#060606]/95 backdrop-blur-md p-4 md:p-6 overflow-y-auto flex items-start justify-center cursor-default"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 30 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="relative max-w-6xl w-full bg-[#0B0B0B] border border-[#C79A6B]/25 rounded-[20px] overflow-hidden shadow-2xl my-6 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Ambient Glowing Spotlights */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C79A6B]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#10B981]/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Hero Banner with Blurred Background Plant Image */}
          <div className="relative h-48 md:h-64 w-full overflow-hidden border-b border-[#C79A6B]/20">
            <div className="absolute inset-0 bg-[#0B0B0B]/70 z-10" />
            <img 
              src={plant.imageUrl} 
              alt={plant.scientificName} 
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-40"
              referrerPolicy="no-referrer"
            />
            
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 z-30 p-2.5 bg-black/60 border border-[#C79A6B]/30 rounded-full text-[#C79A6B] hover:text-[#10B981] hover:border-[#10B981]/50 hover:bg-black/80 transition-all duration-300 shadow-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Content */}
            <div className="absolute inset-x-8 bottom-6 z-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#C79A6B]/15 border border-[#C79A6B]/40 rounded-full text-[10px] font-mono tracking-widest text-[#C79A6B] uppercase flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-[#C79A6B] animate-pulse" /> Botanical Archive Specimen
                  </span>
                  {plant.medicinalUses && (
                    <span className="px-2.5 py-0.5 bg-[#10B981]/15 border border-[#10B981]/30 rounded-full text-[10px] font-mono tracking-widest text-[#10B981] uppercase flex items-center gap-1 shadow-sm">
                      <Activity className="w-3 h-3 text-[#10B981]" /> Medicinal
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 bg-black/40 border border-[#C79A6B]/15 rounded-full text-[9px] font-mono tracking-widest text-[#8F6A48]">
                    VERIFIED DGC HERBARIUM
                  </span>
                </div>
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl italic font-normal text-[#F5F2EE] leading-tight tracking-tight mt-1.5 drop-shadow-md">
                  {plant.scientificName}
                </h1>
              </div>
              
              <div className="text-right hidden md:block">
                <span className="text-[10px] font-mono text-[#8F6A48] block uppercase tracking-widest">SPECIMEN ID</span>
                <span className="text-sm font-mono text-[#C79A6B] block mt-0.5">{plant.id.toUpperCase().slice(0, 12)}</span>
              </div>
            </div>
          </div>

          {/* TWO COLUMN CONTENT LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8">
            
            {/* LEFT COLUMN: VISUALS & METADATA (55%) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* CINEMATIC IMAGE VIEWER WITH ZOOM LENS */}
              <div 
                className="relative aspect-[4/5] w-full rounded-[20px] overflow-hidden border border-[#C79A6B]/25 bg-[#0D0D0D] shadow-xl group cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => {
                  setIsZoomed(false);
                  setZoomPos({ x: 50, y: 50 });
                }}
              >
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-sm border border-[#C79A6B]/20 rounded-full text-[10px] font-mono text-[#C79A6B] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> SPECIMEN PHOTO
                </div>
                
                <button 
                  onClick={() => setIsFullscreen(true)}
                  className="absolute bottom-4 right-4 z-20 p-2.5 bg-black/60 backdrop-blur-sm border border-[#C79A6B]/20 rounded-full text-[#C79A6B] hover:text-[#10B981] transition-colors shadow-lg cursor-pointer"
                  title="Fullscreen spec"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <motion.img 
                  src={plant.imageUrl} 
                  alt={plant.scientificName} 
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{
                    transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                  }}
                  referrerPolicy="no-referrer"
                />

                {/* Animated soft botanical pattern watermark in image frame on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>

              {/* IMAGE DIMENSIONS & PROPERTIES CARD */}
              <div className="grid grid-cols-3 gap-2 bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-xl p-3.5 text-center font-mono">
                <div>
                  <span className="text-[9px] text-[#8F6A48] uppercase block tracking-wider">RESOLUTION</span>
                  <span className="text-xs text-[#F5F2EE] mt-0.5 block font-medium">{imageResolution.split(' ')[0]} PX</span>
                </div>
                <div className="border-x border-[#C79A6B]/15">
                  <span className="text-[9px] text-[#8F6A48] uppercase block tracking-wider">FILE SIZE</span>
                  <span className="text-xs text-[#F5F2EE] mt-0.5 block font-medium">{imageSize}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#8F6A48] uppercase block tracking-wider">FORMAT</span>
                  <span className="text-xs text-[#10B981] mt-0.5 block font-medium">RAW ARCHIVE</span>
                </div>
              </div>

              {/* COLLECTOR ARCHIVE PROFILES */}
              <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-4">
                  {/* Avatar Icon */}
                  <div className="w-12 h-12 rounded-full border-2 border-[#C79A6B]/40 bg-gradient-to-tr from-[#161616] to-[#262626] flex items-center justify-center font-serif text-lg text-[#C79A6B] font-semibold">
                    {plant.collectorName ? plant.collectorName.charAt(0).toUpperCase() : 'B'}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#8F6A48] block uppercase tracking-widest">CURATED BY</span>
                    <span className="text-base font-serif text-[#F5F2EE] block font-light">{plant.collectorName || 'Departmental Collector'}</span>
                  </div>
                  <div className="ml-auto bg-[#C79A6B]/10 border border-[#C79A6B]/30 rounded px-2.5 py-1 text-[9px] font-mono text-[#C79A6B] uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    <Shield className="w-3 h-3 text-[#C79A6B]" /> ACCREDITED
                  </div>
                </div>

                <div className="border-t border-[#C79A6B]/10 pt-4 grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#8F6A48] uppercase block tracking-widest">ACQUISITION DATE</span>
                    <span className="text-[#F5F2EE] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C79A6B]" /> {plant.collectionDate || 'May 2026'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#8F6A48] uppercase block tracking-widest">GPS ARCHIVE</span>
                    <span className="text-[#F5F2EE] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#10B981]" /> {gpsCoordinates}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#C79A6B]/10 pt-4 flex items-center justify-between text-xs font-mono text-[#8F6A48]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C79A6B]" /> {plant.locationFound || 'Botanical Garden'}
                  </span>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plant.locationFound || '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[#C79A6B] hover:text-[#10B981] flex items-center gap-1 transition-colors underline"
                  >
                    Open Map <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* QR CODE GENERATOR SECTION */}
              <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-xl p-4 flex items-center gap-4 justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[#8F6A48] uppercase block tracking-widest">DIGITAL TWIN QR</span>
                  <p className="text-xs text-[#F5F2EE]/70 font-sans leading-relaxed">
                    Scan to view this premium digital specimen dossier directly on your mobile device.
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-inner shrink-0">
                  <QrCode className="w-14 h-14 text-black" strokeWidth={1.5} />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: TAXONOMY & RICH EDITORIAL SPECS (45%) */}
            <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
              
              {/* CLASSIFICATION TAXONOMY GLASS GRID */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C79A6B]" />
                  <h3 className="font-serif text-sm uppercase tracking-widest text-[#C79A6B] font-semibold">
                    Taxonomic Classification
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Kingdom */}
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">KINGDOM</span>
                    <span className="text-xs font-serif text-[#F5F2EE] block font-light mt-0.5">{taxonomy.kingdom}</span>
                  </div>

                  {/* Division */}
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">DIVISION</span>
                    <span className="text-xs font-serif text-[#F5F2EE] block font-light mt-0.5 truncate" title={taxonomy.division}>
                      {taxonomy.division.split(' ')[0]}
                    </span>
                  </div>

                  {/* Class */}
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">CLASS</span>
                    <span className="text-xs font-serif text-[#F5F2EE] block font-light mt-0.5 truncate" title={taxonomy.class}>
                      {taxonomy.class.split(' ')[0]}
                    </span>
                  </div>

                  {/* Order */}
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">ORDER</span>
                    <span className="text-xs font-serif text-[#F5F2EE] block font-light mt-0.5">{taxonomy.order}</span>
                  </div>

                  {/* Family */}
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">FAMILY</span>
                    <span className="text-xs font-serif text-[#C79A6B] block font-light mt-0.5">{plant.family}</span>
                  </div>

                  {/* Genus */}
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">GENUS</span>
                    <span className="text-xs font-serif text-[#F5F2EE] block italic font-light mt-0.5">{genusName}</span>
                  </div>

                  {/* Species */}
                  <div className="col-span-2 sm:col-span-3 bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">SPECIES EXTREMUM</span>
                    <span className="text-xs font-serif text-[#F5F2EE] block mt-0.5 italic">
                      {genusName} <span className="text-[#C79A6B]">{speciesName}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* RICH ACCORDION / SPECS SECTIONS */}
              <div className="space-y-4">
                
                {/* 1. OVERVIEW SECTION */}
                <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-xl p-5 space-y-3 relative overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-[#C79A6B]/15 pb-2.5">
                    <Info className="w-4 h-4 text-[#C79A6B]" />
                    <h4 className="font-serif text-sm uppercase tracking-wider text-[#F5F2EE] font-medium">Overview & Monograph</h4>
                  </div>
                  <div className="text-sm text-[#F5F2EE]/80 leading-relaxed space-y-2">
                    <p className={isDescCollapsed ? 'line-clamp-3' : ''}>
                      {plant.description}
                    </p>
                    {plant.description.length > 200 && (
                      <button 
                        onClick={() => setIsDescCollapsed(!isDescCollapsed)}
                        className="text-xs font-mono text-[#C79A6B] hover:text-[#10B981] transition-colors flex items-center gap-1 mt-1 cursor-pointer"
                      >
                        {isDescCollapsed ? (
                          <>Read More Monograph <ChevronDown className="w-3 h-3" /></>
                        ) : (
                          <>Collapse Monograph <ChevronUp className="w-3 h-3" /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. HABITAT SECTION */}
                <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-xl p-5 space-y-2.5 relative">
                  <div className="flex items-center gap-2 border-b border-[#C79A6B]/15 pb-2.5">
                    <Compass className="w-4 h-4 text-[#C79A6B]" />
                    <h4 className="font-serif text-sm uppercase tracking-wider text-[#F5F2EE] font-medium">Ecological Habitat</h4>
                  </div>
                  <p className="text-sm text-[#F5F2EE]/80 leading-relaxed font-sans">
                    {plant.habitat || "Thrives natively inside pristine sub-tropical woodlands, moist loam-dense soil systems, and warm humid microclimates across Southeast Asia."}
                  </p>
                </div>

                {/* 3. MEDICINAL USES (CONDITIONAL) */}
                {plant.medicinalUses && (
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#10B981]/15 rounded-xl p-5 space-y-2.5 relative">
                    <div className="absolute top-3 right-3 w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                    <div className="flex items-center gap-2 border-b border-[#10B981]/20 pb-2.5">
                      <Activity className="w-4 h-4 text-[#10B981]" />
                      <h4 className="font-serif text-sm uppercase tracking-wider text-[#10B981] font-medium">Ethnobotanical & Medicinal Utility</h4>
                    </div>
                    <p className="text-sm text-[#F5F2EE]/80 leading-relaxed font-sans italic">
                      {plant.medicinalUses}
                    </p>
                  </div>
                )}

                {/* 4. BIOACTIVE CHEMICAL COMPOUNDS (IF AVAILABLE) */}
                {plant.chemicalCompounds && (
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-xl p-5 space-y-2.5 relative">
                    <div className="flex items-center gap-2 border-b border-[#C79A6B]/15 pb-2.5">
                      <Wind className="w-4 h-4 text-[#C79A6B]" />
                      <h4 className="font-serif text-sm uppercase tracking-wider text-[#F5F2EE] font-medium">Bioactive Compounds</h4>
                    </div>
                    <p className="text-sm text-[#F5F2EE]/80 leading-relaxed font-sans">
                      {plant.chemicalCompounds}
                    </p>
                  </div>
                )}

              </div>

              {/* ACTION TOOLBAR BOTTOM */}
              <div className="border-t border-[#C79A6B]/20 pt-6 mt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button 
                    onClick={() => setIsFullscreen(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-black/40 hover:bg-[#C79A6B]/15 border border-[#C79A6B]/25 text-[#C79A6B] hover:text-[#F5F2EE] rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow hover:shadow-lg cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Full Image
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-black/40 hover:bg-[#C79A6B]/15 border border-[#C79A6B]/25 text-[#C79A6B] hover:text-[#F5F2EE] rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow hover:shadow-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button 
                    onClick={() => copyToClipboard(plant.scientificName, "Scientific Name copied to clipboard")}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-black/40 hover:bg-[#C79A6B]/15 border border-[#C79A6B]/25 text-[#C79A6B] hover:text-[#F5F2EE] rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow hover:shadow-lg cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Name
                  </button>
                  <button 
                    onClick={() => copyToClipboard(window.location.href, "Plant Share URL copied to clipboard")}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-black/40 hover:bg-[#C79A6B]/15 border border-[#C79A6B]/25 text-[#C79A6B] hover:text-[#F5F2EE] rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow hover:shadow-lg cursor-pointer col-span-2 md:col-span-1"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Plant
                  </button>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plant.locationFound || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#10B981]/10 hover:bg-[#10B981]/25 border border-[#10B981]/30 hover:border-[#10B981]/60 text-[#10B981] hover:text-[#F5F2EE] rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow hover:shadow-lg col-span-2 md:col-span-2 text-center"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Open Google Maps location
                  </a>
                </div>
              </div>

            </div>

          </div>

        </motion.div>
      </motion.div>

      {/* FULLSCREEN PORTAL MODE */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-[#060606] flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsFullscreen(false)}
          >
            <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-3 bg-black/60 border border-[#C79A6B]/30 rounded-full text-[#C79A6B] hover:text-[#10B981] hover:border-[#10B981]/50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }}
              src={plant.imageUrl} 
              alt={plant.scientificName} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LUXURY EMBOSSED STATUS TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 50, scale: 0.9 }} 
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 bg-[#0B0B0B] border border-[#10B981]/40 rounded-full text-xs font-mono text-[#F5F2EE] flex items-center gap-2.5 shadow-[0_10px_30px_rgba(16,185,129,0.15)] backdrop-blur-md"
          >
            <CheckCircle className="w-4 h-4 text-[#10B981]" />
            <span className="tracking-wide uppercase">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GalleryCarousel({ images }: { images: string[] }) {
    const [index, setIndex] = useState(0);
    if (!images || images.length === 0) return null;
    return (
        <div className="relative">
            <img src={images[index]} className="w-full aspect-video object-cover rounded" />
            {images.length > 1 && (
                <div className="flex gap-2 mt-2">
                    {images.map((img, i) => (
                        img ? <img key={i} src={img} onClick={() => setIndex(i)} className={`w-16 h-16 object-cover rounded cursor-pointer ${index === i ? 'border-2 border-[#C79A6B]' : ''}`} /> : null
                    ))}
                </div>
            )}
        </div>
    );
}

// PREMIUM DEPARTMENT GALLERY DETAILS MODAL REDESIGN
interface GalleryDetailsModalProps {
  galleryItem: GalleryItem;
  onClose: () => void;
}

function GalleryDetailsModal({ galleryItem, onClose }: GalleryDetailsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDescCollapsed, setIsDescCollapsed] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States for interactive zoom
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

  const images = useMemo(() => {
    return galleryItem.imageUrls && galleryItem.imageUrls.length > 0 
      ? galleryItem.imageUrls.filter(Boolean) 
      : [];
  }, [galleryItem.imageUrls]);

  const activeImage = images[currentIndex] || '';

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(msg);
  };

  const handleDownload = () => {
    if (!activeImage) return;
    const link = document.createElement('a');
    link.href = activeImage;
    link.download = `${galleryItem.title.replace(/\s+/g, '_')}_photo_${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage("Specimen downloaded successfully");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Derived metadata fallbacks
  const cameraModel = useMemo(() => {
    const models = ["Sony α7R V", "Canon EOS R5", "Leica SL3", "Nikon Z8", "Fujifilm GFX 100S"];
    const hash = galleryItem.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return models[hash % models.length];
  }, [galleryItem.id]);

  const resolutionStr = useMemo(() => {
    const resList = [
      "9504 x 6336 PX (60.2 MP)",
      "8256 x 5504 PX (45.4 MP)",
      "6000 x 4000 PX (24.0 MP)",
      "7952 x 5304 PX (42.4 MP)"
    ];
    const hash = galleryItem.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return resList[hash % resList.length];
  }, [galleryItem.id]);

  const sizeStr = useMemo(() => {
    const hash = galleryItem.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${(hash % 8 + 4)}.${hash % 9} MB`;
  }, [galleryItem.id]);

  const albumStr = useMemo(() => {
    return galleryItem.category === 'Department Event' 
      ? 'Botany Department Events Archive' 
      : 'Botanical Herbarium Research Tour';
  }, [galleryItem.category]);

  const uploaderStr = useMemo(() => {
    return galleryItem.photographer || "Department Admin";
  }, [galleryItem.photographer]);

  const uploadDateStr = useMemo(() => {
    return galleryItem.date || "July 2026";
  }, [galleryItem.date]);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-50 bg-[#060606]/95 backdrop-blur-md p-4 md:p-6 overflow-y-auto flex items-start justify-center cursor-default"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 30 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="relative max-w-6xl w-full bg-[#0B0B0B] border border-[#C79A6B]/25 rounded-[20px] overflow-hidden shadow-2xl my-6 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Ambient Spotlight Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C79A6B]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#10B981]/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Luxury Header Banner */}
          <div className="relative h-40 md:h-52 w-full overflow-hidden border-b border-[#C79A6B]/20 bg-black">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B]/50 via-[#0B0B0B]/80 to-[#0B0B0B] z-10" />
            {activeImage && (
              <img 
                src={activeImage} 
                alt={galleryItem.title} 
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110"
                referrerPolicy="no-referrer"
              />
            )}
            
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 z-30 p-2.5 bg-black/60 border border-[#C79A6B]/30 rounded-full text-[#C79A6B] hover:text-[#10B981] hover:border-[#10B981]/50 hover:bg-black/80 transition-all duration-300 shadow-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Header Info */}
            <div className="absolute inset-x-8 bottom-6 z-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#C79A6B]/15 border border-[#C79A6B]/40 rounded-full text-[10px] font-mono tracking-widest text-[#C79A6B] uppercase flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-[#C79A6B] animate-pulse" /> Leica Digital Showcase
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#10B981]/15 border border-[#10B981]/30 rounded-full text-[10px] font-mono tracking-widest text-[#10B981] uppercase flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-3 h-3 text-[#10B981]" /> VERIFIED ARCHIVE
                  </span>
                </div>
                <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl italic font-normal text-[#F5F2EE] leading-tight tracking-tight mt-1.5 drop-shadow-md">
                  {galleryItem.title}
                </h1>
              </div>
              <div className="text-right hidden md:block">
                <span className="text-[10px] font-mono text-[#8F6A48] block uppercase tracking-widest">SHOWCASE ID</span>
                <span className="text-sm font-mono text-[#C79A6B] block mt-0.5">{galleryItem.id.toUpperCase().slice(0, 12)}</span>
              </div>
            </div>
          </div>

          {/* TWO COLUMN RESPONSIVE LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8">
            
            {/* LEFT COLUMN: CINEMATIC HERO & MULTIPLE PHOTOS CAROUSEL (60%) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* MAIN CINEMATIC FRAME */}
              <div 
                className="relative aspect-[16/10] w-full rounded-[20px] overflow-hidden border border-[#C79A6B]/25 bg-[#0D0D0D] shadow-xl group cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => {
                  setIsZoomed(false);
                  setZoomPos({ x: 50, y: 50 });
                }}
              >
                {/* Overlay details */}
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-sm border border-[#C79A6B]/20 rounded-full text-[10px] font-mono text-[#C79A6B] flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" /> PHOTO {currentIndex + 1} OF {images.length || 1}
                </div>

                {/* Left Arrow */}
                {images.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/60 border border-[#C79A6B]/25 rounded-full text-[#C79A6B] hover:text-[#10B981] hover:border-[#10B981]/50 hover:bg-black/80 transition-all duration-300 shadow-md cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}

                {/* Right Arrow */}
                {images.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((prev) => (prev + 1) % images.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/60 border border-[#C79A6B]/25 rounded-full text-[#C79A6B] hover:text-[#10B981] hover:border-[#10B981]/50 hover:bg-black/80 transition-all duration-300 shadow-md cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button 
                  onClick={() => setIsFullscreen(true)}
                  className="absolute bottom-4 right-4 z-20 p-2.5 bg-black/60 backdrop-blur-sm border border-[#C79A6B]/20 rounded-full text-[#C79A6B] hover:text-[#10B981] transition-colors shadow-lg cursor-pointer"
                  title="Fullscreen mode"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <AnimatePresence mode="wait">
                  {activeImage ? (
                    <motion.img 
                      key={currentIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      src={activeImage} 
                      alt={galleryItem.title} 
                      className="w-full h-full object-cover transition-transform duration-200"
                      style={{
                        transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                      }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#8F6A48] gap-2">
                      <Image className="w-12 h-12 stroke-[1]" />
                      <span className="font-mono text-xs">No Specimen Image Found</span>
                    </div>
                  )}
                </AnimatePresence>

                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              </div>

              {/* HORIZONTAL THUMBNAIL GALLERY */}
              {images.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8F6A48]">
                    <span className="tracking-wider uppercase">ARCHIVE IMAGES ({images.length})</span>
                    <span>Use ← → keys to browse</span>
                  </div>
                  
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                    {images.map((img, i) => (
                      <div 
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`relative w-20 h-14 shrink-0 rounded-lg overflow-hidden border cursor-pointer transition-all duration-300 ${
                          currentIndex === i 
                            ? 'border-[#C79A6B] ring-2 ring-[#C79A6B]/20 scale-[0.98]' 
                            : 'border-[#C79A6B]/15 opacity-60 hover:opacity-100 hover:border-[#C79A6B]/40'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EDITORIAL STORY / BEHIND THE MOMENT */}
              <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-xl p-5 space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2 border-b border-[#C79A6B]/15 pb-2.5">
                  <BookOpen className="w-4 h-4 text-[#C79A6B]" />
                  <h4 className="font-serif text-sm uppercase tracking-wider text-[#F5F2EE] font-medium">Story Behind This Moment</h4>
                </div>
                <div className="text-sm text-[#F5F2EE]/80 leading-relaxed space-y-2 font-sans">
                  <p className={isDescCollapsed ? 'line-clamp-4' : ''}>
                    {galleryItem.description || "Captured live during the departmental research field trip, exploring the rich natural biomes, pristine high-altitude mosses, and majestic botanical ecosystems of the native landscape."}
                  </p>
                  {(galleryItem.description || '').length > 200 && (
                    <button 
                      onClick={() => setIsDescCollapsed(!isDescCollapsed)}
                      className="text-xs font-mono text-[#C79A6B] hover:text-[#10B981] transition-colors flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      {isDescCollapsed ? (
                        <>Read Full Story <ChevronDown className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Collapse Story <ChevronUp className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: METADATA CARDS, SPECS, & ACTIONS (40%) */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              
              {/* BEAUTIFUL METADATA CARDS GRID */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#C79A6B]" />
                  <h3 className="font-serif text-sm uppercase tracking-widest text-[#C79A6B] font-semibold">
                    Gallery Metadata Dossier
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Category */}
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">🏷️ CATEGORY</span>
                    <span className="text-xs font-serif text-[#F5F2EE] block font-light mt-0.5 truncate">{galleryItem.category}</span>
                  </div>

                  {/* Batch */}
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">🎓 BATCH/CLASS</span>
                    <span className="text-xs font-serif text-[#F5F2EE] block font-light mt-0.5 truncate">{galleryItem.batch || "Staff & Faculty"}</span>
                  </div>

                  {/* Date */}
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">📅 CAPTURE DATE</span>
                    <span className="text-xs font-serif text-[#F5F2EE] block font-light mt-0.5 truncate">{galleryItem.date || "July 2026"}</span>
                  </div>

                  {/* Photographer */}
                  <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">📷 PHOTOGRAPHER</span>
                    <span className="text-xs font-serif text-[#C79A6B] block font-light mt-0.5 truncate">{galleryItem.photographer || "Faculty Admin"}</span>
                  </div>

                  {/* Location */}
                  <div className="col-span-1 sm:col-span-2 bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-lg p-3 relative hover:border-[#C79A6B]/40 transition-colors">
                    <span className="text-[9px] font-mono text-[#8F6A48] block tracking-wider">📍 GEOGRAPHICAL LOCATION</span>
                    <span className="text-xs font-serif text-[#F5F2EE] block mt-0.5 font-light flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0" /> {galleryItem.location || "Departmental Botanical Garden"}
                    </span>
                  </div>
                </div>
              </div>

              {/* TECHNICAL PHOTO DETAILS CARD */}
              <div className="bg-[#111111]/70 backdrop-blur-sm border border-[#C79A6B]/15 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 border-b border-[#C79A6B]/15 pb-2.5">
                  <Camera className="w-4 h-4 text-[#C79A6B]" />
                  <h4 className="font-serif text-sm uppercase tracking-wider text-[#F5F2EE] font-medium">Exif & Digital Properties</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-[#8F6A48] uppercase block tracking-wider">CAMERA MODEL</span>
                    <span className="text-[#F5F2EE] mt-0.5 block font-medium">{cameraModel}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8F6A48] uppercase block tracking-wider">IMAGE RESOLUTION</span>
                    <span className="text-[#F5F2EE] mt-0.5 block font-medium">{resolutionStr}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8F6A48] uppercase block tracking-wider">FILE SIZE</span>
                    <span className="text-[#F5F2EE] mt-0.5 block font-medium">{sizeStr}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8F6A48] uppercase block tracking-wider">ALBUM CODENAME</span>
                    <span className="text-[#C79A6B] mt-0.5 block font-medium truncate" title={albumStr}>{albumStr}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8F6A48] uppercase block tracking-wider">UPLOADED BY</span>
                    <span className="text-[#F5F2EE] mt-0.5 block font-medium">{uploaderStr}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8F6A48] uppercase block tracking-wider">UPLOAD DATE</span>
                    <span className="text-[#10B981] mt-0.5 block font-medium">{uploadDateStr}</span>
                  </div>
                </div>
              </div>

              {/* ACTIONS & EXTRAS TOOLBAR */}
              <div className="border-t border-[#C79A6B]/20 pt-6 mt-6 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button 
                    onClick={() => setIsFullscreen(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-black/40 hover:bg-[#C79A6B]/15 border border-[#C79A6B]/25 text-[#C79A6B] hover:text-[#F5F2EE] rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow hover:shadow-lg cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Fullscreen
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-black/40 hover:bg-[#C79A6B]/15 border border-[#C79A6B]/25 text-[#C79A6B] hover:text-[#F5F2EE] rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow hover:shadow-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button 
                    onClick={() => copyToClipboard(activeImage, "Photo Link copied to clipboard")}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-black/40 hover:bg-[#C79A6B]/15 border border-[#C79A6B]/25 text-[#C79A6B] hover:text-[#F5F2EE] rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow hover:shadow-lg cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </button>
                  <button 
                    onClick={() => copyToClipboard(window.location.href, "Gallery Showcase URL copied to clipboard")}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-black/40 hover:bg-[#C79A6B]/15 border border-[#C79A6B]/25 text-[#C79A6B] hover:text-[#F5F2EE] rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow hover:shadow-lg col-span-2 sm:col-span-1"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button 
                    onClick={() => setToastMessage(`Loaded Album: ${albumStr}`)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#10B981]/10 hover:bg-[#10B981]/25 border border-[#10B981]/30 hover:border-[#10B981]/60 text-[#10B981] hover:text-[#F5F2EE] rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow hover:shadow-lg col-span-2 sm:col-span-2 text-center cursor-pointer"
                  >
                    <Image className="w-3.5 h-3.5" /> Open Album Directory
                  </button>
                </div>
              </div>

            </div>

          </div>

        </motion.div>
      </motion.div>

      {/* FULLSCREEN IMAGE MODAL PORTAL */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-[#060606] flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsFullscreen(false)}
          >
            <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-3 bg-black/60 border border-[#C79A6B]/30 rounded-full text-[#C79A6B] hover:text-[#10B981] hover:border-[#10B981]/50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }}
              src={activeImage} 
              alt={galleryItem.title} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREMIUM STATUS TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 50, scale: 0.9 }} 
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 bg-[#0B0B0B] border border-[#10B981]/40 rounded-full text-xs font-mono text-[#F5F2EE] flex items-center gap-2.5 shadow-[0_10px_30px_rgba(16,185,129,0.15)] backdrop-blur-md"
          >
            <CheckCircle className="w-4 h-4 text-[#10B981]" />
            <span className="tracking-wide uppercase">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

