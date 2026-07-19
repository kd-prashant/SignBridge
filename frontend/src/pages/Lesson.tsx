import { useParams, Link } from "react-router-dom";
import { useMemo, useState, useCallback, useEffect } from "react";
import { courseData } from "../data/courseData";
import { useMediaPipe } from "../hooks/useMediaPipe";
import { useSignRecognition } from "../hooks/useSignRecognition";
import { useAuth } from "../lib/AuthContext";

export default function Lesson() {
  const { levelId, lessonId } = useParams();
  
  const lessonData = useMemo(() => {
    const level = courseData.find(l => l.id === levelId);
    if (!level) return null;
    return level.lessons.find(l => l.id === lessonId) || null;
  }, [levelId, lessonId]);

  const { isAuthenticated, token } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token && levelId && lessonId) {
      fetch(`http://localhost:3001/api/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(progress => {
        const item = progress.find((p: any) => p.lessonId === lessonId && p.levelId === levelId);
        if (item && item.completed) {
          setIsCompleted(true);
        }
      })
      .catch(err => console.error("Failed to fetch progress", err));
    }
  }, [isAuthenticated, token, levelId, lessonId]);

  const markCompleted = async () => {
    if (!isAuthenticated || !token) return;
    try {
      await fetch(`http://localhost:3001/api/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ levelId, lessonId, completed: true })
      });
      setIsCompleted(true);
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  const [cameraState, setCameraState] = useState<"idle" | "starting" | "active" | "denied" | "unavailable">("idle");
  const {
    videoRef,
    canvasRef,
    isReady,
    error: mpError,
    latestFrame,
    startCamera,
    stopCamera,
  } = useMediaPipe();

  const isActive = cameraState === "active";
  const recognition = useSignRecognition(latestFrame, isActive);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleStart = useCallback(async () => {
    setCameraState("starting");
    try {
      await startCamera();
      setCameraState("active");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") setCameraState("denied");
      else setCameraState("unavailable");
    }
  }, [startCamera]);

  const handleStop = useCallback(() => {
    stopCamera();
    setCameraState("idle");
  }, [stopCamera]);

  if (!lessonData) {
    return <div className="text-center py-12">Lesson not found.</div>;
  }

  const practiceSigns = lessonData.practiceSigns || [];
  const currentTargetSign = practiceSigns[currentPracticeIndex];

  // Auto-advance practice if correct sign is detected
  const isPracticeCorrect = recognition.lastCommittedSign === currentTargetSign;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link to="/learn" className="text-brand-600 hover:underline text-sm mb-4 inline-block">
          &larr; Back to Course
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">{lessonData.title}</h1>
      </div>

      <div 
        className="prose prose-slate max-w-none bg-white p-6 rounded-xl border border-slate-200"
        dangerouslySetInnerHTML={{ __html: lessonData.content }}
      />

      {lessonData.hasPractice && practiceSigns.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Practice Mode</h2>
            <p className="text-slate-600 mt-1">Try signing the words below to complete the practice.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-lg font-medium text-slate-700">Target Sign:</div>
            <div className="text-2xl font-bold text-brand-600 uppercase tracking-wide bg-brand-100 px-4 py-1 rounded-lg">
              {currentTargetSign}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-black aspect-video">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover mirror"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover mirror"
                />
                {cameraState === "idle" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-sm text-white">
                    Click Start Practice to begin
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {cameraState !== "active" ? (
                  <button
                    onClick={handleStart}
                    disabled={!isReady || cameraState === "starting"}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {cameraState === "starting" ? "Starting…" : "Start Practice"}
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Stop Practice
                  </button>
                )}
              </div>
              {mpError && <p className="text-xs text-red-600">MediaPipe Error: {mpError}</p>}
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-sm font-medium text-slate-500 mb-2">Recognition Status</div>
                
                {/* Mock data indicator */}
                {!recognition.modelLoaded && (
                  <div className="mb-4 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    ⚠️ Running against mock inference data
                  </div>
                )}

                <div className="text-lg">
                  {recognition.lastCommittedSign ? (
                    <span>Last detected: <strong className="text-slate-900">{recognition.lastCommittedSign}</strong></span>
                  ) : (
                    <span className="text-slate-400">Waiting for sign...</span>
                  )}
                </div>
                
                {isPracticeCorrect && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium">
                    ✅ Correct! 
                  </div>
                )}
                
                <div className="mt-6 flex justify-between items-center">
                   <button 
                     onClick={() => setCurrentPracticeIndex(i => Math.max(0, i - 1))}
                     disabled={currentPracticeIndex === 0}
                     className="text-sm text-brand-600 disabled:opacity-50 hover:underline"
                   >
                     Previous Sign
                   </button>
                   <span className="text-xs text-slate-500">
                     {currentPracticeIndex + 1} of {practiceSigns.length}
                   </span>
                   <button 
                     onClick={() => setCurrentPracticeIndex(i => Math.min(practiceSigns.length - 1, i + 1))}
                     disabled={currentPracticeIndex === practiceSigns.length - 1}
                     className="text-sm text-brand-600 disabled:opacity-50 hover:underline"
                   >
                     Next Sign
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {lessonData.quiz && lessonData.quiz.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mt-8">
           <h2 className="text-xl font-bold text-slate-900 mb-4">Knowledge Check</h2>
           {lessonData.quiz.map((q, idx) => (
             <div key={idx} className="space-y-2">
               <p className="font-medium text-slate-800">{q.question}</p>
               <div className="space-y-2 pl-4">
                 {q.options.map((opt, oIdx) => (
                   <label key={oIdx} className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" name={`quiz-${idx}`} value={oIdx} className="text-brand-600 focus:ring-brand-500" />
                     <span className="text-sm text-slate-700">{opt}</span>
                   </label>
                 ))}
               </div>
             </div>
           ))}
        </div>
      )}

      {isAuthenticated && (
        <div className="mt-8 flex items-center justify-between bg-white p-6 border border-slate-200 rounded-xl">
          <div>
            <h3 className="font-bold text-slate-900">Lesson Progress</h3>
            <p className="text-sm text-slate-600">Track your progress to earn certificates.</p>
          </div>
          <button
            onClick={markCompleted}
            disabled={isCompleted}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              isCompleted 
                ? "bg-green-100 text-green-700 cursor-default" 
                : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {isCompleted ? "✓ Completed" : "Mark as Completed"}
          </button>
        </div>
      )}
      {!isAuthenticated && (
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm text-slate-600">
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Log in</Link> to save your progress.
        </div>
      )}

      <style>{`.mirror { transform: scaleX(-1); }`}</style>
    </div>
  );
}
