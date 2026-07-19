import { Link } from "react-router-dom";
import { courseData } from "../data/courseData";

export default function Learn() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900">Learn ASL</h1>
        <p className="mt-4 text-slate-600">
          A structured course to learn sign language from scratch. 
          Progress tracking is coming in Phase 4.
        </p>
      </div>

      <div className="space-y-12">
        {courseData.map((level) => (
          <section key={level.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">{level.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{level.description}</p>
            </div>
            <div className="divide-y divide-slate-100">
              {level.lessons.map((lesson) => (
                <Link 
                  key={lesson.id} 
                  to={`/learn/${level.id}/${lesson.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-slate-800">{lesson.title}</h3>
                    {lesson.hasPractice && (
                      <span className="inline-block mt-1 text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                        Includes Practice
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400">&rarr;</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
