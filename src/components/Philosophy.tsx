import { motion } from 'motion/react';
import { Microscope, Globe, Eye, BookOpen, Compass, Shield } from 'lucide-react';

interface PhilosophyProps {
  philosophyImage?: string;
}

export default function Philosophy({ philosophyImage }: PhilosophyProps) {
  const philosophyItems = [
    {
      icon: Microscope,
      title: 'Systematic Taxonomy',
      desc: 'Meticulous observation and description of physical specimens to construct an unbroken, empirical tree of life.'
    },
    {
      icon: Globe,
      title: 'Ethnobotanical Dialogue',
      desc: 'Bridging tribal and localized indigenous plant lore with state-of-the-art phytochemical validation and molecular analysis.'
    },
    {
      icon: Shield,
      title: 'Ecological Sentinel',
      desc: 'Safeguarding North Bengal’s vulnerable micro-ecosystems against environmental shifts, document by document.'
    }
  ];

  return (
    <section 
      id="philosophy" 
      className="relative w-full py-16 md:py-20 bg-[#0B0B0B] text-[#F5F2EE] px-6 md:px-12 border-b border-[#C79A6B]/15"
    >
      <div className="absolute inset-0 light-spotlight pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto">
        
        {/* Editorial Subheader Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          
          {/* LEFT: Large Editorial Image (Luxury Frame) */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative group"
          >
            <div className="absolute -inset-1.5 border border-[#C79A6B]/20 rounded-xs group-hover:border-[#C79A6B]/40 transition-colors duration-500 pointer-events-none" />
            <div className="overflow-hidden rounded-xs bg-[#111111]">
              <motion.img 
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                src={philosophyImage || "/src/assets/images/botanical_laboratory_interior_1783496441053.jpg"} 
                alt="Department of Botany Laboratory"
                className="w-full aspect-[4/5] object-cover opacity-85 hover:opacity-100 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Minimalist Image Caption */}
            <div className="mt-4 flex justify-between text-[10px] font-mono tracking-widest text-[#8F6A48] uppercase">
              <span>Fig 01. Preservation Vault</span>
              <span>Lab Room A, DGC</span>
            </div>
          </motion.div>

          {/* RIGHT: Sophisticated Copy & Feature List */}
          <div className="lg:col-span-7 flex flex-col justify-center h-full space-y-6 md:space-y-8">
            
            {/* Section label */}
            <div className="space-y-2">
              <span className="text-xs font-mono tracking-[0.3em] text-[#C79A6B] uppercase font-semibold">
                — OUR PHILOSOPHY
              </span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-tight text-[#F5F2EE]">
                Botany as a <br />
                <span className="font-serif italic text-[#C79A6B] font-normal">living dialogue</span>
              </h2>
            </div>

            {/* Quote Block */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-l border-[#C79A6B]/30 pl-6 space-y-2"
            >
              <p className="font-serif text-lg md:text-xl italic text-[#F5F2EE]/85 font-light leading-relaxed">
                "The finest herbaria are not monuments to collection, but quiet, ongoing conversations between species, changing climate, and the fragile memory of our soil."
              </p>
              <span className="block text-[10px] font-mono tracking-widest text-[#8F6A48] uppercase">
                Department Curation Guidelines • DGC
              </span>
            </motion.div>

            {/* Narrative text */}
            <p className="text-sm md:text-base text-[#F5F2EE]/70 font-light leading-relaxed">
              At Botany Nexus DGC, we perceive our local plants not as isolated chemical entities, but as living records of our region’s geographical soul. In the dry clay plains of Bengal and the deep deciduous tunnels of Singra, our students observe, isolate, and immortalize specimens to safeguard local ecological integrity.
            </p>

            {/* Micro Feature List */}
            <div className="space-y-6 pt-4 border-t border-[#C79A6B]/15">
              {philosophyItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.8 }}
                    key={item.title} 
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-full border border-[#C79A6B]/20 bg-[#111111] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#C79A6B]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold tracking-wider text-[#F5F2EE] uppercase">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#F5F2EE]/60 font-light leading-relaxed mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
