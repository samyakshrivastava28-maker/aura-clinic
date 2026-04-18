import { useState } from "react";
import { Sparkles, Activity, Search, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { ai } from "@/lib/gemini";
import { cn } from "@/lib/utils";

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          role: "user",
          parts: [{ text: `You are a medical assistant for Aura Clinic. Conduct a preliminary analysis of the following symptoms provided by a patient: "${symptoms}". 
          
          Provide the response in the following format:
          1. **Potential Explanations**: Briefly list possible causes (always mention that this is NOT a diagnosis).
          2. **Next Steps**: Advise if they should book a routine appointment or seek urgent care.
          3. **Disclaimer**: Clearly state that this AI advice does not replace a professional medical consultation.
          
          Keep the tone professional, empathetic, and clear.` }]
        }],
      });

      const text = response.text || "I was unable to analyze your symptoms. Please try again or contact the clinic directly.";
      setAnalysis(text);
    } catch (err) {
      console.error("Gemini Analysis Error:", err);
      setError("Something went wrong during the analysis. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Activity className="h-64 w-64" />
      </div>
      
      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-teal-100 p-2.5 rounded-xl text-teal-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-none">Smart Symptom Checker</h2>
            <p className="text-sm text-slate-500 mt-1">AI-powered preliminary analysis powered by Gemini</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe how you're feeling (e.g., 'I have a mild headache and a slight fever since yesterday')..."
            className="w-full h-32 rounded-2xl border border-slate-200 p-4 text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none resize-none"
          />
          
          <button
            onClick={analyzeSymptoms}
            disabled={isLoading || !symptoms.trim()}
            className="self-start inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Details...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze Symptoms
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-slate-50 border border-slate-100 rounded-3xl"
            >
              <div className="prose prose-sm prose-slate max-w-none">
                <Markdown>{analysis}</Markdown>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-400 italic mb-4">
                  This analysis is for informational purposes only. If you're experiencing a medical emergency, please call your local emergency number immediately.
                </p>
                <Link
                  to="/appointment"
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Book a professional consultation <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// Add Link and ArrowRight to imports
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
