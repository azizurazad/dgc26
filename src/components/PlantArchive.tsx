import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Calendar, User, Compass, Layers, Hash, BookOpen, Wind } from 'lucide-react';
import { Plant } from '../types';

interface PlantArchiveProps {
  plants: Plant[];
}

export default function PlantArchive({ plants }: PlantArchiveProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  // Extract unique families
  const families = useMemo(() => {
    const list = new Set(plants.map(p => p.family));
    return ['All', ...Array.from(list)];
  }, [plants]);

  // Filter plants
  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      const matchesSearch = 
        plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.locationFound.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFamily = selectedFamily === 'All' || plant.family === selectedFamily;

      return matchesSearch && matchesFamily;
    });
  }, [plants, searchQuery, selectedFamily]);

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
              The <span className="font-serif italic text-[#C79A6B] font-normal">living collections</span>
            </h2>
          </div>
          <div className="max-w-md text-sm text-[#F5F2EE]/60 font-light leading-relaxed">
            Our systematic archive serves as a digital sanctuary of native North Bengal flora. Browse through taxonomical classes curated by students under professional guidance.
          </div>
        </div>

        {/* Filter Bar with Sophisticated Search & Family Chips */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between border-b border-[#C79A6B]/15 pb-5 mb-8">
          
          {/* Search Input */}
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search by scientific name, vernacular..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111111] border border-[#C79A6B]/20 focus:border-[#C79A6B] text-[#F5F2EE] text-xs font-mono tracking-wider pl-11 pr-4 py-3.5 rounded-xs outline-none transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F6A48]" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8F6A48] hover:text-[#F5F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Family Filters Scroll Bar */}
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

        </div>

        {/* Grid Showcase */}
        {filteredPlants.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#C79A6B]/15 rounded-xs">
            <p className="font-serif text-lg text-[#F5F2EE]/60">No specimens found matching your criteria.</p>
            <p className="text-xs font-mono text-[#8F6A48] uppercase mt-2">Adjust your taxonomic filters or search queries</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredPlants.map((plant, index) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index % 3 * 0.15 }}
                onClick={() => setSelectedPlant(plant)}
                className="group cursor-pointer flex flex-col justify-between bg-[#111111] border border-[#C79A6B]/15 rounded-xs hover:border-[#C79A6B]/55 transition-all duration-500 overflow-hidden"
              >
                {/* Image Frame */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0B0B0B] border-b border-[#C79A6B]/10">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    src={plant.imageUrl}
                    alt={plant.scientificName}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle Badge Overlay */}
                  {plant.badge && (
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-[#1F3D2B]/90 backdrop-blur-md border border-[#C79A6B]/25 rounded-full text-[9px] font-mono tracking-widest text-[#C79A6B] uppercase">
                      {plant.badge}
                    </div>
                  )}

                  {/* Scientific Code label */}
                  <div className="absolute bottom-3 right-4 z-20 text-[9px] font-mono text-[#F5F2EE]/45 bg-[#0B0B0B]/80 px-2 py-0.5 rounded">
                    ID: {plant.id.toUpperCase()}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 md:p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono tracking-widest text-[#8F6A48] uppercase">
                      FAMILY: {plant.family}
                    </p>
                    <h3 className="font-serif text-2xl font-light text-[#F5F2EE] group-hover:text-[#C79A6B] transition-colors duration-300">
                      {plant.scientificName}
                    </h3>
                    <p className="text-xs text-[#F5F2EE]/65 italic font-serif">
                      {plant.commonName}
                    </p>
                    <p className="text-xs text-[#F5F2EE]/50 font-light line-clamp-3 leading-relaxed pt-2">
                      {plant.description}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between border-t border-[#C79A6B]/10 pt-4 text-[10px] font-mono tracking-wider text-[#8F6A48]/80">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Curated: {plant.collectorName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {plant.collectionDate}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Dynamic Museum Curation Sheet Modal */}
        <AnimatePresence>
          {selectedPlant && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0B]/95 backdrop-blur-md overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="relative max-w-5xl w-full bg-[#111111] border border-[#C79A6B]/30 rounded-xs overflow-hidden max-h-[90vh] flex flex-col lg:flex-row shadow-2xl"
              >
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedPlant(null)}
                  className="absolute top-4 right-4 z-40 p-2 rounded-full bg-[#0B0B0B]/90 border border-[#C79A6B]/30 text-[#C79A6B] hover:text-[#F5F2EE] hover:border-[#C79A6B] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Left Side: Gorgeous Specimen Image */}
                <div className="w-full lg:w-1/2 relative bg-[#0B0B0B] min-h-[300px] lg:min-h-full">
                  <img
                    src={selectedPlant.imageUrl}
                    alt={selectedPlant.scientificName}
                    className="w-full h-full object-cover opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#111111]/80" />
                  
                  {/* Floating Metadata on Image */}
                  <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2">
                    <span className="px-3 py-1 bg-[#1F3D2B]/95 border border-[#C79A6B]/25 rounded-full text-[9px] font-mono tracking-widest text-[#C79A6B] uppercase inline-block">
                      {selectedPlant.family}
                    </span>
                    <h4 className="font-serif text-3xl font-light text-[#F5F2EE]">
                      {selectedPlant.scientificName}
                    </h4>
                    <p className="text-xs text-[#F5F2EE]/70 font-mono tracking-widest uppercase">
                      DINAJPUR GOVERNMENT COLLEGE ARCHIVE
                    </p>
                  </div>
                </div>

                {/* Right Side: Museum Taxonomy Sheet Details */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 overflow-y-auto max-h-[50vh] lg:max-h-[90vh] space-y-8 select-text">
                  
                  {/* Curatorial Header */}
                  <div className="border-b border-[#C79A6B]/20 pb-5 space-y-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-[#C79A6B] uppercase font-bold flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" /> HERBARIUM SPECIMEN SHEET
                    </span>
                    <h3 className="font-serif text-xl font-light text-[#F5F2EE]">
                      Taxonomic Reference: <span className="italic font-serif text-[#C79A6B]">{selectedPlant.scientificName}</span>
                    </h3>
                  </div>

                  {/* Taxonomy Details Table */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] text-[#8F6A48] uppercase tracking-wider block">Vernacular Name</span>
                      <span className="font-serif text-sm font-medium text-[#F5F2EE]">{selectedPlant.commonName}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] text-[#8F6A48] uppercase tracking-wider block">Botanical Family</span>
                      <span className="font-serif text-sm text-[#F5F2EE]">{selectedPlant.family}</span>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="font-mono text-[9px] text-[#8F6A48] uppercase tracking-wider block">Identified Habitat</span>
                      <span className="text-[#F5F2EE]/80 font-light flex items-center gap-1.5">
                        <Wind className="w-3.5 h-3.5 text-[#C79A6B]" /> {selectedPlant.habitat}
                      </span>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="font-mono text-[9px] text-[#8F6A48] uppercase tracking-wider block">Geographical Point</span>
                      <span className="text-[#F5F2EE]/80 font-light flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-[#C79A6B]" /> {selectedPlant.locationFound}
                      </span>
                    </div>
                  </div>

                  {/* Narrative Profile */}
                  <div className="space-y-2">
                    <span className="font-mono text-[9px] text-[#8F6A48] uppercase tracking-wider block">Botanical Profile</span>
                    <p className="text-xs text-[#F5F2EE]/75 leading-relaxed font-light">
                      {selectedPlant.description}
                    </p>
                  </div>

                  {/* Chemical compounds and Medicinal actions */}
                  {(selectedPlant.medicinalUses || selectedPlant.chemicalCompounds) && (
                    <div className="border-t border-[#C79A6B]/15 pt-6 space-y-4">
                      {selectedPlant.medicinalUses && (
                        <div className="space-y-1.5">
                          <span className="font-mono text-[9px] text-[#C79A6B] uppercase tracking-wider block flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" /> Ethnobotanical medicinal utility
                          </span>
                          <p className="text-xs text-amber-50/70 font-light leading-relaxed italic">
                            "{selectedPlant.medicinalUses}"
                          </p>
                        </div>
                      )}
                      
                      {selectedPlant.chemicalCompounds && (
                        <div className="space-y-1.5">
                          <span className="font-mono text-[9px] text-[#C79A6B] uppercase tracking-wider block flex items-center gap-1">
                            <Hash className="w-3.5 h-3.5" /> Major phytochemical composition
                          </span>
                          <p className="text-xs font-mono text-[#F5F2EE]/65 bg-[#0B0B0B] p-2.5 rounded-xs border border-[#C79A6B]/10">
                            {selectedPlant.chemicalCompounds}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Archival Sheet Footer */}
                  <div className="border-t border-[#C79A6B]/20 pt-6 flex justify-between items-center text-[10px] font-mono text-[#8F6A48]">
                    <div>
                      <p className="uppercase tracking-widest text-[#8F6A48]/55">Chief Collector</p>
                      <p className="text-xs font-medium text-[#F5F2EE] mt-0.5">{selectedPlant.collectorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="uppercase tracking-widest text-[#8F6A48]/55">Archived Date</p>
                      <p className="text-xs font-medium text-[#F5F2EE] mt-0.5">{selectedPlant.collectionDate}</p>
                    </div>
                  </div>

                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
