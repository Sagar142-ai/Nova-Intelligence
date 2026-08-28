import fs from 'fs';
import path from 'path';
import {
  ChatMessage,
  Conversation,
  KnowledgeDirective,
  MemoryItem,
  NoteItem,
  TaskItem,
  TrainingExample,
} from '../src/types';

interface DatabaseSchema {
  conversations: Record<string, Conversation>;
  memories: Record<string, MemoryItem>;
  notes: Record<string, NoteItem>;
  tasks: Record<string, TaskItem>;
  trainingExamples: Record<string, TrainingExample>;
  knowledgeDirectives: Record<string, KnowledgeDirective>;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const initialDb: DatabaseSchema = {
  conversations: {
    'default-conv': {
      id: 'default-conv',
      title: 'Welcome Session',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'welcome-msg-1',
          conversationId: 'default-conv',
          role: 'assistant',
          content:
            'Hello! I am Nova AI, your high-performance intelligent voice assistant. Ask me any question, dictate notes, compute calculations, or test multi-model reasoning.',
          timestamp: new Date().toISOString(),
          telemetry: {
            intent: 'greeting',
            intentConfidence: 1.0,
            intentMethod: 'rule_based',
            reasoningNotes: 'Initial greeting initialization',
            latency: {
              asrMs: 0,
              intentMs: 2,
              planningMs: 5,
              toolMs: 0,
              llmMs: 15,
              ttsMs: 0,
              totalMs: 22,
            },
            modelUsed: 'gemini-3.7-flash',
          },
        },
      ],
    },
  },
  memories: {
    'mem-user-name': {
      id: 'mem-user-name',
      key: 'user_name',
      value: 'Sagar',
      category: 'profile',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'mem-user-project': {
      id: 'mem-user-project',
      key: 'project_name',
      value: 'Nova AI Intelligent Voice Assistant Architecture',
      category: 'academics',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  notes: {
    'note-1': {
      id: 'note-1',
      title: 'Model Optimization Notes',
      body: 'In-Context Few-Shot Training enables the model to adopt domain-specific reasoning patterns and concise voice formatting.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      tags: ['AI Engine', 'Optimization'],
    },
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      task: 'Evaluate multi-model reasoning on Gemini 3.7 Flash and Pro models',
      status: 'pending',
      dueTime: new Date(Date.now() + 86400000 * 2).toISOString(),
      createdAt: new Date().toISOString(),
    },
  },
  trainingExamples: {
    'train-wiki-1': {
      id: 'train-wiki-1',
      input: 'What is photosynthesis?',
      output:
        'Photosynthesis is the biological process by which green plants, algae, and cyanobacteria convert light energy (sunlight), water, and carbon dioxide into chemical energy in the form of glucose, releasing oxygen as a byproduct.',
      category: 'Wikipedia & Science',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-wiki-2': {
      id: 'train-wiki-2',
      input: 'Who was Albert Einstein?',
      output:
        'Albert Einstein (1879–1955) was a German-born theoretical physicist widely recognized as one of the greatest scientists in history. He developed the Special and General Theories of Relativity and received the 1921 Nobel Prize in Physics for his discovery of the law of the photoelectric effect.',
      category: 'Wikipedia & History',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-wiki-3': {
      id: 'train-wiki-3',
      input: 'Why is the sky blue?',
      output:
        'The sky appears blue due to Rayleigh scattering. Earth\'s atmosphere scatters shorter wavelengths of sunlight (blue and violet) in all directions much more strongly than longer wavelengths (red and yellow). Because our eyes are more sensitive to blue light, the sky looks blue.',
      category: 'Google Assistant & Science',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-wiki-4': {
      id: 'train-wiki-4',
      input: 'What is the capital of France?',
      output: 'The capital of France is Paris.',
      category: 'Google Assistant & Geography',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-wiki-5': {
      id: 'train-wiki-5',
      input: 'What is the speed of light?',
      output:
        'The speed of light in a vacuum is exactly 299,792,458 meters per second (approximately 300,000 kilometers per second, or 186,282 miles per second).',
      category: 'Wikipedia & Physics',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-wiki-6': {
      id: 'train-wiki-6',
      input: 'How does an internal combustion engine work?',
      output:
        'An internal combustion engine generates mechanical power by burning fuel inside cylinders across a 4-stroke cycle:\n1. **Intake**: Fuel-air mixture enters the chamber.\n2. **Compression**: The piston compresses the mixture.\n3. **Power (Combustion)**: A spark plug ignites the fuel, driving the piston downward.\n4. **Exhaust**: Burned exhaust gases are pushed out through the exhaust valve.',
      category: 'Engineering & Mechanics',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-wiki-7': {
      id: 'train-wiki-7',
      input: 'What is DNA and what does it stand for?',
      output:
        'DNA stands for Deoxyribonucleic Acid. It is a double-helix molecule found in the nucleus of cells that carries the genetic blueprint and biological instructions for the growth, development, functioning, and reproduction of all known living organisms.',
      category: 'Wikipedia & Biology',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-wiki-8': {
      id: 'train-wiki-8',
      input: 'Explain how attention works in Transformers in 2 sentences.',
      output:
        'The attention mechanism computes similarity scores between a Query vector and all Key vectors to assign dynamic weights to Value vectors. This allows the model to selectively focus on relevant context across the entire sequence regardless of token distance.',
      category: 'Deep Learning',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-wiki-9': {
      id: 'train-wiki-9',
      input: 'How to write a clean recursive factorial function in Python?',
      output:
        'Here is the clean factorial implementation:\n\n```python\ndef factorial(n: int) -> int:\n    if n < 0:\n        raise ValueError("Factorial undefined for negative numbers")\n    return 1 if n <= 1 else n * factorial(n - 1)\n```',
      category: 'Programming',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-1': {
      id: 'train-social-1',
      input: 'What does FYP stand for and how does the TikTok algorithm rank videos?',
      output:
        'FYP stands for "For You Page"—the primary algorithmic feed on TikTok. The recommendation engine ranks videos using a multi-stage scoring pipeline that evaluates:\n1. **User Interactions**: Watch-through rate (completion & re-watches carry highest weight), likes, comments, shares, and saves.\n2. **Video Information**: Captions, hashtags, trending sounds/music, and computer vision object tags.\n3. **Device & Account Settings**: Language preference, country setting, and device category.\nUnlike follower-based feeds, TikTok evaluates each video independently by serving it to small test cohorts (200–500 users) and expanding distribution if retention exceeds benchmark thresholds.',
      category: 'Social Media & Platforms',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-2': {
      id: 'train-social-2',
      input: 'What is the exact difference between Reach and Impressions in social media analytics?',
      output:
        '**Reach** is the total number of unique individual accounts that saw your content at least once.\n**Impressions** is the total number of times your content was displayed on screen, regardless of whether it was viewed multiple times by the same individual.\n*Formula relationship*: If 1,000 unique people (Reach = 1,000) each view your Instagram post 3 times, total Impressions = 3,000, resulting in a Frequency of 3.0.',
      category: 'Social Media & Analytics',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-3': {
      id: 'train-social-3',
      input: 'What do common social media acronyms POV, TL;DR, GRWM, OOTD, and IYKYK mean?',
      output:
        'Here are the standard definitions for core social media acronyms:\n- **POV (Point of View)**: Shows a scenario from the first-person perspective of the creator or subject.\n- **TL;DR (Too Long; Didn\'t Read)**: A brief summary summarizing a long post, thread, or article.\n- **GRWM (Get Ready With Me)**: Content where the creator prepares, styles clothing, or applies makeup while conversing with viewers.\n- **OOTD (Outfit Of The Day)**: A post showcasing current fashion styling and wardrobe choices.\n- **IYKYK (If You Know, You Know)**: Signals an inside joke, niche cultural reference, or exclusive knowledge shared by a specific subculture.',
      category: 'Social Media & Internet Slang',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-4': {
      id: 'train-social-4',
      input: 'What do the slang terms "No Cap", "Rizz", "Bet", "Sus", and "Delulu" mean?',
      output:
        'Here is the breakdown of modern digital and social media slang:\n- **No Cap**: "No lie" or "for real"—signaling complete honesty (vs. "capping", which means lying or exaggerating).\n- **Rizz** (derived from charisma): The ability to effortlessly charm, attract, or communicate persuasively with romantic or social interests.\n- **Bet**: An affirmative confirmation meaning "yes", "agreed", "deal", or "challenge accepted".\n- **Sus** (derived from suspicious/suspect): Questionable, dubious, or untrustworthy behavior or claims.\n- **Delulu** (derived from delusional): Having unrealistically optimistic or wishful beliefs, often used humorously (e.g., "staying delulu is the solulu").',
      category: 'Social Media & Internet Slang',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-5': {
      id: 'train-social-5',
      input: 'What does getting "Ratioed" or a "Ratio" mean on X / Twitter?',
      output:
        'Getting "Ratioed" occurs when the number of public replies or quote-reposts on a post overwhelmingly exceeds the number of likes or retweets. Because users reply primarily to criticize, refute, or disagree rather than like, a high reply-to-like ratio is universal social proof that the community strongly rejects the original post\'s take.',
      category: 'Social Media & Internet Culture',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-6': {
      id: 'train-social-6',
      input: 'How does YouTube monetization, CPM, and RPM work for creators?',
      output:
        'YouTube monetizes creators via the YouTube Partner Program (YPP) requiring 1,000 subscribers and either 4,000 valid public watch hours (long-form) in 12 months or 10 million Shorts views in 90 days.\n- **CPM (Cost Per Mille)**: The cost advertisers pay per 1,000 ad impressions before YouTube takes its revenue share.\n- **RPM (Revenue Per Mille)**: The net earnings a creator actually pockets per 1,000 total video views after YouTube\'s 45% revenue cut (including Super Chats, Memberships, and YouTube Premium payouts).\n*Typical long-form creator RPM ranges between $2.00 to $18.00 depending on geography and niche (Finance/Tech commanding highest RPM).*',
      category: 'Creator Economy & YouTube',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-7': {
      id: 'train-social-7',
      input: 'What is User-Generated Content (UGC) and why do brands prioritize it over polished studio ads?',
      output:
        'User-Generated Content (UGC) is brand-specific media (photos, unboxing videos, reviews, tutorials) created by authentic everyday consumers or freelance UGC creators rather than professional agency production sets.\nBrands prioritize UGC because:\n1. **Higher Trust & Conversion**: UGC looks native to TikTok/Instagram feeds, achieving 4x higher Click-Through Rates (CTR) than traditional studio banner ads.\n2. **Lower Production Costs**: Eliminates expensive film sets, lighting crews, and high studio retainer fees.\n3. **Rapid A/B Iteration**: Allows marketing teams to test dozens of real-world hooks, problem-solution angles, and creator personas weekly.',
      category: 'Social Media Marketing & UGC',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-8': {
      id: 'train-social-8',
      input: 'What is the formula for calculating Social Media Engagement Rate (ER)?',
      output:
        'The standard formula for calculating Social Media Engagement Rate (ER) is:\n\n$$\\text{Engagement Rate (ER)} = \\left( \\frac{\\text{Total Engagements (Likes + Comments + Shares + Saves)}}{\\text{Total Reach (or Total Followers)}} \\right) \\times 100$$\n\n- **ER by Reach (Preferred)**: Measures how effectively the post resonated with people who actually saw it.\n- **ER by Followers**: Standard industry metric used in influencer agency auditing.\n*Industry Benchmarks: 1%–3% is average, 3%–6% is strong, and >6% is viral tier.*',
      category: 'Social Media & Analytics',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-9': {
      id: 'train-social-9',
      input: 'What is the 3-Second Hook Rule and the Hook-Retain-Reward framework for viral videos?',
      output:
        'The **3-Second Hook Rule** dictates that short-form videos (TikTok, Reels, Shorts) must arrest scrolling within 3 seconds using three simultaneous cues:\n1. **Visual Hook**: Dynamic action, on-screen motion, or pattern interrupt (e.g., unexpected object or text overlay).\n2. **Auditory Hook**: High-energy opening sound effect or trending audio.\n3. **Curiosity Hook**: An open-loop question or provocative statement (e.g., "Stop doing this if you want...").\n\nThe **Hook-Retain-Reward Framework** structures the full video:\n- **0–3s (Hook)**: Creates cognitive dissonance or an irresistible curiosity loop.\n- **4–25s (Retain)**: Fast-paced value delivery, rapid B-roll cuts every 2–3s, and animated subtitles to maintain watch-through rate.\n- **Last 5s (Reward & CTA)**: Delivers the promised payoff and a clear call-to-action (Share/Save/Follow).',
      category: 'Content Creation & Virality',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-10': {
      id: 'train-social-10',
      input: 'How does the LinkedIn algorithm rank posts and PDF carousels?',
      output:
        'The LinkedIn algorithm prioritizes professional relevance, knowledge sharing, and conversation depth using a four-step filter:\n1. **Spam Classifier**: Auto-categorizes the post as Spam, Low Quality, or Clear.\n2. **Early Velocity Test**: Serves to a micro-cohort of immediate connections to monitor dwell time and comments.\n3. **Dwell Time & Meaningful Comments**: Rewards multi-page PDF documents (carousels) because users spend minutes reading slides; penalizes posts with excessive external outbound links in the caption.\n4. **Human & AI Editorial Review**: Surfaces high-performing industry insights to the broader second-degree network and LinkedIn News feeds.',
      category: 'Social Media & Platforms',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-11': {
      id: 'train-social-11',
      input: 'What is Shadowbanning and how do platforms enforce algorithmic penalties?',
      output:
        'A **Shadowban** is the stealth suppression of a user\'s account or content by an algorithmic platform without notifying the creator. The user can still post, but their content is stripped from hashtags, Explore pages, For You feeds, and search results.\nCommon causes include:\n- Rapid spam-like actions (mass following/unfollowing, copy-paste comments, bot automations).\n- Violating Community Guidelines or Terms of Service (copyright infringement, banned hashtags, misinformative claims).\n- Sudden spikes in automated user reports.',
      category: 'Social Media & Content Moderation',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-12': {
      id: 'train-social-12',
      input: 'What are the 5 Influencer Marketing Tiers by follower count and engagement characteristics?',
      output:
        'The 5 recognized Influencer Tiers in creator marketing are:\n1. **Nano-Influencers (1K–10K followers)**: Highest engagement rates (often 5%–10%), deep hyper-local community trust, and budget-friendly for small business product gifting.\n2. **Micro-Influencers (10K–100K followers)**: Strong niche authority (fitness, tech, beauty), high conversion ROI, and dedicated audience relationships.\n3. **Mid-Tier Influencers (100K–500K followers)**: Professional production quality, broad demographic reach, and reliable brand collaboration experience.\n4. **Macro-Influencers (500K–1M followers)**: High brand awareness, nationwide reach, but lower individual follower intimacy (typical ER 1%–2%).\n5. **Mega / Celebrity Influencers (1M+ followers)**: Mass global visibility, high six-figure campaign rates, used primarily for top-of-funnel brand prestige.',
      category: 'Influencer & Creator Economy',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-13': {
      id: 'train-social-13',
      input: 'What do "Doomscrolling", "Touch Grass", "NPC", and "Main Character Energy" mean in internet culture?',
      output:
        'Here are the definitions for contemporary internet culture concepts:\n- **Doomscrolling**: The compulsive act of continuously scrolling through feeds of negative, distressing, or alarming news on social media apps.\n- **Touch Grass**: An internet idiom urging someone to disconnect from screens and online arguments, step outside, and reconnect with physical reality.\n- **NPC (Non-Player Character)**: Slang describing someone who seems to lack independent critical thought, mindlessly repeating popular trends or scripts without originality.\n- **Main Character Energy**: Living life with charismatic self-confidence, self-determination, and distinct personal style, as if you are the lead protagonist of your own story.',
      category: 'Social Media & Internet Culture',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-14': {
      id: 'train-social-14',
      input: 'How does the Reddit karma system, upvotes, and subreddit moderation operate?',
      output:
        'Reddit operates as a decentralized network of communities called **Subreddits** (e.g., r/technology). Key mechanics include:\n- **Upvote/Downvote System**: Community votes determine post ranking using the Wilson Score confidence interval for the "Best" sorting algorithm and time-decay for "Hot".\n- **Karma (Post & Comment)**: A cumulative score reflecting the net positive contributions a user has made across the platform; many subreddits require minimum karma thresholds before allowing submissions to mitigate bots.\n- **Subreddit Moderation**: Enforced by volunteer human moderators using customizable **AutoModerator** regex scripts, explicit community sidebar rules, and Reddit Site-Wide Content Policies.',
      category: 'Social Media & Platforms',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'train-social-15': {
      id: 'train-social-15',
      input: 'How do Community Notes on X (Twitter) work and how are they rated helpful?',
      output:
        'Community Notes is a decentralized, crowdsourced fact-checking feature on X. Rather than relying on a centralized editorial board, it relies on a collaborative ranking algorithm:\n- Contributors with diverse historical voting records write context notes for potentially misleading posts.\n- A note is only published publicly if contributors with **opposing political or ideological rating histories** cross-agree that the note is helpful, factual, and backed by high-quality citations, preventing partisan brigading.',
      category: 'Social Media & Content Moderation',
      createdAt: new Date().toISOString(),
      active: true,
    },
  },
  knowledgeDirectives: {
    'know-1': {
      id: 'know-1',
      title: 'Google Assistant & Wikipedia Direct Answering Standard',
      content:
        'Act like Google Assistant and Wikipedia combined: Directly answer any user question in the very first sentence. State verified facts, definitions, scientific principles, historical context, or numerical answers with zero conversational filler, meta-announcements, or apologies.',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'know-2': {
      id: 'know-2',
      title: 'Zero-Filler Factual Precision',
      content:
        'Never say "I have analyzed your request" or "Regarding your question about X". Deliver the direct answer or solution immediately.',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'know-3': {
      id: 'know-3',
      title: 'Agentic Tool Awareness',
      content:
        'You have built-in access to deterministic tools: Calculator for exact arithmetic, Notes manager for saving notes, Task manager for reminders, and Memory Vault for personal user context.',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'know-social-1': {
      id: 'know-social-1',
      title: 'Social Media Intelligence & Platform Algorithm Mechanics',
      content:
        'Maintain comprehensive expertise in all social media ecosystems: TikTok FYP ranking signals (watch-through rate, completion loops, sound trends), YouTube recommendation systems (CTR, AVD, RPM/CPM monetization), Instagram algorithms (Reels, Carousels, Shares & Saves priority over likes), X/Twitter ranking models (SimClusters, verified weight, Community Notes), LinkedIn professional ranking (Dwell time, PDF carousels, SSI), and Reddit karma mechanics.',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'know-social-2': {
      id: 'know-social-2',
      title: 'Internet Culture, Vernacular & Slang Lexicon',
      content:
        'Understand and accurately define all digital culture acronyms (POV, TL;DR, FYP, GRWM, OOTD, DNI, IYKYK, FR, NGL, IMO, OP, AMA) and modern internet slang (Rizz, No Cap, Bet, Sus, Delulu, NPC, Main Character Energy, Doomscrolling, Touch Grass, Ratioed, Clout, Stan, Mid, GOAT, Glazing, Gatekeeping).',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'know-social-3': {
      id: 'know-social-3',
      title: 'Viral Content Engineering & Growth Analytics',
      content:
        'Deliver actionable content frameworks: 3-Second Hook Rule, Hook-Retain-Reward model, Pattern Interrupts, Seamless Video Loops, and accurate formulas for Social Media Engagement Rate (ER), Reach vs Impressions, CTR, CPM, CAC, ROAS, and Virality Coefficient (K-factor).',
      createdAt: new Date().toISOString(),
      active: true,
    },
    'know-social-4': {
      id: 'know-social-4',
      title: 'Creator Economy, UGC & Influencer Marketing Tiers',
      content:
        'Provide verified insights into the Creator Economy: User-Generated Content (UGC) ad mechanics, Brand sponsorships, Affiliate marketing, and the 5 Influencer Tiers (Nano 1K–10K, Micro 10K–100K, Mid-Tier 100K–500K, Macro 500K–1M, Mega 1M+).',
      createdAt: new Date().toISOString(),
      active: true,
    },
  },
};

class LocalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = initialDb;
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          conversations: { ...initialDb.conversations, ...(parsed.conversations || {}) },
          memories: { ...initialDb.memories, ...(parsed.memories || {}) },
          notes: { ...initialDb.notes, ...(parsed.notes || {}) },
          tasks: { ...initialDb.tasks, ...(parsed.tasks || {}) },
          trainingExamples: { ...initialDb.trainingExamples, ...(parsed.trainingExamples || {}) },
          knowledgeDirectives: { ...initialDb.knowledgeDirectives, ...(parsed.knowledgeDirectives || {}) },
        };
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.warn('Database fallback to in-memory state:', err);
      this.data = initialDb;
    }
  }

  private saveToDisk(): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  // Conversation Methods
  getConversations(): Conversation[] {
    return Object.values(this.data.conversations).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getConversation(id: string): Conversation | null {
    return this.data.conversations[id] || null;
  }

  createConversation(title = 'New Voice Session'): Conversation {
    const id = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newConv: Conversation = {
      id,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    this.data.conversations[id] = newConv;
    this.saveToDisk();
    return newConv;
  }

  addMessage(conversationId: string, message: ChatMessage): void {
    if (!this.data.conversations[conversationId]) {
      this.createConversation('Session ' + new Date().toLocaleDateString());
    }
    const conv = this.data.conversations[conversationId];
    if (conv) {
      conv.messages.push(message);
      conv.updatedAt = new Date().toISOString();
      if (conv.messages.length === 1 && message.role === 'user') {
        conv.title = message.content.slice(0, 35) + (message.content.length > 35 ? '...' : '');
      }
      this.saveToDisk();
    }
  }

  clearConversation(id: string): boolean {
    if (this.data.conversations[id]) {
      this.data.conversations[id].messages = [];
      this.data.conversations[id].updatedAt = new Date().toISOString();
      this.saveToDisk();
      return true;
    }
    return false;
  }

  deleteConversation(id: string): boolean {
    if (this.data.conversations[id]) {
      delete this.data.conversations[id];
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // Notes Methods
  getNotes(): NoteItem[] {
    return Object.values(this.data.notes).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createNote(title: string, body: string, tags: string[] = []): NoteItem {
    const id = `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const note: NoteItem = {
      id,
      title: title || 'Untitled Note',
      body,
      tags: tags.length ? tags : ['General'],
      createdAt: new Date().toISOString(),
    };
    this.data.notes[id] = note;
    this.saveToDisk();
    return note;
  }

  searchNotes(query: string): NoteItem[] {
    const q = query.toLowerCase();
    return this.getNotes().filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  deleteNote(id: string): boolean {
    if (this.data.notes[id]) {
      delete this.data.notes[id];
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // Tasks & Reminders
  getTasks(): TaskItem[] {
    return Object.values(this.data.tasks).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createTask(task: string, dueTime?: string): TaskItem {
    const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTask: TaskItem = {
      id,
      task,
      status: 'pending',
      dueTime: dueTime || new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.data.tasks[id] = newTask;
    this.saveToDisk();
    return newTask;
  }

  updateTaskStatus(id: string, status: 'pending' | 'completed'): TaskItem | null {
    if (this.data.tasks[id]) {
      this.data.tasks[id].status = status;
      this.saveToDisk();
      return this.data.tasks[id];
    }
    return null;
  }

  deleteTask(id: string): boolean {
    if (this.data.tasks[id]) {
      delete this.data.tasks[id];
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // Key-Value Memories
  getMemories(): MemoryItem[] {
    return Object.values(this.data.memories).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  setMemory(key: string, value: string, category = 'general'): MemoryItem {
    const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
    const existing = Object.values(this.data.memories).find((m) => m.key.toLowerCase() === normalizedKey);
    const id = existing ? existing.id : `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const mem: MemoryItem = {
      id,
      key: normalizedKey,
      value,
      category,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.memories[id] = mem;
    this.saveToDisk();
    return mem;
  }

  getMemoryByKey(key: string): MemoryItem | null {
    const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
    return (
      Object.values(this.data.memories).find(
        (m) => m.key.toLowerCase() === normalizedKey || m.key.toLowerCase().includes(normalizedKey)
      ) || null
    );
  }

  deleteMemory(id: string): boolean {
    if (this.data.memories[id]) {
      delete this.data.memories[id];
      this.saveToDisk();
      return true;
    }
    return false;
  }

  clearAllMemories(): void {
    this.data.memories = {};
    this.saveToDisk();
  }

  // Training Examples (Few-Shot In-Context Training)
  getTrainingExamples(): TrainingExample[] {
    return Object.values(this.data.trainingExamples).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createTrainingExample(input: string, output: string, category = 'General'): TrainingExample {
    const id = `train-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const example: TrainingExample = {
      id,
      input,
      output,
      category,
      createdAt: new Date().toISOString(),
      active: true,
    };
    this.data.trainingExamples[id] = example;
    this.saveToDisk();
    return example;
  }

  toggleTrainingExample(id: string, active: boolean): boolean {
    if (this.data.trainingExamples[id]) {
      this.data.trainingExamples[id].active = active;
      this.saveToDisk();
      return true;
    }
    return false;
  }

  deleteTrainingExample(id: string): boolean {
    if (this.data.trainingExamples[id]) {
      delete this.data.trainingExamples[id];
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // Knowledge Directives
  getKnowledgeDirectives(): KnowledgeDirective[] {
    return Object.values(this.data.knowledgeDirectives).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createKnowledgeDirective(title: string, content: string): KnowledgeDirective {
    const id = `know-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const directive: KnowledgeDirective = {
      id,
      title,
      content,
      createdAt: new Date().toISOString(),
      active: true,
    };
    this.data.knowledgeDirectives[id] = directive;
    this.saveToDisk();
    return directive;
  }

  toggleKnowledgeDirective(id: string, active: boolean): boolean {
    if (this.data.knowledgeDirectives[id]) {
      this.data.knowledgeDirectives[id].active = active;
      this.saveToDisk();
      return true;
    }
    return false;
  }

  deleteKnowledgeDirective(id: string): boolean {
    if (this.data.knowledgeDirectives[id]) {
      delete this.data.knowledgeDirectives[id];
      this.saveToDisk();
      return true;
    }
    return false;
  }
}

export const db = new LocalDatabase();
