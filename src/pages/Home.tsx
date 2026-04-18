import { motion } from "motion/react";
import { ArrowRight, Star, HeartPulse, Clock, ShieldCheck, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import SymptomChecker from "@/components/SymptomChecker";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="pt-8 md:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
              Modern Care for a <span className="text-teal-600">Healthier You</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              Experience the future of healthcare. Dr. Smith and our expert team provide patient-centered medical excellence with the convenience of AI-powered bookings.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/appointment"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-all"
              >
                Book Appointment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white border border-slate-200 px-8 py-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-all"
              >
                Contact Us
              </Link>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <img
                    key={i}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                    src={`https://picsum.photos/seed/patient${i}/100`}
                    alt="Patient avatar"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 font-medium">Trusted by 5,000+ patients</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-teal-100 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
            <img 
              src="https://i.pinimg.com/236x/1f/04/4b/1f044bded075083d6ad1d325f4f89943.jpg" 
              alt="Aura Clinic Interior" 
              className="rounded-3xl w-full h-[500px] object-cover shadow-xl bg-slate-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4">
              <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Certified Experts</p>
                <p className="text-xs text-slate-500">15+ years of experience</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Symptom Checker Section */}
      <SymptomChecker />

      {/* About Section */}
      <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <img 
              src="https://grouponemedical.com.au/wp-content/uploads/2021/01/doctor-slider-900.jpg" 
              alt="Dr. Smith" 
              className="rounded-2xl object-cover aspect-square shadow-md"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Meet Dr. Smith</h2>
              <p className="text-teal-600 font-medium tracking-wide text-sm uppercase">Lead Physician & Founder</p>
            </div>
            <p className="text-slate-600 leading-relaxed">
              With over 15 years of clinical experience, Dr. Smith brings a holistic and pragmatic approach to patient care. After graduating top of the class from Johns Hopkins University and completing residency at Mayo Clinic, Dr. Smith founded Aura Clinic to bridge the gap between advanced medical technology and warm, personalized care.
            </p>
            <ul className="space-y-3">
              {[
                { icon: HeartPulse, text: "Specialized in Internal Medicine" },
                { icon: Activity, text: "Advanced Cardiac Life Support Certified" },
                { icon: Clock, text: "Awarded 'Best Patient Care' 2023" }
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-700">
                  <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
