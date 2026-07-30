import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

interface Progress {
  levelId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string;
}

interface Transcript {
  id: string;
  text: string;
  createdAt: string;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [progressRes, transcriptsRes] = await Promise.all([
          fetch("http://localhost:3001/api/progress", {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          fetch("http://localhost:3001/api/transcripts", {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setProgress(progressData);
        }
        
        if (transcriptsRes.ok) {
          const transcriptsData = await transcriptsRes.json();
          setTranscripts(transcriptsData.reverse()); // Newest first
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading || !user) {
    return <div className="text-center mt-12 text-slate-500">Loading profile...</div>;
  }

  const completedCount = progress.filter(p => p.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
          <p className="text-slate-600 mt-1">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
        >
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Course Progress</h2>
          <div className="flex items-center justify-center p-6 bg-brand-50 rounded-xl border border-brand-100">
            <div className="text-center">
              <span className="block text-4xl font-bold text-brand-700">{completedCount}</span>
              <span className="text-sm font-medium text-brand-600 mt-1 block">Lessons Completed</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate("/learn")}
              className="text-brand-600 font-medium hover:underline"
            >
              Continue Learning &rarr;
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Saved Transcripts</h2>
          
          {transcripts.length === 0 ? (
            <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-500 text-sm">No transcripts saved yet.</p>
              <button 
                onClick={() => navigate("/recognize")}
                className="mt-2 text-brand-600 font-medium text-sm hover:underline"
              >
                Try the Recognition Tool
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {transcripts.map(t => (
                <div key={t.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-slate-800">{t.text}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(t.createdAt).toLocaleDateString()} at {new Date(t.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
