import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  PiggyBank, 
  Network, 
  Zap, 
  GraduationCap, 
  FlaskConical, 
  ArrowRight,
  ExternalLink,
  TrendingUp,
  Euro
} from 'lucide-react';

const services = [
  {
    id: 'finanza',
    icon: PiggyBank,
    title: 'Finanza Agevolata',
    description: 'Accesso a bandi, contributi e finanziamenti pubblici per la tua azienda.',
    features: ['Bandi Regionali', 'Fondi EU', 'Agevolazioni'],
    stats: { projects: '120+', amount: '€25M' },
    gradient: 'from-emerald-500/20 to-teal-500/20',
    accent: 'emerald',
  },
  {
    id: 'lobbying',
    icon: Network,
    title: 'Lobbying & Networking',
    description: 'Rappresentanza istituzionale e partnership strategiche.',
    features: ['Relazioni Istituzionali', 'Advocacy', 'Partnership'],
    stats: { projects: '85+', amount: '€18M' },
    gradient: 'from-blue-500/20 to-indigo-500/20',
    accent: 'blue',
  },
  {
    id: 'efficienza',
    icon: Zap,
    title: 'Efficienza Energetica',
    description: 'Audit energetici e transizione verso fonti rinnovabili.',
    features: ['Audit', 'Rinnovabili', 'Certificazioni'],
    stats: { projects: '200+', amount: '€32M' },
    gradient: 'from-amber-500/20 to-orange-500/20',
    accent: 'amber',
  },
  {
    id: 'formazione',
    icon: GraduationCap,
    title: 'Formazione',
    description: 'Workshop, seminari e coaching per lo sviluppo del tuo team.',
    features: ['Workshop', 'Seminari', 'Coaching'],
    stats: { projects: '150+', amount: '€8M' },
    gradient: 'from-violet-500/20 to-purple-500/20',
    accent: 'violet',
  },
  {
    id: 'ricerca',
    icon: FlaskConical,
    title: 'Ricerca & Sviluppo',
    description: 'Innovazione, brevetti e sviluppo di nuovi prodotti.',
    features: ['Brevetti', 'Prototipi', 'Test'],
    stats: { projects: '45+', amount: '€15M' },
    gradient: 'from-rose-500/20 to-pink-500/20',
    accent: 'rose',
  },
];

const accentColors: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
  rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export function Services() {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  return (
    <section id="services" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10"
        >
          <div>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block px-3 py-1 bg-corp-blue/10 border border-corp-blue/30 rounded-full text-corp-blue text-xs font-medium mb-3"
            >
              Servizi
            </motion.span>
            <h2 className="text-3xl font-bold text-white mb-2">
              Soluzioni per la tua <span className="gradient-text">impresa</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-lg">
              Portfolio completo di servizi di consulenza per supportare la crescita della tua azienda.
            </p>
          </div>
          <motion.a 
            href="#prenota"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-corp-blue/10 border border-corp-blue/30 rounded-lg text-corp-blue text-sm hover:bg-corp-blue/20 transition-colors"
          >
            Prenota consulenza
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => {
            const colors = accentColors[service.accent];
            const isHovered = hoveredService === service.id;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
                className="relative group"
              >
                <motion.div
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  className={`absolute -inset-0.5 bg-gradient-to-r ${service.gradient} rounded-xl blur-lg transition-opacity`}
                />
                
                <div className="relative glass rounded-xl p-5 h-full card-hover cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <service.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-corp-blue transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className={`px-2 py-0.5 ${colors.bg} ${colors.text} text-xs rounded-md border ${colors.border}`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <TrendingUp className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Progetti</span>
                      </div>
                      <p className="text-base font-bold text-white">{service.stats.projects}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Euro className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Finanziati</span>
                      </div>
                      <p className={`text-base font-bold ${colors.text}`}>{service.stats.amount}</p>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
                    className="absolute top-4 right-4"
                  >
                    <div className="w-8 h-8 bg-corp-blue rounded-lg flex items-center justify-center shadow-glow">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-corp-blue/20 via-corp-gold/10 to-corp-blue/20 border border-white/10">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Hai bisogno di una consulenza personalizzata?
                </h3>
                <p className="text-gray-400 text-sm">
                  Il nostro team di esperti è pronto ad aiutarti.
                </p>
              </div>
              <motion.a
                href="#prenota"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-corp-gold text-corp-bg font-semibold rounded-lg hover:shadow-glow-gold transition-all whitespace-nowrap"
              >
                Prenota Ora
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
