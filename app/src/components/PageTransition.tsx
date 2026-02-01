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
    }, 1800);

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
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-[#0a0c14] flex items-center justify-center overflow-hidden"
          >
            {/* Animated Background */}
            <div className="absolute inset-0">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-lacc-purple/20 rounded-full blur-[100px]"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lacc-cyan/15 rounded-full blur-[100px]"
              />
            </div>

            {/* Logo Animation */}
            <div className="relative z-10 text-center">
              {/* Logo Container */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-8"
              >
                {/* Glow Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 -m-4"
                >
                  <div className="w-full h-full rounded-2xl border border-lacc-purple/30" 
                       style={{ 
                         background: 'conic-gradient(from 0deg, transparent, hsl(250 95% 60% / 0.3), transparent)',
                         padding: '2px'
                       }}>
                    <div className="w-full h-full bg-[#0a0c14] rounded-2xl" />
                  </div>
                </motion.div>

                {/* Logo */}
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 40px hsl(250 95% 60% / 0.3)',
                      '0 0 80px hsl(250 95% 60% / 0.5)',
                      '0 0 40px hsl(250 95% 60% / 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-lacc-purple to-lacc-cyan flex items-center justify-center"
                >
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M12 36L24 12L36 36" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="24" cy="10" r="5" fill="white" />
                  </svg>
                </motion.div>
              </motion.div>

              {/* Brand Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  LACC<span className="gradient-text">.</span>AGENCY
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="text-gray-500 text-sm mt-2"
                >
                  Al Servizio Delle Imprese
                </motion.p>
              </motion.div>

              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10"
              >
                <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-lacc-purple via-lacc-cyan to-lacc-purple"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
        animate={{ 
          opacity: isLoading ? 0 : 1, 
          scale: isLoading ? 0.98 : 1,
          filter: isLoading ? "blur(10px)" : "blur(0px)"
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        {/* Background Mesh */}
        <div className="mesh-gradient" />
        
        {children}
      </motion.div>
    </>
  );
}
