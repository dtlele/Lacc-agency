import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Filter,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

const projects = [
  {
    id: 1,
    name: 'Distretto del Suino Nero',
    client: 'Consorzio Suino Nero',
    status: 'in-progress',
    progress: 75,
    budget: '€2.5M',
    category: 'Agroalimentare',
    image: '/assets/blog_suino.jpg',
    color: 'from-lacc-purple to-violet-500',
  },
  {
    id: 2,
    name: 'Contratto di Filiera Fio.Re',
    client: 'Federazione Italiana',
    status: 'completed',
    progress: 100,
    budget: '€4.2M',
    category: 'Agroalimentare',
    image: '/assets/blog_contratto.jpg',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 3,
    name: 'Efficienza Energetica Industriale',
    client: 'Industria Tecno',
    status: 'in-progress',
    progress: 45,
    budget: '€850K',
    category: 'Energia',
    image: '/assets/hero_bg.jpg',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 4,
    name: 'Internazionalizzazione Startup',
    client: 'TechInnovation',
    status: 'completed',
    progress: 100,
    budget: '€1.2M',
    category: 'Innovazione',
    image: '/assets/consulting_sartoriale.jpg',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 5,
    name: 'Formazione Management',
    client: 'Gruppo Agro',
    status: 'in-progress',
    progress: 60,
    budget: '€320K',
    category: 'Formazione',
    image: '/assets/blog_team.jpg',
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 6,
    name: 'Brevetto Tecnologico',
    client: 'R&D Solutions',
    status: 'in-progress',
    progress: 30,
    budget: '€1.8M',
    category: 'R&D',
    image: '/assets/blog_contratto.jpg',
    color: 'from-cyan-500 to-blue-500',
  },
];

const filters = ['Tutti', 'In corso', 'Completati', 'Agroalimentare', 'Energia', 'Innovazione'];

export function Projects() {
  const [activeFilter, setActiveFilter] = useState('Tutti');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProjects = projects.filter(project => {
    if (activeFilter === 'Tutti') return true;
    if (activeFilter === 'In corso') return project.status === 'in-progress';
    if (activeFilter === 'Completati') return project.status === 'completed';
    return project.category === activeFilter;
  });

  return (
    <section id="projects" className="py-24 relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lacc-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10"
        >
          <div>
            <span className="inline-block px-4 py-1.5 bg-lacc-cyan/10 border border-lacc-cyan/30 rounded-full text-lacc-cyan text-sm font-medium mb-4">
              Progetti
            </span>
            <h2 className="text-4xl font-bold text-white mb-2">
              I nostri <span className="gradient-text">successi</span>
            </h2>
            <p className="text-gray-400">
              Scopri i progetti che abbiamo realizzato per i nostri clienti
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              {activeFilter}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-glow border border-white/10 overflow-hidden z-10"
              >
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                      setShowFilters(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${
                      activeFilter === filter ? 'text-lacc-cyan bg-lacc-cyan/10' : 'text-gray-400'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group relative"
            >
              {/* Glow on hover */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${project.color} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity`} />
              
              <div className="relative glass rounded-2xl overflow-hidden card-hover cursor-pointer">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e18] via-[#0c0e18]/50 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      project.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-lacc-purple/20 text-lacc-purple border border-lacc-purple/30'
                    }`}>
                      {project.status === 'completed' ? 'Completato' : 'In corso'}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-xs text-white/80 border border-white/10">
                      {project.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold text-lg mb-1">{project.name}</p>
                    <p className="text-gray-400 text-sm">{project.client}</p>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Budget</p>
                      <p className="text-white font-semibold">{project.budget}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-lacc-purple/20 transition-colors">
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-lacc-purple transition-colors" />
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-500">Progresso</span>
                      <span className="text-white font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${project.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                        className={`h-full rounded-full bg-gradient-to-r ${project.color}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid sm:grid-cols-4 gap-4"
        >
          {[
            { label: 'Progetti Totali', value: '500+', icon: TrendingUp, color: 'text-lacc-purple' },
            { label: 'Completati', value: '380+', icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'In Corso', value: '120+', icon: Clock, color: 'text-lacc-cyan' },
            { label: 'Budget Gestito', value: '€98M+', icon: TrendingUp, color: 'text-lacc-amber' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-2xl p-5 text-center border border-white/10"
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3`} />
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
