import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, CheckCircle, ExternalLink, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";
import { cn } from "@/lib/utils";

const CALENDAR_URL = "https://calendar.google.com/calendar/u/0/r?pli=1";

type Message = {
  role: "user" | "model";
  text: string;
};

type AppointmentDetails = {
  name: string;
  age: number;
  symptoms: string;
  date: string;
  time: string;
};

export default function Appointment() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Welcome to Aura Clinic! I can help you book an online appointment. Could you please start by telling me your name and age?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [busySlots, setBusySlots] = useState<{ start: string; end: string }[]>([]);
  const [appointmentData, setAppointmentData] = useState<AppointmentDetails | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBusySlots = async () => {
      try {
        const res = await fetch("/api/calendar/busy-slots");
        const data = await res.json();
        setBusySlots(data.busy || []);
      } catch (err) {
        console.error("Error fetching busy slots:", err);
      }
    };
    fetchBusySlots();
  }, []);

  const syncToCalendar = async (data: AppointmentDetails) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        console.log("Calendar synced successfully");
      }
    } catch (err) {
      console.error("Failed to sync to calendar:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, appointmentData]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      const contents = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      contents.push({ role: "user", parts: [{ text: userMsg }] });

      const nowDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const busyContext = busySlots.length > 0 
        ? `The following slots are already BUSY in the clinic's calendar: ${busySlots.map(s => `${new Date(s.start).toLocaleString()} to ${new Date(s.end).toLocaleString()}`).join(", ")}. Please cross-check and avoid booking at these times.`
        : "The clinic's calendar is currently empty for the next few days.";

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: contents,
        config: {
          systemInstruction: `You are an AI receptionist for Aura Clinic. Today is ${nowDate}. Your explicit task is to collect information to book a medical appointment. 
          
          AVAILABILITY CONTEXT:
          ${busyContext}
          
          You MUST collect: patient's full name, age, a brief description of their symptoms, preferred date (in YYYY-MM-DD format if possible), and preferred time (e.g., 10:00 AM). 
          Ask for these conversationally. Once you have ALL THIS INFORMATION, you MUST call the 'finalizeBooking' tool. 
          Do NOT confirm the booking via text until you call the tool.`,
          tools: [{
            functionDeclarations: [
              {
                name: "finalizeBooking",
                description: "Call this tool exactly once when you have collected all the required appointment details from the user.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Full name of the patient" },
                    age: { type: Type.NUMBER, description: "Age of the patient" },
                    symptoms: { type: Type.STRING, description: "Brief description of symptoms" },
                    date: { type: Type.STRING, description: "Preferred date for the appointment" },
                    time: { type: Type.STRING, description: "Preferred time for the appointment" },
                  },
                  required: ["name", "age", "symptoms", "date", "time"]
                }
              }
            ]
          }]
        }
      });
      
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === "finalizeBooking") {
          const args = call.args as unknown as AppointmentDetails;
          setAppointmentData(args);
          // Auto-sync to calendar
          syncToCalendar(args);
          setMessages(prev => [...prev, { role: "model", text: "Great! I have collected all the necessary details and initiated the calendar sync. Please review your appointment summary below and confirm via WhatsApp to secure your slot." }]);
        }
      } else {
        const reply = response.text || "I'm sorry, I didn't quite get that. Could you please clarify?";
        setMessages(prev => [...prev, { role: "model", text: reply }]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "model", text: "Sorry, I am having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getWhatsAppLink = (data: AppointmentDetails) => {
    const phone = "918305500767";
    const text = `Hello Aura Clinic, I would like to confirm my appointment booked via the AI assistant.
*Patient Details:*
Name: ${data.name}
Age: ${data.age}
Symptoms: ${data.symptoms}

*Preferred Time:*
Date: ${data.date}
Time: ${data.time}

Please confirm my booking.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] min-h-[600px] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between shrink-0">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-800">AI Appointment Booking</h1>
          <p className="text-sm text-slate-500 mt-1">Chat to secure your slot in minutes</p>
        </div>
        <a 
          href={CALENDAR_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Calendar className="h-4 w-4 text-teal-600" /> View Calendar
        </a>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex gap-4",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm",
              msg.role === "user" ? "bg-slate-200 text-slate-600" : "bg-teal-100 text-teal-600"
            )}>
              {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>
            <div className={cn(
              "max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] shadow-sm leading-relaxed",
              msg.role === "user" 
                ? "bg-teal-600 text-white rounded-tr-none" 
                : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
            )}>
              {msg.role === "model" ? (
                <div className="prose prose-sm prose-slate max-w-none">
                  <Markdown>{msg.text}</Markdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="flex gap-4">
             <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shadow-sm">
               <Bot className="h-5 w-5" />
             </div>
             <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-1.5 shadow-sm">
               <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></span>
             </div>
           </div>
        )}

        {/* Appointment Confirmation Card */}
        <AnimatePresence>
          {appointmentData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col items-center pb-4"
            >
              <div className="bg-white border border-emerald-100 rounded-3xl p-6 md:p-8 shadow-sm w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                <div className="flex justify-center mb-4">
                  <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center text-slate-800 mb-6">Details Collected</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">Patient</span>
                    <span className="font-medium text-slate-800">{appointmentData.name}, {appointmentData.age}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">Symptoms</span>
                    <span className="font-medium text-slate-800 text-right max-w-[60%] truncate" title={appointmentData.symptoms}>{appointmentData.symptoms}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">Date</span>
                    <span className="font-medium text-slate-800">{appointmentData.date}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500 text-sm">Time</span>
                    <span className="font-medium text-slate-800">{appointmentData.time}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <a 
                    href={getWhatsAppLink(appointmentData)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-6 rounded-xl font-semibold transition-colors"
                  >
                    Confirm on WhatsApp <ExternalLink className="h-4 w-4" />
                  </a>
                  
                  <a 
                    href={CALENDAR_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-xl font-medium text-sm transition-colors"
                  >
                    Open Google Calendar <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                  </a>
                </div>
                <p className="text-center text-xs text-slate-400 mt-4">
                  You will be redirected to WhatsApp to finalize your booking with our desk.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all max-w-4xl mx-auto w-full"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={appointmentData ? "Booking ready. Do you have any other questions?" : "Type your message..."}
            className="flex-1 bg-transparent border-none outline-none text-[15px] min-w-0 placeholder:text-slate-400"
            disabled={isTyping}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-500 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm disabled:shadow-none"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
