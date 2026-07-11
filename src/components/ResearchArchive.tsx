import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Calendar, User, Compass, Layers, Hash, BookOpen, Wind, Camera, MapPin, Tag, ExternalLink } from 'lucide-react';
import { Plant, DepartmentEvent, GalleryItem } from '../types';

interface ResearchArchiveProps {
  plants: Plant[];
  events: DepartmentEvent[];
  gallery: GalleryItem[];
}

export default function ResearchArchive({ plants, events, gallery }: ResearchArchiveProps) {
  const [activeTab, setActiveTab] = useState<'Plant Archive' | 'Department Gallery'>('Plant Archive');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<DepartmentEvent | null>(null);
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
      className="relative w-full py-16 md:py-20 bg-[#0B0B0B] text-[#F5F2EE] px-6 md:px-12 border-b border-[#C79A6B]/15"
    >
      <div className="w-full max-w-7xl mx-auto">
        
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setSelectedPlant(null)}>
              <div className="bg-[#111111] border border-[#C79A6B]/30 rounded-xs p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-serif text-[#C79A6B]">{selectedPlant.scientificName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <img src={selectedPlant.imageUrl} className="w-full aspect-square object-cover rounded" />
                    <div className="space-y-2 text-sm text-[#F5F2EE]/80">
                        <p><strong>Common Name:</strong> {selectedPlant.commonName}</p>
                        <p><strong>Family:</strong> {selectedPlant.family}</p>
                        <p><strong>Habitat:</strong> {selectedPlant.habitat}</p>
                        <p><strong>Location:</strong> {selectedPlant.locationFound}</p>
                        <p><strong>Collector:</strong> {selectedPlant.collectorName}</p>
                        <p><strong>Date:</strong> {selectedPlant.collectionDate}</p>
                    </div>
                </div>
                <p className="text-sm mt-4 text-[#F5F2EE]/80">{selectedPlant.description}</p>
                {selectedPlant.medicinalUses && <p className="text-sm mt-2 text-[#F5F2EE]/80"><strong>Medicinal Uses:</strong> {selectedPlant.medicinalUses}</p>}
                <button onClick={() => setSelectedPlant(null)} className="mt-6 px-4 py-2 border border-[#C79A6B] text-[#C79A6B] text-xs font-mono uppercase">Close</button>
              </div>
            </motion.div>
          )}
          {selectedGallery && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setSelectedGallery(null)}>
              <div className="bg-[#111111] border border-[#C79A6B]/30 rounded-xs p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-serif text-[#C79A6B]">{selectedGallery.title}</h3>
                <div className="mt-4">
                  <GalleryCarousel images={selectedGallery.imageUrls} />
                </div>
                <p className="text-sm mt-4 text-[#F5F2EE]/80">{selectedGallery.description}</p>
                <div className="flex justify-between text-xs font-mono text-[#8F6A48] mt-4">
                    <span>{selectedGallery.photographer}</span>
                    <span>{selectedGallery.date}</span>
                </div>
                <button onClick={() => setSelectedGallery(null)} className="mt-6 px-4 py-2 border border-[#C79A6B] text-[#C79A6B] text-xs font-mono uppercase">Close</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
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
