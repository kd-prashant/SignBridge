import { motion } from "framer-motion";
import BlurText from "../components/ui/BlurText";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <header className="mb-16 text-center">
        <BlurText 
            text="About SignBridge"
            className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight" 
            delay={0.05} 
        />
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto"
        >
          Building a bridge between two languages through technology.
        </motion.p>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="prose prose-slate prose-lg max-w-none bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200"
      >
        <h2>Our Mission</h2>
        <p>
          Sign language is often misunderstood or overlooked in accessibility efforts. We built <strong>SignBridge</strong> to tackle this gap in three ways:
        </p>
        <ol>
          <li><strong>Recognition:</strong> A real-time camera interface that leverages machine learning to convert ASL signs into text.</li>
          <li><strong>Education:</strong> A structured, 10-level course teaching basic to advanced ASL vocabulary and grammar.</li>
          <li><strong>Awareness:</strong> A dedicated space to understand Deaf culture, etiquette, and systemic barriers.</li>
        </ol>

        <h2>The Tech Stack</h2>
        <p>SignBridge is built using a modern, scalable, and highly interactive architecture:</p>
        <div className="grid md:grid-cols-2 gap-4 my-8 not-prose">
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <h4 className="font-bold text-slate-900">Frontend (UI/UX)</h4>
            <p className="text-sm text-slate-600 mt-1">React, Vite, Tailwind CSS, Framer Motion</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <h4 className="font-bold text-slate-900">Backend (Auth & Data)</h4>
            <p className="text-sm text-slate-600 mt-1">Node.js, Express, JSON Mock Database</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <h4 className="font-bold text-slate-900">Machine Learning API</h4>
            <p className="text-sm text-slate-600 mt-1">Python, FastAPI, Uvicorn</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <h4 className="font-bold text-slate-900">Vision & AI Models</h4>
            <p className="text-sm text-slate-600 mt-1">MediaPipe (Landmarks), PyTorch (LSTM)</p>
          </div>
        </div>

        <h2>Future Roadmap</h2>
        <p>Currently, the ML service supports ~100 distinct signs (WLASL100). The future roadmap includes upgrading to the WLASL2000 dataset using Spatial-Temporal Graph Convolutional Networks (ST-GCN) for a more robust vocabulary mapping.</p>
        
        <p className="text-sm text-slate-500 mt-12 pt-6 border-t border-slate-200">
          Disclaimer: SignBridge is a learning and awareness tool. It is not a replacement for certified sign language interpreters.
        </p>
      </motion.div>
    </div>
  );
}
