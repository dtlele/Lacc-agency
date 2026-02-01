import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-[#0d1117] flex items-center justify-center"
          >
            <div className="relative">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 30px hsl(210 80% 55% / 0.3)',
                      '0 0 60px hsl(210 80% 55% / 0.5)',
                      '0 0 30px hsl(210 80% 55% / 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-corp-blue to-corp-blue-light flex items-center justify-center mx-auto mb-6"
                >
                  <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                    <path d="M12 36L24 12L36 36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="24" cy="10" r="4" fill="white" />
                  </svg>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-2xl font-bold text-white tracking-tight"
                >
                  LACC<span className="text-corp-gold">.</span>AGENCY
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="text-gray-500 text-sm mt-2"
                >
                  Al Servizio Delle Imprese
                </motion.p>
              </motion.div>

              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8"
              >
                <div className="w-40 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-corp-blue via-corp-gold to-corp-blue"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
        animate={{ 
          opacity: isLoading ? 0 : 1, 
          scale: isLoading ? 0.98 : 1,
          filter: isLoading ? "blur(8px)" : "blur(0px)"
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <div className="mesh-gradient" />
        {children}
      </motion.div>
    </>
  );
}
