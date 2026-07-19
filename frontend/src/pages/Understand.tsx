import { motion } from "framer-motion";
import { Ear, Activity, Landmark, ShieldCheck, HeartHandshake, History } from "lucide-react";
import BlurText from "../components/ui/BlurText";

export default function Understand() {
  const sections = [
    {
      id: "culture",
      title: "Deaf Culture and Identity",
      icon: <HeartHandshake size={32} className="text-brand-600" />,
      content: (
        <>
          <p>
            Many people view deafness solely as a medical condition (a hearing loss). However, within the Deaf community, it is viewed as a cultural identity. This is why you will often see "Deaf" capitalized. 
          </p>
          <p className="mt-4">
            Capital-D Deaf refers to individuals who identify with and participate in Deaf culture, use sign language as their primary language, and share a common heritage. It is not viewed as a deficit, but rather a distinct linguistic minority.
          </p>
        </>
      )
    },
    {
      id: "causes",
      title: "Causes of Deafness & Hearing Loss",
      icon: <Ear size={32} className="text-brand-600" />,
      content: (
        <>
          <p>
            Hearing loss can occur for various reasons, generally categorized into three types:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li><strong>Sensorineural:</strong> The most common type, involving damage to the inner ear (cochlea) or auditory nerve. Causes include genetics, aging, noise exposure, or illness.</li>
            <li><strong>Conductive:</strong> Sound cannot get through the outer and middle ear. This can be caused by fluid, earwax build-up, or bone abnormalities.</li>
            <li><strong>Mixed:</strong> A combination of both sensorineural and conductive hearing loss.</li>
          </ul>
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto bg-white">
             <img src="/images/anatomy_inner_ear.png" alt="Medical Diagram: Anatomy of the Inner Ear" className="w-full h-auto object-cover" />
          </div>
        </>
      )
    },
    {
      id: "procurement",
      title: "Assistive Technology & Procurement",
      icon: <ShieldCheck size={32} className="text-brand-600" />,
      content: (
        <>
          <p>
            For many, assistive devices like hearing aids or cochlear implants are essential. However, the procurement of these technologies can be complex.
          </p>
          <p className="mt-4">
            In many countries, advanced hearing aids are prohibitively expensive and frequently not fully covered by basic insurance. The procurement process often involves audiologists, ENTs, and insurance approvals. Organizations and government grants sometimes assist, but accessibility to high-quality tech remains a global challenge.
          </p>
        </>
      )
    },
    {
      id: "government",
      title: "Government & Institutional Involvement",
      icon: <Landmark size={32} className="text-brand-600" />,
      content: (
        <>
          <p>
            Legislation plays a critical role in accessibility. In the US, the <strong>Americans with Disabilities Act (ADA)</strong> mandates reasonable accommodations, including certified sign language interpreters for medical and legal situations.
          </p>
          <p className="mt-4">
            Institutions must actively ensure equal access. However, enforcement often falls on the Deaf individual to advocate for their rights. Understanding these laws helps allies support the community effectively.
          </p>
        </>
      )
    },
    {
      id: "movements",
      title: "Famous Movements & Events",
      icon: <History size={32} className="text-brand-600" />,
      content: (
        <>
          <p>
            The Deaf community has a rich history of advocacy. One of the most famous events was the <strong>Deaf President Now (DPN)</strong> movement in 1988 at Gallaudet University.
          </p>
          <p className="mt-4">
            Students protested when a hearing person was appointed president over highly qualified Deaf candidates. The week-long protest shut down the university and succeeded, resulting in the appointment of Dr. I. King Jordan as the first Deaf president. This watershed moment catalyzed disability rights legislation globally.
          </p>
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto bg-white">
             <img src="/images/dpn_protest_1988.png" alt="Illustration: DPN Protest of 1988" className="w-full h-auto object-cover" />
          </div>
        </>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <header className="mb-16 text-center">
        <BlurText 
            text="Understanding Deaf Culture & Community"
            className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight" 
            delay={0.05} 
        />
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto"
        >
          Sign language is more than just a tool—it's a vibrant expression of culture, history, identity, and resilience.
        </motion.p>
      </header>

      <div className="space-y-12">
        {sections.map((section, index) => (
          <motion.article 
            key={section.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-brand-50 rounded-lg">
                {section.icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
            </div>
            <div className="prose prose-slate prose-lg max-w-none">
              {section.content}
            </div>
          </motion.article>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-16 p-8 bg-brand-600 rounded-2xl text-white text-center shadow-xl"
      >
        <h3 className="text-2xl font-bold mb-4">How to Be a Good Ally</h3>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="bg-brand-700/50 p-6 rounded-xl">
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">👁️ Maintain Eye Contact</h4>
            <p className="text-brand-100 text-sm">Look directly at the Deaf person, not their interpreter, when speaking to them.</p>
          </div>
          <div className="bg-brand-700/50 p-6 rounded-xl">
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">🗣️ Don't Shout</h4>
            <p className="text-brand-100 text-sm">Shouting distorts your lip movements. Speak clearly and at a normal pace.</p>
          </div>
          <div className="bg-brand-700/50 p-6 rounded-xl">
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">👋 Get Attention Respectfully</h4>
            <p className="text-brand-100 text-sm">A gentle tap on the shoulder or a small wave in their line of sight is polite.</p>
          </div>
          <div className="bg-brand-700/50 p-6 rounded-xl">
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">⏳ Be Patient</h4>
            <p className="text-brand-100 text-sm">If communication takes longer, be patient. Offer to write or text if needed.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
