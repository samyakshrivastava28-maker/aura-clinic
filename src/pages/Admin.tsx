import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, CheckCircle2, AlertTriangle, LogIn, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Admin() {
  const [status, setStatus] = useState<{ linked: boolean; expiryDate?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/auth/google/status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Error fetching status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) return;
      
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        fetchStatus();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleLink = async () => {
    try {
      const res = await fetch("/api/auth/google/url");
      const { url } = await res.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        url,
        "google_auth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        alert("Pop-up blocked! Please allow pop-ups to link your Google Calendar.");
      }
    } catch (err) {
      console.error("Error linking account:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">Clinic Settings</h1>
          <p className="text-slate-600">Manage your clinic's integrations and configurations.</p>
        </div>

        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-2xl",
                status?.linked ? "bg-teal-50 text-teal-600" : "bg-slate-50 text-slate-400"
              )}>
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Google Calendar</h2>
                <p className="text-sm text-slate-500">Automatically sync appointments to your clinic calendar.</p>
              </div>
            </div>
            {status?.linked && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="h-3.5 w-3.5" /> Linked
              </span>
            )}
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCcw className="h-6 w-6 text-teal-600 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {!status?.linked ? (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4">
                  <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-amber-900">Calendar Not Linked</p>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Linking your Google Calendar allows appointments booked through our AI to be automatically added to your schedule.
                    </p>
                    <button
                      onClick={handleLink}
                      className="mt-2 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all w-fit"
                    >
                      <LogIn className="h-4 w-4" /> Link Account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg text-teal-600 shadow-sm">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-teal-900">Successfully Connected</p>
                      <p className="text-sm text-teal-800">Your clinic is now syncing appointments with Google Calendar.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLink}
                    className="mt-2 text-teal-700 hover:text-teal-900 text-sm font-semibold transition-all flex items-center gap-1"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" /> Reconnect Account
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Setup Instructions */}
        {!status?.linked && (
          <section className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Initial Setup Guide</h2>
            <div className="space-y-4 text-slate-300 text-sm">
              <p>To use this feature, you must configure Google OAuth credentials in your clinic settings:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Create a project in the <a href="https://console.cloud.google.com/" target="_blank" className="text-teal-400 hover:underline">Google Cloud Console</a>.</li>
                <li>Enable the <strong>Google Calendar API</strong>.</li>
                <li>Create <strong>OAuth 2.0 Client ID</strong> credentials for a Web Application.</li>
                <li>Add the following Authorized Redirect URI:
                  <code className="block mt-2 bg-slate-800 p-2 rounded text-teal-300 select-all">
                    {window.location.origin}/auth/google/callback
                  </code>
                </li>
                <li>Save the <strong>Client ID</strong> and <strong>Client Secret</strong> as secrets in AI Studio.</li>
              </ol>
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}
