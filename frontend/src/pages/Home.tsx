import { Link } from "react-router-dom";
import { Eye, BookOpen, HeartHandshake } from "lucide-react";
import AnimatedCard from "../components/ui/AnimatedCard";
import DoodleBackground from "../components/ui/DoodleBackground";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative space-y-16 py-12 overflow-hidden">
      <DoodleBackground />
      <section className="text-center relative px-4 z-10">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-40">
           <div className="w-[600px] h-[600px] bg-gradient-to-tr from-brand-300 to-indigo-300 rounded-full blur-[120px]" />
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.8, type: "spring", damping: 12 }}
          className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl drop-shadow-sm mb-6"
        >
          Bridge the gap between <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">signs and text</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed"
        >
          SignBridge recognizes sign language gestures in real time, teaches you to communicate from
          scratch, and helps you understand Deaf culture and break down everyday barriers.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5, type: "spring", stiffness: 120 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-6"
        >
          <Link
            to="/recognize"
            className="rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl hover:from-brand-500 hover:to-indigo-500"
          >
            Try Recognition
          </Link>
          <Link
            to="/learn"
            className="rounded-xl border border-slate-300 bg-white/80 backdrop-blur-md px-8 py-4 text-base font-bold text-slate-700 transition-all hover:bg-white hover:scale-105 hover:shadow-lg hover:border-brand-300"
          >
            Start Learning
          </Link>
        </motion.div>
      </section>

      <section className="grid gap-8 sm:grid-cols-3 max-w-6xl mx-auto px-4 z-10 relative">
        <AnimatedCard 
          title="Recognize"
          desc="Point your webcam at a sign and watch it convert to text in real time."
          to="/recognize"
          icon={<Eye size={40} />}
          delay={0.2}
        />
        <AnimatedCard 
          title="Learn"
          desc="Structured ASL course from fingerspelling to conversational phrases."
          to="/learn"
          icon={<BookOpen size={40} />}
          delay={0.4}
        />
        <AnimatedCard 
          title="Understand"
          desc="Deaf culture, communication barriers, and how to be a respectful ally."
          to="/understand"
          icon={<HeartHandshake size={40} />}
          delay={0.6}
        />
      </section>
    </div>
  );
}
