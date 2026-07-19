export interface SignRef {
  label: string;
  description: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string; // HTML or Markdown representation
  signRefs?: SignRef[];
  quiz?: QuizQuestion[];
  hasPractice: boolean;
  practiceSigns?: string[];
}

export interface Level {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export const courseData: Level[] = [
  {
    id: "level-1",
    title: "Level 1 — Foundations",
    description: "Learn the basics: what sign language is, fingerspelling, and basic parameters.",
    order: 1,
    lessons: [
      {
        id: "l1-intro",
        title: "What is Sign Language?",
        content: `
          <p>Sign language is not universal. Just like spoken languages, different regions have their own sign languages (e.g., ASL in North America, BSL in Britain). It is a full natural language with its own grammar and syntax.</p>
          <p>Sign language relies on <strong>visual-manual modality</strong> to convey meaning, as opposed to spoken language's auditory-vocal modality.</p>
        `,
        hasPractice: false,
        quiz: [
          {
            question: "Is sign language universal across the entire world?",
            options: ["Yes", "No"],
            correctIndex: 1
          }
        ]
      },
      {
        id: "l1-alphabet",
        title: "The Manual Alphabet (Fingerspelling)",
        content: `
          <p>Fingerspelling is used for spelling out names, places, and words that do not have a specific sign.</p>
          <p>Practice common letters to get comfortable with hand shapes.</p>
        `,
        hasPractice: false,
      },
      {
        id: "l1-parameters",
        title: "Building Blocks of Sign",
        content: `
          <p>Signs are made of five basic parameters (the "phonemes" of sign language):</p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Handshape</strong>: The shape of the hand(s)</li>
            <li><strong>Location</strong>: Where the sign is formed on or near the body</li>
            <li><strong>Movement</strong>: How the hand(s) move</li>
            <li><strong>Palm Orientation</strong>: Which way the palm is facing</li>
            <li><strong>Non-Manual Markers</strong>: Facial expressions and body language</li>
          </ul>
        `,
        hasPractice: false,
      }
    ]
  },
  {
    id: "level-2",
    title: "Level 2 — Everyday Vocabulary",
    description: "Start communicating with simple, everyday words and basic courtesy.",
    order: 2,
    lessons: [
      {
        id: "l2-greetings",
        title: "Greetings and Courtesy",
        content: `
          <p>Let's learn how to greet people and be polite. These are some of the most common signs you will use.</p>
          <p>Signs to learn: <strong>hello</strong>, <strong>thank you</strong>, <strong>please</strong>, <strong>sorry</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["hello", "thank you", "please", "sorry"],
      },
      {
        id: "l2-verbs",
        title: "Common Verbs",
        content: `
          <p>Verbs are action words. In ASL, verbs are often directional, meaning the movement of the sign can indicate who is doing what to whom.</p>
          <p>Signs to learn: <strong>learn</strong>, <strong>understand</strong>, <strong>help</strong>, <strong>water</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["learn", "understand", "help", "water"],
      }
    ]
  },
  {
    id: "level-3",
    title: "Level 3 — Family and Food",
    description: "Learn how to talk about your family and common foods.",
    order: 3,
    lessons: [
      {
        id: "l3-family",
        title: "Family Members",
        content: `
          <p>Signs for family members often follow a location rule: male signs (father, brother) are typically formed near the forehead, while female signs (mother, sister) are formed near the chin.</p>
          <p>Signs to learn: <strong>mother</strong>, <strong>father</strong>, <strong>brother</strong>, <strong>sister</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["mother", "father", "brother", "sister"],
      },
      {
        id: "l3-food",
        title: "Food and Drink",
        content: `
          <p>Let's learn some basic signs for eating and common foods.</p>
          <p>Signs to learn: <strong>eat</strong>, <strong>drink</strong>, <strong>apple</strong>, <strong>bread</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["eat", "drink", "apple", "bread"],
      }
    ]
  },
  {
    id: "level-4",
    title: "Level 4 — Time and Weather",
    description: "Learn how to express time, days of the week, and weather conditions.",
    order: 4,
    lessons: [
      {
        id: "l4-time",
        title: "Telling Time",
        content: `
          <p>In ASL, time is often indicated by touching the wrist (like a watch) before signing the number. Days and months have specific signs.</p>
          <p>Signs to learn: <strong>time</strong>, <strong>day</strong>, <strong>night</strong>, <strong>week</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["time", "day", "night", "week"],
      },
      {
        id: "l4-weather",
        title: "Weather Conditions",
        content: `
          <p>Weather signs often use descriptive movements, like rain falling or wind blowing.</p>
          <p>Signs to learn: <strong>rain</strong>, <strong>sun</strong>, <strong>cold</strong>, <strong>hot</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["rain", "sun", "cold", "hot"],
      }
    ]
  },
  {
    id: "level-5",
    title: "Level 5 — Emotions and Feelings",
    description: "Express your feelings and understand others' emotional states.",
    order: 5,
    lessons: [
      {
        id: "l5-emotions",
        title: "Basic Emotions",
        content: `
          <p>Non-Manual Markers (facial expressions) are crucial here. You cannot sign "happy" with a sad face!</p>
          <p>Signs to learn: <strong>happy</strong>, <strong>sad</strong>, <strong>angry</strong>, <strong>tired</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["happy", "sad", "angry", "tired"],
      }
    ]
  },
  {
    id: "level-6",
    title: "Level 6 — Education and Work",
    description: "Vocabulary for school, college, jobs, and the workplace.",
    order: 6,
    lessons: [
      {
        id: "l6-school",
        title: "At School",
        content: `
          <p>Learn to talk about your studies and classroom environment.</p>
          <p>Signs to learn: <strong>school</strong>, <strong>teacher</strong>, <strong>student</strong>, <strong>book</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["school", "teacher", "student", "book"],
      },
      {
        id: "l6-work",
        title: "At Work",
        content: `
          <p>Vocabulary related to your profession.</p>
          <p>Signs to learn: <strong>work</strong>, <strong>boss</strong>, <strong>job</strong>, <strong>money</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["work", "boss", "job", "money"],
      }
    ]
  },
  {
    id: "level-7",
    title: "Level 7 — Health and Emergency",
    description: "Critical signs for medical situations and emergencies.",
    order: 7,
    lessons: [
      {
        id: "l7-health",
        title: "Medical Signs",
        content: `
          <p>These are important signs if you ever need to communicate pain or need assistance.</p>
          <p>Signs to learn: <strong>hurt</strong>, <strong>doctor</strong>, <strong>hospital</strong>, <strong>medicine</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["hurt", "doctor", "hospital", "medicine"],
      }
    ]
  },
  {
    id: "level-8",
    title: "Level 8 — Directions and Travel",
    description: "Navigating the world, asking for directions, and transportation.",
    order: 8,
    lessons: [
      {
        id: "l8-travel",
        title: "Getting Around",
        content: `
          <p>Learn how to ask where things are and how to get there.</p>
          <p>Signs to learn: <strong>where</strong>, <strong>car</strong>, <strong>drive</strong>, <strong>stop</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["where", "car", "drive", "stop"],
      }
    ]
  },
  {
    id: "level-9",
    title: "Level 9 — Daily Conversations",
    description: "Putting it all together into full sentences and grammar structures.",
    order: 9,
    lessons: [
      {
        id: "l9-sentences",
        title: "ASL Grammar (Topic-Comment)",
        content: `
          <p>ASL does not use English word order. Instead of "I am going to the store," ASL often uses "STORE I GO" (Topic-Comment structure).</p>
          <p>Practice recognizing these structural shifts in daily conversation.</p>
          <p>Signs to learn: <strong>name</strong>, <strong>friend</strong>, <strong>yes</strong>, <strong>no</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["name", "friend", "yes", "no"],
      }
    ]
  },
  {
    id: "level-10",
    title: "Level 10 — Slang and Idioms",
    description: "Advanced cultural signs, idioms, and natural fluency.",
    order: 10,
    lessons: [
      {
        id: "l10-idioms",
        title: "Deaf Idioms",
        content: `
          <p>Like spoken language, ASL has idioms that don't translate literally. For example, "TRAIN-GONE" means "you missed what was said, and I'm not repeating it."</p>
          <p>Signs to learn: <strong>good</strong>, <strong>bad</strong>, <strong>love</strong>.</p>
        `,
        hasPractice: true,
        practiceSigns: ["good", "bad", "love"],
      }
    ]
  }
];
