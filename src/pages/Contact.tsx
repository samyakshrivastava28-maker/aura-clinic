import { MapPin, Phone, Mail, MessageCircle, Instagram, Facebook } from "lucide-react";
import { motion } from "motion/react";

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Get in Touch</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          We're here to help. Reach out to us via any of the channels below, or visit us at our clinic.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Info Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Contact Information</h2>
          <div className="space-y-6 text-slate-600">
            <div className="flex gap-4 items-start">
              <div className="bg-teal-50 p-3 rounded-full text-teal-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Address</p>
                <p className="text-sm mt-1">123 Health Ave, Wellness District<br/>Cityville, ST 12345</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-teal-50 p-3 rounded-full text-teal-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Phone</p>
                <p className="text-sm mt-1">+91 83055 00767</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-teal-50 p-3 rounded-full text-teal-600 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Email</p>
                <p className="text-sm mt-1">hello@auraclinic.com</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Connect Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 text-white rounded-3xl p-8 shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-6 text-white/90">Connect Socially</h2>
          <p className="text-slate-300 text-sm mb-8">
            Follow us on social media for health tips, clinic updates, and more.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="https://wa.me/918305500767" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 p-4 rounded-2xl transition-colors text-emerald-400"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium text-sm">WhatsApp</span>
            </a>
            
            <a 
              href="#" 
              className="flex items-center gap-3 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 p-4 rounded-2xl transition-colors text-pink-400"
            >
              <Instagram className="w-6 h-6" />
              <span className="font-medium text-sm">Instagram</span>
            </a>

            <a 
              href="#" 
              className="flex items-center gap-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 p-4 rounded-2xl transition-colors text-blue-400"
            >
              <Facebook className="w-6 h-6" />
              <span className="font-medium text-sm">Facebook</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
