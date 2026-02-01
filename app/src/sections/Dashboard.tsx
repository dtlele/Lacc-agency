import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Award,
  ArrowUpRight,
  Calendar,
  Phone,
  MessageSquare,
  Sparkles,
  Euro,
  CheckCircle2
} from 'lucide-react';

const heroStats = [
  { label: 'Finanziati', value: '€98M+', icon: Euro, color: 'text-corp-gold' },
  { label: 'Progetti', value: '500+', icon: CheckCircle2, color: 'text-corp-blue' },
  { label: 'Clienti', value: '150+', icon: Users, color: 'text-corp-teal' },
];

const stats = [
  { label: 'Progetti', value: '500+', change: '+12%', icon: Briefcase, color: 'from-corp-blue to-corp-blue-light' },
  { label: 'Clienti', value: '150+', change: '+8%', icon: Users, color: 'from-corp-teal to-cyan-500' },
  { label: 'Esperti', value: '25+', change: '+15%', icon: Award, color: 'from-corp-gold to-amber-500' },
  { label: 'Esperienza', value: '15+', change: 'Anni', icon: TrendingUp, color: 'from-violet-500 to-purple-500' },
];

const quickActions = [
  { label: 'Prenota', description: 'Fissa un appuntamento', icon: Calendar, href: '#prenota', primary: true },
  { label: 'Chiama', description: '+39 080 35 13 564', icon: Phone, href: 'tel:+390803513564', primary: false },
  { label: 'Scrivici', description: 'info@lacc.agency', icon: MessageSquare, href: 'mailto:info@lacc.agency', primary: false },
];

const recentProjects = [
  { name: 'Distretto Suino Nero', status: 'In corso', progress: 75, color: 'bg-corp-blue' },
  { name: 'Contratto Fio.Re', status: 'Completato', progress: 100, color: 'bg-corp-success' },
  { name: 'Efficienza Energetica', status: 'In corso', progress: 45, color: 'bg-corp-teal' },
];

export function Dashboard() {
  return (
    <section id="dashboard" className="min-h-screen pt-28 pb-12 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Stats - IN PRIMO PIANO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="mb-8"
        >
          <div className="grid grid-cols-3 gap-4">
            {heroStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + index * 0.1 }}
                className="text-center"
              >
                <div className={`flex items-center justify-center gap-2 mb-2 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">{stat.value}</span>
                </div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.6 }}
          className="mb-10 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-corp-gold" />
            </motion.div>
            <span className="text-corp-gold text-sm font-medium">Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Benvenuto su <span className="gradient-text">LACC.Agency</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            La tua piattaforma di consulenza aziendale integrata
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.8 + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative group"
            >
              <div className="glass rounded-xl p-4 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    stat.change.startsWith('+') 
                      ? 'bg-corp-success/20 text-corp-success' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="glass rounded-xl p-5">
              <h2 className="text-base font-semibold text-white mb-4">Azioni Rapide</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <motion.a
                    key={action.label}
                    href={action.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.1 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative overflow-hidden rounded-xl p-4 transition-all group
                      ${action.primary 
                        ? 'bg-corp-gold text-corp-bg' 
                        : 'glass hover:bg-white/5'
                      }
                    `}
                  >
                    {action.primary && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                    <div className={`w-9 h-9 rounded-lg ${action.primary ? 'bg-corp-bg/20' : 'bg-corp-blue/20'} flex items-center justify-center mb-2`}>
                      <action.icon className={`w-4 h-4 ${action.primary ? 'text-corp-bg' : 'text-corp-blue'}`} />
                    </div>
                    <p className={`font-semibold text-sm mb-0.5 ${action.primary ? 'text-corp-bg' : 'text-white'}`}>
                      {action.label}
                    </p>
                    <p className={`text-xs ${action.primary ? 'text-corp-bg/70' : 'text-gray-500'}`}>
                      {action.description}
                    </p>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Recent Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.5 }}
              className="glass rounded-xl p-5 mt-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Progetti Recenti</h2>
                <a href="#projects" className="text-xs text-corp-blue hover:text-corp-gold transition-colors flex items-center gap-1">
                  Vedi tutti
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-3">
                {recentProjects.map((project, index) => (
                  <motion.div
                    key={project.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.3 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm group-hover:text-corp-blue transition-colors truncate">{project.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          project.status === 'Completato' 
                            ? 'bg-corp-success/20 text-corp-success' 
                            : 'bg-corp-blue/20 text-corp-blue'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-20 flex-shrink-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ delay: 2.5 + index * 0.1, duration: 0.5 }}
                          className={`h-full ${project.color} rounded-full`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Side Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.15, duration: 0.5 }}
            className="space-y-5"
          >
            {/* Contact Card */}
            <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-corp-blue to-corp-blue-light">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
              <div className="relative z-10">
                <h3 className="font-semibold text-white mb-2 text-sm">Hai bisogno di aiuto?</h3>
                <p className="text-white/70 text-xs mb-4">
                  Il nostro team è disponibile per supportarti.
                </p>
                <div className="space-y-2">
                  <a 
                    href="tel:+390803513564" 
                    className="flex items-center gap-2 p-2.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>+39 080 35 13 564</span>
                  </a>
                  <a 
                    href="mailto:info@lacc.agency" 
                    className="flex items-center gap-2 p-2.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>info@lacc.agency</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-white mb-3 text-sm">Orari</h3>
              <div className="space-y-2 text-sm">
                {[
                  { day: 'Lun - Ven', hours: '9:00 - 18:00' },
                  { day: 'Sabato', hours: '9:00 - 13:00' },
                  { day: 'Domenica', hours: 'Chiuso' },
                ].map((item) => (
                  <div key={item.day} className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">{item.day}</span>
                    <span className={item.hours === 'Chiuso' ? 'text-gray-500 text-xs' : 'text-white text-xs font-medium'}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Stats */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-white mb-3 text-sm">Performance</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Soddisfazione</span>
                    <span className="text-corp-success">98%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '98%' }}
                      transition={{ delay: 2.5, duration: 0.8 }}
                      className="h-full bg-corp-success rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">A Tempo</span>
                    <span className="text-corp-blue">95%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '95%' }}
                      transition={{ delay: 2.7, duration: 0.8 }}
                      className="h-full bg-corp-blue rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
