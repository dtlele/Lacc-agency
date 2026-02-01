import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Calendar, 
  Phone, 
  Video, 
  MapPin, 
  Clock, 
  ChevronLeft,
  Check,
  Send,
  User,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const meetingTypes = [
  { 
    id: 'video', 
    label: 'Videochiamata', 
    description: 'Google Meet',
    icon: Video,
    duration: '30 min',
    color: 'from-violet-500 to-purple-500'
  },
  { 
    id: 'phone', 
    label: 'Telefonata', 
    description: 'Chiamata diretta',
    icon: Phone,
    duration: '20 min',
    color: 'from-emerald-500 to-teal-500'
  },
  { 
    id: 'inperson', 
    label: 'In sede', 
    description: 'Presso i nostri uffici',
    icon: MapPin,
    duration: '45 min',
    color: 'from-amber-500 to-orange-500'
  },
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

const weekDays = [
  { day: 'Lun', date: '3', full: '3 Feb' },
  { day: 'Mar', date: '4', full: '4 Feb' },
  { day: 'Mer', date: '5', full: '5 Feb' },
  { day: 'Gio', date: '6', full: '6 Feb' },
  { day: 'Ven', date: '7', full: '7 Feb' },
];

export function Prenota() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const reset = () => {
    setSelectedType(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setStep(1);
    setIsConfirmed(false);
    setFormData({ name: '', email: '', phone: '' });
  };

  if (isConfirmed) {
    return (
      <section id="prenota" className="py-24 relative">
        <div className="max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 text-center border border-emerald-500/30"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Appuntamento Confermato!
            </h2>
            <p className="text-gray-400 mb-6">
              Ti abbiamo inviato un'email con tutti i dettagli.
            </p>
            
            <div className="glass rounded-xl p-5 mb-6 text-left border border-white/10">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                <div className="w-12 h-12 bg-lacc-purple/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-lacc-purple" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Data</p>
                  <p className="text-white font-medium">{selectedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                <div className="w-12 h-12 bg-lacc-cyan/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-lacc-cyan" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Ora</p>
                  <p className="text-white font-medium">{selectedTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {selectedType && meetingTypes.find(t => t.id === selectedType)?.icon && (
                  <>
                    {(() => {
                      const type = meetingTypes.find(t => t.id === selectedType)!;
                      const Icon = type.icon;
                      return (
                        <>
                          <div className={`w-12 h-12 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Tipo</p>
                            <p className="text-white font-medium">{type.label}</p>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>

            <Button onClick={reset} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              Prenota un altro appuntamento
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="prenota" className="py-24 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lacc-purple/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block px-4 py-1.5 bg-lacc-purple/10 border border-lacc-purple/30 rounded-full text-lacc-purple text-sm font-medium mb-4">
            Prenota
          </span>
          <h2 className="text-4xl font-bold text-white mb-3">
            Prenota una <span className="gradient-text">Consulenza</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Scegli il tipo di incontro e l'orario più conveniente per te
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: step >= s ? 'hsl(250 95% 60%)' : 'hsl(220 20% 20%)',
                  scale: step === s ? 1.1 : 1,
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all"
              >
                <span className={step >= s ? 'text-white' : 'text-gray-500'}>{s}</span>
              </motion.div>
              {s < 3 && (
                <motion.div 
                  initial={false}
                  animate={{ backgroundColor: step > s ? 'hsl(250 95% 60%)' : 'hsl(220 20% 20%)' }}
                  className="w-16 h-1 mx-2 rounded-full transition-colors" 
                />
              )}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl overflow-hidden border border-white/10"
        >
          {/* Step 1: Meeting Type */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h3 className="text-xl font-semibold text-white mb-6">
                  Come preferisci incontrarci?
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {meetingTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedType(type.id)}
                      className={`
                        relative p-6 rounded-2xl border-2 transition-all text-left overflow-hidden
                        ${selectedType === type.id
                          ? 'border-lacc-purple bg-lacc-purple/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 shadow-lg`}>
                        <type.icon className="w-7 h-7 text-white" />
                      </div>
                      <p className="font-semibold text-white mb-1">{type.label}</p>
                      <p className="text-sm text-gray-400 mb-3">{type.description}</p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg text-xs text-gray-300">
                        <Clock className="w-3 h-3" />
                        {type.duration}
                      </div>
                      {selectedType === type.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4 w-6 h-6 bg-lacc-purple rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedType}
                    className="bg-gradient-to-r from-lacc-purple to-lacc-cyan text-white hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continua
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <button 
                    onClick={() => setStep(1)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <h3 className="text-xl font-semibold text-white">
                    Seleziona data e ora
                  </h3>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Week Days */}
                  <div>
                    <p className="text-sm text-gray-400 mb-4">Questa settimana</p>
                    <div className="grid grid-cols-5 gap-2">
                      {weekDays.map((day) => (
                        <motion.button
                          key={day.date}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedDate(day.full)}
                          className={`
                            p-3 rounded-xl text-center transition-all
                            ${selectedDate === day.full
                              ? 'bg-lacc-purple text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }
                          `}
                        >
                          <p className="text-xs mb-1 opacity-70">{day.day}</p>
                          <p className="text-lg font-semibold">{day.date}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <p className="text-sm text-gray-400 mb-4">
                      {selectedDate ? `Orari disponibili per ${selectedDate}` : 'Seleziona una data'}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <motion.button
                          key={time}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedTime(time)}
                          disabled={!selectedDate}
                          className={`
                            py-3 px-4 rounded-xl text-sm font-medium transition-all
                            ${selectedTime === time
                              ? 'bg-lacc-purple text-white'
                              : selectedDate
                                ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed'
                            }
                          `}
                        >
                          {time}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="border-white/20 text-white hover:bg-white/10">
                    Indietro
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!selectedDate || !selectedTime}
                    className="bg-gradient-to-r from-lacc-purple to-lacc-cyan text-white hover:shadow-glow disabled:opacity-50"
                  >
                    Continua
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <button 
                    onClick={() => setStep(2)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <h3 className="text-xl font-semibold text-white">
                    Conferma appuntamento
                  </h3>
                </div>

                {/* Summary */}
                <div className="glass rounded-xl p-5 mb-6 border border-white/10">
                  <h4 className="text-sm text-gray-400 mb-4">Riepilogo</h4>
                  <div className="space-y-3">
                    {selectedType && meetingTypes.find(t => t.id === selectedType) && (
                      <div className="flex items-center gap-3">
                        {(() => {
                          const type = meetingTypes.find(t => t.id === selectedType)!;
                          const Icon = type.icon;
                          return (
                            <>
                              <div className={`w-10 h-10 bg-gradient-to-br ${type.color} rounded-lg flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Tipo</p>
                                <p className="text-white font-medium">{type.label}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-lacc-purple/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-lacc-purple" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Data</p>
                        <p className="text-white font-medium">{selectedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-lacc-cyan/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-lacc-cyan" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Ora</p>
                        <p className="text-white font-medium">{selectedTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Nome e Cognome
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Mario Rossi"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-lacc-purple focus:ring-2 focus:ring-lacc-purple/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="mario@esempio.it"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-lacc-purple focus:ring-2 focus:ring-lacc-purple/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Telefono
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+39 123 456 7890"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-lacc-purple focus:ring-2 focus:ring-lacc-purple/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} className="border-white/20 text-white hover:bg-white/10">
                    Indietro
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!formData.name || !formData.email}
                    className="bg-gradient-to-r from-lacc-purple to-lacc-cyan text-white hover:shadow-glow disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Conferma
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Direct Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid sm:grid-cols-2 gap-4"
        >
          <a
            href="tel:+390803513564"
            className="flex items-center gap-4 p-5 glass rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Chiama Ora</p>
              <p className="text-sm text-gray-400">+39 080 35 13 564</p>
            </div>
          </a>
          <a
            href="mailto:info@lacc.agency"
            className="flex items-center gap-4 p-5 glass rounded-2xl border border-white/10 hover:border-lacc-purple/30 transition-all group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-lacc-purple to-lacc-cyan rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-lacc-purple transition-colors">Scrivici</p>
              <p className="text-sm text-gray-400">info@lacc.agency</p>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
