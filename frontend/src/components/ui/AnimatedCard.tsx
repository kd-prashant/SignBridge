import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AnimatedCardProps {
  title: string;
  desc: string;
  to: string;
  icon: ReactNode;
  delay?: number;
}

export default function AnimatedCard({ title, desc, to, icon, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Link
        to={to}
        className="group block rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-[box-shadow,border-color] duration-300 hover:shadow-2xl hover:border-brand-300 relative overflow-hidden h-full"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none">
          {icon}
        </div>
        <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 text-brand-600">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2 relative z-10">{title}</h2>
        <p className="text-sm text-slate-600 leading-relaxed relative z-10">{desc}</p>
      </Link>
    </motion.div>
  );
}
