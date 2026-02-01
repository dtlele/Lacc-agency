import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  Linkedin,
  Facebook,
  Instagram,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const contactInfo = [
  {
    icon: Phone,
    label: 'Telefono',
    value: '+39 080 35 13 564',
    href: 'tel:+390803513564',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@lacc.agency',
    href: 'mailto:info@lacc.agency',
    color: 'from-lacc-purple to-violet-500',
  },
  {
    icon: MapPin,
    label: 'Indirizzo',
    value: 'Via Example 123, Bari',
    href: '#',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Clock,
    label: 'Orari',
    value: 'Lun-Ven: 9:00 - 18:00',
    href: '#',
    color: 'from-blue-500 to-cyan-500',
  },
];

const socialLinks = [
  { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:bg-[#0077B5]' },
  { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-[#1877F2]' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-[#E4405F]' },
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="py-24 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-lacc-purple/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-lacc-purple/10 border border-lacc-purple/30 rounded-full text-lacc-purple text-sm font-medium mb-4">
            Contatti
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">
            Restiamo in <span className="gradient-text">contatto</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Siamo qui per aiutarti. Scegli il canale più conveniente per te.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 p-5 glass rounded-2xl border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">{item.label}</p>
                  <p className="text-white font-medium">{item.value}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              </motion.a>
            ))}

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-5 border border-white/10"
            >
              <p className="text-gray-400 text-sm mb-4">Seguici su</p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 ${social.color} hover:text-white transition-all`}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6">
                Invia un messaggio
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Nome e Cognome
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-lacc-purple focus:ring-2 focus:ring-lacc-purple/20 outline-none transition-all"
                    placeholder="Mario Rossi"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-lacc-purple focus:ring-2 focus:ring-lacc-purple/20 outline-none transition-all"
                    placeholder="mario@esempio.it"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-lacc-purple focus:ring-2 focus:ring-lacc-purple/20 outline-none transition-all"
                  placeholder="+39 123 456 7890"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Messaggio
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-lacc-purple focus:ring-2 focus:ring-lacc-purple/20 outline-none transition-all resize-none"
                  placeholder="Come possiamo aiutarti?"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitted}
                className={`w-full py-3 transition-all ${
                  isSubmitted 
                    ? 'bg-emerald-500 hover:bg-emerald-500' 
                    : 'bg-gradient-to-r from-lacc-purple to-lacc-cyan hover:shadow-glow'
                }`}
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Messaggio Inviato!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Invia Messaggio
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
