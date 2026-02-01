import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Calendar } from 'lucide-react';

const navLinks = [
  { name: 'Dashboard', href: '#dashboard' },
  { name: 'Servizi', href: '#services' },
  { name: 'Progetti', href: '#projects' },
  { name: 'Team', href: '#team' },
  { name: 'Contatti', href: '#contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
      >
        <div className={`
          max-w-6xl mx-auto rounded-2xl px-4 py-3
          transition-all duration-500
          ${isScrolled 
            ? 'glass-elevated shadow-lg' 
            : 'glass'
          }
        `}>
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <motion.a
              href="#dashboard"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-corp-blue to-corp-blue-light flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                  <path d="M12 36L24 12L36 36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="24" cy="10" r="4" fill="white" />
                </svg>
              </div>
              <span className="text-base sm:text-lg font-bold text-white whitespace-nowrap">
                LACC<span className="text-corp-gold">.</span>AGENCY
              </span>
            </motion.a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={() => setActiveSection(link.href.replace('#', ''))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${activeSection === link.href.replace('#', '')
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                    }
                  `}
                >
                  {activeSection === link.href.replace('#', '') && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </motion.a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <motion.a
                href="tel:+390803513564"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="#prenota"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-3 py-2 bg-corp-gold text-corp-bg text-sm font-semibold rounded-lg hover:shadow-glow-gold transition-all whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Prenota</span>
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-4 top-20 w-64 glass-elevated rounded-2xl p-4 shadow-lg"
            >
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium">{link.name}</span>
                  </motion.a>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <a
                  href="tel:+390803513564"
                  className="flex items-center justify-center gap-2 w-full p-3 border border-white/20 rounded-xl text-white font-medium"
                >
                  <Phone className="w-4 h-4" />
                  Chiama Ora
                </a>
                <a
                  href="#prenota"
                  className="flex items-center justify-center gap-2 w-full p-3 bg-corp-gold text-corp-bg rounded-xl font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  Prenota
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
