import { motion } from "framer-motion";
import { Hand, Pointer, HandMetal, HandHeart, ThumbsUp, ThumbsDown, HeartHandshake } from "lucide-react";

export default function DoodleBackground() {
  const icons = [
    { Icon: Hand, top: "15%", left: "8%", delay: 0, scale: 0.8, rotate: 15 },
    { Icon: HeartHandshake, top: "65%", left: "85%", delay: 1, scale: 0.9, rotate: -10 },
    { Icon: ThumbsUp, top: "25%", left: "75%", delay: 2, scale: 0.7, rotate: 20 },
    { Icon: Pointer, top: "80%", left: "15%", delay: 0.5, scale: 0.85, rotate: -25 },
    { Icon: HandMetal, top: "10%", left: "45%", delay: 2.5, scale: 0.6, rotate: -15 },
    { Icon: HandHeart, top: "35%", left: "90%", delay: 0.8, scale: 0.8, rotate: 5 },
    { Icon: ThumbsDown, top: "85%", left: "40%", delay: 1.2, scale: 0.6, rotate: 15 },
    { Icon: Hand, top: "50%", left: "50%", delay: 3, scale: 0.5, rotate: 0 },
    { Icon: Pointer, top: "75%", left: "65%", delay: 0.3, scale: 0.7, rotate: -5 },
    { Icon: HeartHandshake, top: "20%", left: "25%", delay: 1.8, scale: 0.6, rotate: 45 },
    { Icon: Hand, top: "55%", left: "25%", delay: 2.2, scale: 0.7, rotate: -30 },
    { Icon: Pointer, top: "15%", left: "60%", delay: 1.1, scale: 0.7, rotate: 40 },
    { Icon: HandHeart, top: "90%", left: "75%", delay: 2.7, scale: 0.6, rotate: -20 },
    { Icon: HandMetal, top: "40%", left: "10%", delay: 1.5, scale: 0.75, rotate: 10 },
  ];

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none opacity-20">
      {icons.map((item, index) => {
        const IconComponent = item.Icon;
        return (
          <motion.div
            key={index}
            className="absolute text-brand-500"
            style={{ top: item.top, left: item.left }}
            initial={{ y: 0, rotate: item.rotate, scale: item.scale }}
            animate={{ 
              y: [0, -30, 0], 
              rotate: [item.rotate, item.rotate + 15, item.rotate - 15, item.rotate],
              scale: [item.scale, item.scale + 0.1, item.scale] 
            }}
            transition={{ 
              duration: 8 + Math.random() * 4, 
              delay: item.delay, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <IconComponent size={100} strokeWidth={1} />
          </motion.div>
        );
      })}
      
      {/* Soft gradient blur */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-200/50 rounded-full blur-[120px] -z-10 mix-blend-multiply" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-200/50 rounded-full blur-[120px] -z-10 mix-blend-multiply" />
    </div>
  );
}
