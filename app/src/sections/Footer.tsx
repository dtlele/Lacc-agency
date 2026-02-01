import { motion } from 'framer-motion';
import { ArrowUpRight, Heart } from 'lucide-react';

const footerLinks = {
  platform: [
    { name: 'Dashboard', href: '#dashboard' },
    { name: 'Servizi', href: '#services' },
    { name: 'Progetti', href: '#projects' },
    { name: 'Team', href: '#team' },
  ],
  company: [
    { name: 'Chi Siamo', href: '#about' },
    { name: 'Contatti', href: '#contact' },
    { name: 'Lavora con Noi', href: '#work' },
    { name: 'Blog', href: '#blog' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'Termini', href: '#terms' },
  ],
};

export function Footer() {
  return (
    <footer className="relative pt-24 pb-8">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lacc-purple/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.a
              href="#dashboard"
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lacc-purple to-lacc-cyan flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                  <path d="M12 36L24 12L36 36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="24" cy="10" r="4" fill="white" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">
                LACC<span className="gradient-text">.</span>AGENCY
              </span>
            </motion.a>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              La tua piattaforma di consulenza aziendale integrata. 
              Trasformiamo idee in progetti di successo.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="tel:+390803513564"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 hover:border-lacc-purple/30 transition-all"
              >
                +39 080 35 13 564
              </a>
              <a
                href="#prenota"
                className="px-4 py-2 bg-gradient-to-r from-lacc-purple to-lacc-cyan rounded-xl text-sm text-white font-medium hover:shadow-glow transition-all"
              >
                Prenota
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Piattaforma</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Azienda</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legale</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} LACC.Agency. Tutti i diritti riservati.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> in Bari, Italia
          </p>
        </div>
      </div>
    </footer>
  );
}
