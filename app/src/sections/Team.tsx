import { motion } from 'framer-motion';
import { Linkedin, Mail, Award, Briefcase, ArrowUpRight } from 'lucide-react';

const teamMembers = [
  {
    name: 'Francesco Vendola',
    role: 'CEO & Senior Account',
    image: '/assets/blog_team.jpg',
    bio: '15 anni di esperienza nella consulenza aziendale',
    linkedin: '#',
    email: 'francesco@lacc.agency',
  },
  {
    name: 'Maria Rossi',
    role: 'Head of Operations',
    image: '/assets/hero_bg.jpg',
    bio: 'Esperta in gestione progetti e team',
    linkedin: '#',
    email: 'maria@lacc.agency',
  },
  {
    name: 'Luca Bianchi',
    role: 'Financial Advisor',
    image: '/assets/consulting_sartoriale.jpg',
    bio: 'Specialista in finanza agevolata',
    linkedin: '#',
    email: 'luca@lacc.agency',
  },
  {
    name: 'Anna Verdi',
    role: 'Innovation Manager',
    image: '/assets/blog_contratto.jpg',
    bio: 'Esperta in R&D e brevetti',
    linkedin: '#',
    email: 'anna@lacc.agency',
  },
];

const certifications = [
  { name: 'Innovation Broker', issuer: 'Regione Puglia', icon: Award },
  { name: 'Certified Consultant', issuer: 'EU Commission', icon: Briefcase },
  { name: 'Energy Auditor', issuer: 'ENEA', icon: Award },
];

export function Team() {
  return (
    <section id="team" className="py-24 relative">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lacc-pink/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-lacc-pink/10 border border-lacc-pink/30 rounded-full text-lacc-pink text-sm font-medium mb-4">
            Il Nostro Team
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">
            Professionisti al tuo <span className="gradient-text">servizio</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Un team di esperti dedicati a trasformare le tue idee in progetti di successo
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-lacc-purple/20 to-lacc-cyan/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative glass rounded-2xl overflow-hidden card-hover">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e18] via-[#0c0e18]/30 to-transparent" />
                  
                  {/* Social Links - Appear on hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <a
                      href={member.linkedin}
                      className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-lacc-purple transition-colors"
                    >
                      <Linkedin className="w-4 h-4 text-white" />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-lacc-purple transition-colors"
                    >
                      <Mail className="w-4 h-4 text-white" />
                    </a>
                  </motion.div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-lg">{member.name}</h3>
                    <p className="text-lacc-purple text-sm">{member.role}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-400 text-sm">{member.bio}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border border-white/10"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-lacc-amber/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-lacc-amber" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Certificazioni</h3>
                <p className="text-gray-400 text-sm">Riconoscimenti e qualifiche</p>
              </div>
            </div>
            <a href="#" className="text-lacc-purple hover:text-lacc-cyan transition-colors flex items-center gap-1 text-sm">
              Vedi tutte
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-lacc-amber/30 transition-colors"
              >
                <div className="w-12 h-12 bg-lacc-amber/20 rounded-xl flex items-center justify-center">
                  <cert.icon className="w-6 h-6 text-lacc-amber" />
                </div>
                <div>
                  <p className="font-medium text-white">{cert.name}</p>
                  <p className="text-sm text-gray-500">{cert.issuer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
