import React, { useState, useEffect } from 'react';
import greenSpiky from '../assets/metups-characters/Green spiky.png';
import blob from '../assets/metups-characters/blob.png';
import flow from '../assets/metups-characters/flow.png';
import ghoast from '../assets/metups-characters/ghoast.png';
import hot from '../assets/metups-characters/hot.png';
import pokoe from '../assets/metups-characters/pokoe.png';
import purppler from '../assets/metups-characters/purppler.png';
import sloopy from '../assets/metups-characters/sloopy.png';
import star from '../assets/metups-characters/star.png';

const CHARACTERS = [
  {
    id: 'green-spiky',
    name: 'Spiky',
    title: 'The Tech Debater',
    img: greenSpiky,
    desc: 'Never accepts default settings. Thrives on heated compiler discussions, dark mode debates, and architectural arguments.',
    match: 'Tech Meetups & Coding Hackathons',
    color: 'bg-[#E5ECE9] text-[#1F5C55]',
    borderColor: 'border-[#1F5C55]'
  },
  {
    id: 'blob',
    name: 'Blob',
    title: 'The Quiet Committer',
    img: blob,
    desc: 'Prefers typing to talking. Expresses deep complex emotions purely through git commits and pull request descriptions.',
    match: 'Silent Co-working & Coffee Shop Code Sessions',
    color: 'bg-[#EAE6F0] text-[#552A80]',
    borderColor: 'border-[#552A80]'
  },
  {
    id: 'flow',
    name: 'Flow',
    title: 'The Cardio Runner',
    img: flow,
    desc: 'Thinks best at 160 BPM. Believes the absolute best form of technical networking is a fast-paced 5K run in the park.',
    match: 'Outdoor Running & Active Fitness Meetups',
    color: 'bg-[#F9EDE2] text-[#8C4B18]',
    borderColor: 'border-[#8C4B18]'
  },
  {
    id: 'ghoast',
    name: 'Lurker',
    title: 'The Silent Observer',
    img: ghoast,
    desc: 'Stays in the background but sees everything. Rarely RSVPs, but always shows up at the last second and leaves quietly.',
    match: 'Late Night Discussions & Casual Meetups',
    color: 'bg-[#EBEBE8] text-[#4F524A]',
    borderColor: 'border-[#4F524A]'
  },
  {
    id: 'hot',
    name: 'Burner',
    title: 'The Idea Catalyst',
    img: hot,
    desc: 'A fireball of raw energy. Starts three side projects a week and abandons them all by Sunday afternoon.',
    match: 'Startup Pitches & Rapid Brainstorming Sessions',
    color: 'bg-[#FCEAE8] text-[#B23A2E]',
    borderColor: 'border-[#B23A2E]'
  },
  {
    id: 'pokoe',
    name: 'Poko',
    title: 'The UI Connoisseur',
    img: pokoe,
    desc: 'Obsessed with kerning and micro-interactions. Refuses to use any web application that has a browser default shadow.',
    match: 'Design Showcases & Frontend Critiques',
    color: 'bg-[#FAF6DF] text-[#7F6E1C]',
    borderColor: 'border-[#7F6E1C]'
  },
  {
    id: 'purppler',
    name: 'Purppler',
    title: 'The Social Bridge',
    img: purppler,
    desc: 'Knows everyone in the room within 5 minutes. Spends their time connecting developers with founders.',
    match: 'Social Mixers & Networking Cocktails',
    color: 'bg-[#ECE5FA] text-[#4C1F8C]',
    borderColor: 'border-[#4C1F8C]'
  },
  {
    id: 'sloopy',
    name: 'Sloopy',
    title: 'The Gourmet Coder',
    img: sloopy,
    desc: 'Only attends meetups if there is free artisanal food. Measures event success by the quality of the snacks.',
    match: 'Food Crawls & Dinner Mixers',
    color: 'bg-[#FDF2E2] text-[#80501F]',
    borderColor: 'border-[#80501F]'
  },
  {
    id: 'star',
    name: 'Star',
    title: 'The Chief Host',
    img: star,
    desc: 'The master of ceremonies. Loves organizing schedules, printing clean name tags, and making speakers feel welcome.',
    match: 'Panel Discussions & Main Stages',
    color: 'bg-[#FBF4E4] text-[#E1A83D]',
    borderColor: 'border-[#E1A83D]'
  }
];

const HERO_QUOTES = [
  "MEET\nOUTSIDE.",
  "REAL-TIME\nCOUNTERS.",
  "ASYNC\nPIPELINES.",
  "DECOUPLED\nDOMAINS.",
  "SYNC BY\ngRPC."
];

export default function LandingPage({ onExplore, onAuth }) {
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % HERO_QUOTES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans selection:bg-[var(--color-signal-dim)] selection:text-[var(--color-ink)]">
      
      {/* Top Banner (Editorial Grid Style) */}
      <header className="border-b-4 border-[var(--color-ink)] grid grid-cols-1 md:grid-cols-3 text-center md:text-left">
        <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 border-[var(--color-ink)] flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">ISSUE NO. 02 // VOL. 2026</span>
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">EDITION: ALIVE</span>
        </div>
        <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 border-[var(--color-ink)] flex items-center justify-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">MetUps</h1>
        </div>
        <div className="p-6 flex items-center justify-center md:justify-end space-x-6">
          <button 
            onClick={onExplore}
            className="font-mono text-sm font-bold uppercase tracking-wider hover:text-[var(--color-alert)] transition-colors cursor-pointer"
          >
            Explore Events
          </button>
          <button 
            onClick={onAuth}
            className="px-4 py-2 border-2 border-[var(--color-ink)] bg-[var(--color-paper-alt)] font-mono text-sm font-bold uppercase tracking-wider hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] transition-all duration-150 cursor-pointer"
          >
            Sign In / Join
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 border-b-4 border-[var(--color-ink)]">
        
        {/* Left Column: Heading and Taglines */}
        <div className="lg:col-span-8 p-8 md:p-12 lg:p-16 border-b-2 lg:border-b-0 lg:border-r-4 border-[var(--color-ink)] flex flex-col justify-between">
          <div>
            <div className="inline-block border-2 border-[var(--color-ink)] px-3 py-1 font-mono text-xs uppercase tracking-widest bg-[var(--color-signal-dim)] mb-8">
              THE ANTI-ALGORITHMIC NETWORK
            </div>
            <h2 className="font-display text-6xl md:text-8xl lg:text-9xl font-extrabold leading-none tracking-tighter mb-8 whitespace-pre-line min-h-[140px] md:min-h-[220px] lg:min-h-[260px]">
              {HERO_QUOTES[quoteIndex]}
            </h2>
            <p className="font-display text-2xl md:text-3xl lg:text-4xl text-[var(--color-ink-muted)] max-w-2xl leading-relaxed mb-12">
              No infinite scrolls. No artificial engagement algorithms. Just real physical space with makers, developers, and creators who exist in three dimensions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-2 border-[var(--color-ink)] pt-8">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)] mb-2">01 / REAL-TIME BROADCASTING</h4>
              <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">
                Our WebSocket-powered engine delivers live event capacities and participant updates instantly without manual page refreshes.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)] mb-2">02 / INTER-SERVICE EFFICIENCY</h4>
              <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">
                Distributed microservices synced via gRPC servers and RabbitMQ event pipelines ensure sub-millisecond reliability.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Block */}
        <div className="lg:col-span-4 bg-[var(--color-paper-alt)] flex flex-col justify-between p-8 md:p-12 relative overflow-hidden">
          {/* Decorative grid overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-ink) 2px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">SYSTEM OVERVIEW</span>
            <div className="border-b border-[var(--color-ink)] my-4"></div>
          </div>

          {/* Centered character hero illustration */}
          <div className="my-12 flex justify-center items-center relative z-10">
            <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center p-6 border-4 border-[var(--color-ink)] bg-[var(--color-paper)] rotate-[-2deg] hover:rotate-[0deg] transition-all duration-300">
              <img 
                src={selectedChar.img} 
                alt={selectedChar.name} 
                className="max-w-full max-h-full object-contain animate-fadeIn filter drop-shadow-[4px_4px_0px_var(--color-ink)]"
              />
            </div>
          </div>

          <div className="relative z-10">
            <div className="border-t border-[var(--color-ink)] my-4"></div>
            <div className="flex flex-col space-y-4">
              <button 
                onClick={onExplore}
                className="w-full py-4 border-2 border-[var(--color-ink)] bg-[var(--color-signal)] text-[var(--color-ink)] font-mono font-bold uppercase tracking-wider hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:translate-y-[-2px] active:translate-y-[0px] transition-all cursor-pointer text-center"
              >
                Enter System
              </button>
              <button 
                onClick={onAuth}
                className="w-full py-4 border-2 border-[var(--color-ink)] bg-[var(--color-paper)] text-[var(--color-ink)] font-mono font-bold uppercase tracking-wider hover:bg-[var(--color-paper-alt)] hover:translate-y-[-2px] active:translate-y-[0px] transition-all cursor-pointer text-center"
              >
                Claim Persona
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Concept & Objective (New Section matching Doc) */}
      <section className="border-b-4 border-[var(--color-ink)] p-8 md:p-16 lg:p-24 bg-[var(--color-paper-alt)]">
        <div className="max-w-5xl mx-auto text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">THE LEARNING VEHICLE CONCEPT</span>
          <h3 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mt-4 mb-8">
            The microservice architecture is the actual product.
          </h3>
          <p className="font-sans text-base md:text-lg text-[var(--color-ink-muted)] leading-relaxed max-w-3xl mx-auto mb-12">
            MetUps is built as an educational blueprint. The "product" is deliberately simple—letting users create and RSVP to events—so that the underlying architectural logic remains the real focus. The platform validates boundaries, processes distributed states, and manages cache synchronizations under composed container networks.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16">
            <div className="p-6 border-2 border-[var(--color-ink)] bg-[var(--color-paper)]">
              <span className="font-mono text-2xs uppercase tracking-wider text-[var(--color-alert)] font-bold">NO CROSS-BOUNDARIES DATABASE SHARES</span>
              <h4 className="font-display text-xl font-bold mt-2 mb-3">Database Isolation</h4>
              <p className="text-xs leading-relaxed text-[var(--color-ink-muted)] font-sans">
                Each service owns its own database with no foreign keys. References are processed and verified strictly via IDs and inter-service channels.
              </p>
            </div>
            <div className="p-6 border-2 border-[var(--color-ink)] bg-[var(--color-paper)]">
              <span className="font-mono text-2xs uppercase tracking-wider text-[var(--color-presence)] font-bold">HYBRID PROTOCOLS MATRIX</span>
              <h4 className="font-display text-xl font-bold mt-2 mb-3">Sync gRPC & Async Message Queue</h4>
              <p className="text-xs leading-relaxed text-[var(--color-ink-muted)] font-sans">
                Synchronous gRPC handles blocking inquiries (VerifyToken, CheckCapacity) instantly. RabbitMQ brokers decoupled event notifications asynchronously.
              </p>
            </div>
            <div className="p-6 border-2 border-[var(--color-ink)] bg-[var(--color-paper)]">
              <span className="font-mono text-2xs uppercase tracking-wider text-[var(--color-signal)] font-bold">SINGLE ENTRY TOPOLOGY</span>
              <h4 className="font-display text-xl font-bold mt-2 mb-3">Nginx reverse gateway</h4>
              <p className="text-xs leading-relaxed text-[var(--color-ink-muted)] font-sans">
                The frontend client routes traffic strictly through Nginx (port 80). Nginx proxies incoming calls to containers dynamically by path prefix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Section: Choose your Persona */}
      <section className="border-b-4 border-[var(--color-ink)] p-8 md:p-16 lg:p-24 bg-[var(--color-paper)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center md:text-left">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">THE ATTENDEE REGISTRY</span>
            <h3 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mt-2 mb-4">
              Who are you meeting outside?
            </h3>
            <p className="text-[var(--color-ink-muted)] max-w-xl">
              Meetups draw all kinds of developers, designers, and makers. Click a character below to preview your matched meetup style.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left side: Character Selection Grid */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-4">
              {CHARACTERS.map((char) => {
                const isSelected = char.id === selectedChar.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedChar(char)}
                    className={`p-4 border-2 border-[var(--color-ink)] transition-all flex flex-col items-center justify-center cursor-pointer ${
                      isSelected 
                        ? 'bg-[var(--color-signal-dim)] scale-[1.03] rotate-[1deg]' 
                        : 'bg-[var(--color-paper-alt)] hover:bg-[var(--color-paper)] hover:scale-[1.01]'
                    }`}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-2">
                      <img 
                        src={char.img} 
                        alt={char.name} 
                        className="max-w-full max-h-full object-contain filter drop-shadow-[2px_2px_0px_var(--color-ink)]"
                      />
                    </div>
                    <span className="font-mono text-2xs uppercase tracking-wide font-extrabold">{char.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Right side: Character Details and Matchmaking */}
            <div className="lg:col-span-5 border-4 border-[var(--color-ink)] p-8 bg-[var(--color-paper-alt)] relative">
              <div className="absolute top-4 right-4 font-mono text-2xs uppercase tracking-wider text-[var(--color-ink-muted)]">
                MATCH: 99.8%
              </div>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className={`w-24 h-24 border-2 border-[var(--color-ink)] flex items-center justify-center p-2 bg-[var(--color-paper)]`}>
                  <img 
                    src={selectedChar.img} 
                    alt={selectedChar.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-display text-2xl font-bold tracking-tight">{selectedChar.name}</h4>
                  <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">{selectedChar.title}</span>
                </div>
              </div>

              <div className="border-b border-[var(--color-ink)] my-6"></div>

              <div className="space-y-6">
                <div>
                  <h5 className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)] mb-2">BEHAVIORAL SPECS</h5>
                  <p className="text-sm leading-relaxed text-[var(--color-ink)]">
                    {selectedChar.desc}
                  </p>
                </div>

                <div className={`p-4 border-2 border-[var(--color-ink)] ${selectedChar.color} flex flex-col justify-between`}>
                  <div>
                    <h5 className="font-mono text-2xs uppercase tracking-widest opacity-80 mb-1">RECOMMENDED GATHERING</h5>
                    <p className="font-mono text-sm font-bold">
                      {selectedChar.match}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Flow & Tech Stack Sections (New Section matching Doc) */}
      <section className="border-b-4 border-[var(--color-ink)] grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Panel: End-to-End Workflow */}
        <div className="p-8 md:p-16 border-b-2 lg:border-b-0 lg:border-r-4 border-[var(--color-ink)] bg-[var(--color-paper)]">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">THE PROTOCOL WORKFLOW</span>
          <h3 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2 mb-10">
            How an RSVP travels through the system
          </h3>
          
          <div className="space-y-8 font-sans">
            <div className="flex items-start space-x-4">
              <span className="font-mono text-xs font-bold border-2 border-[var(--color-ink)] px-2 py-0.5 bg-[var(--color-paper-alt)]">1</span>
              <div>
                <h5 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-ink)]">User Action</h5>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">User clicks "Join Event" in React SPA. A REST request goes to `/api/rsvp/join` via the Nginx API gateway.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <span className="font-mono text-xs font-bold border-2 border-[var(--color-ink)] px-2 py-0.5 bg-[var(--color-paper-alt)]">2</span>
              <div>
                <h5 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-ink)]">gRPC Authentication (Sync)</h5>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">RSVP Service queries the Auth Service's gRPC server to verify the JWT credentials synchronously.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <span className="font-mono text-xs font-bold border-2 border-[var(--color-ink)] px-2 py-0.5 bg-[var(--color-paper-alt)]">3</span>
              <div>
                <h5 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-ink)]">gRPC Capacity Validation (Sync)</h5>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">RSVP Service queries the Event Service's gRPC server to verify that the event has remaining capacity spots.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <span className="font-mono text-xs font-bold border-2 border-[var(--color-ink)] px-2 py-0.5 bg-[var(--color-paper-alt)]">4</span>
              <div>
                <h5 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-ink)]">Message Broker Publish (Async)</h5>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">Once verified, the RSVP is saved. RSVP Service broadcasts a `user_joined_event` message to the RabbitMQ exchange.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <span className="font-mono text-xs font-bold border-2 border-[var(--color-ink)] px-2 py-0.5 bg-[var(--color-paper-alt)]">5</span>
              <div>
                <h5 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-ink)]">Bridge & Task Queueing</h5>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">The notification bridge daemon consumes the RabbitMQ message and dispatches an asynchronous background task to Celery.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <span className="font-mono text-xs font-bold border-2 border-[var(--color-ink)] px-2 py-0.5 bg-[var(--color-paper-alt)]">6</span>
              <div>
                <h5 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-ink)]">Broadcast & Email dispatch</h5>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">Celery processes the task, triggers a Gmail SMTP notification, and broadcasts a message to Redis Channels layers, pushing it to all WebSocket clients.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Tech Stack Specs */}
        <div className="p-8 md:p-16 bg-[var(--color-paper-alt)] flex flex-col justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">THE INFRASTRUCTURE DEEP DIVE</span>
            <h3 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2 mb-10">
              The technology stack
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-xs">
              <div className="border-2 border-[var(--color-ink)] p-4 bg-[var(--color-paper)]">
                <div className="font-bold uppercase tracking-wider text-[var(--color-alert)] mb-1">Backend Core</div>
                <div className="text-sm font-sans font-bold">Django / DRF</div>
                <p className="text-2xs font-sans text-[var(--color-ink-muted)] mt-1">Pythonic REST APIs and models powering the core backend applications.</p>
              </div>
              <div className="border-2 border-[var(--color-ink)] p-4 bg-[var(--color-paper)]">
                <div className="font-bold uppercase tracking-wider text-[var(--color-presence)] mb-1">Internal RPC</div>
                <div className="text-sm font-sans font-bold">gRPC / Protobuf</div>
                <p className="text-2xs font-sans text-[var(--color-ink-muted)] mt-1">Binary, low-latency RPC protocol using defined protobuf schemas.</p>
              </div>
              <div className="border-2 border-[var(--color-ink)] p-4 bg-[var(--color-paper)]">
                <div className="font-bold uppercase tracking-wider text-[var(--color-signal)] mb-1">Message Broker</div>
                <div className="text-sm font-sans font-bold">RabbitMQ</div>
                <p className="text-2xs font-sans text-[var(--color-ink-muted)] mt-1">Advanced Message Queuing Protocol (AMQP) for async event dispatches.</p>
              </div>
              <div className="border-2 border-[var(--color-ink)] p-4 bg-[var(--color-paper)]">
                <div className="font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">Task Manager</div>
                <div className="text-sm font-sans font-bold">Celery</div>
                <p className="text-2xs font-sans text-[var(--color-ink-muted)] mt-1">Distributed task manager to queue and execute background activities.</p>
              </div>
              <div className="border-2 border-[var(--color-ink)] p-4 bg-[var(--color-paper)]">
                <div className="font-bold uppercase tracking-wider text-[var(--color-presence)] mb-1">Real-time / Cache</div>
                <div className="text-sm font-sans font-bold">Redis / Channels</div>
                <p className="text-2xs font-sans text-[var(--color-ink-muted)] mt-1">Fast in-memory cache and WebSocket backplane core layer.</p>
              </div>
              <div className="border-2 border-[var(--color-ink)] p-4 bg-[var(--color-paper)]">
                <div className="font-bold uppercase tracking-wider text-[var(--color-alert)] mb-1">API Gateway</div>
                <div className="text-sm font-sans font-bold">Nginx Gateway</div>
                <p className="text-2xs font-sans text-[var(--color-ink-muted)] mt-1">Path-based reverse proxy serving as a single entry point for clients.</p>
              </div>
            </div>
          </div>

          <div className="border-2 border-[var(--color-ink)] p-6 bg-[var(--color-paper)] mt-12">
            <h5 className="font-mono text-xs uppercase tracking-wider font-bold">DECOUPLING RULES OF THUMB</h5>
            <div className="border-b border-[var(--color-ink)] my-3"></div>
            <p className="text-xs font-sans text-[var(--color-ink-muted)] leading-relaxed">
              Use **gRPC** when you need an immediate answer (blocking request) before proceeding. Use a **Message Queue (RabbitMQ)** when you just need to announce that something has occurred and then move on.
            </p>
          </div>
        </div>
      </section>

      {/* Infrastructure Summary Grid (Editorial Style) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b-4 border-[var(--color-ink)]">
        <div className="p-8 border-b-2 lg:border-b-0 md:border-r-2 border-[var(--color-ink)] flex flex-col justify-between min-h-64">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">REDIS / CACHING</span>
          <div>
            <h4 className="font-display text-2xl font-bold tracking-tight mb-2">Cached Event Streams</h4>
            <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
              Read event lists and specifications instantaneously. Custom invalidation triggers ensure you never view outdated schedules.
            </p>
          </div>
        </div>
        <div className="p-8 border-b-2 lg:border-b-0 lg:border-r-2 border-[var(--color-ink)] flex flex-col justify-between min-h-64">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">GRPC / AUTHORIZATION</span>
          <div>
            <h4 className="font-display text-2xl font-bold tracking-tight mb-2">Synchronous Token Security</h4>
            <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
              Lightweight, fast, and secure gRPC verification networks handle authentication directly between service nodes.
            </p>
          </div>
        </div>
        <div className="p-8 border-b-2 md:border-b-0 md:border-r-2 border-[var(--color-ink)] flex flex-col justify-between min-h-64">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">RABBITMQ / ASYNC</span>
          <div>
            <h4 className="font-display text-2xl font-bold tracking-tight mb-2">Event-Driven Pipelines</h4>
            <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
              Actions in the RSVP module generate async payloads dispatched to RabbitMQ, decoupling notifications from primary logic.
            </p>
          </div>
        </div>
        <div className="p-8 flex flex-col justify-between min-h-64">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">WEB_SOCKETS / DAPHNE</span>
          <div>
            <h4 className="font-display text-2xl font-bold tracking-tight mb-2">Live Live Broadcaster</h4>
            <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
              Daphne ASGI architecture pushes status changes and counter ticks to users in real time as they occur.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-8 md:p-12 bg-[var(--color-paper-alt)] grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
        <div>
          <h5 className="font-display text-xl font-extrabold mb-2">MetUps</h5>
          <p className="text-xs text-[var(--color-ink-muted)] max-w-sm leading-relaxed">
            A high-performance microservices application designed for humans who want to gather in physical coordinates.
          </p>
        </div>
        <div className="flex flex-col justify-between md:items-end">
          <span className="font-mono text-2xs uppercase tracking-widest text-[var(--color-ink-muted)]">
            VERSION 2.0.0 // PROTOCOL: COMPLETED
          </span>
          <span className="text-2xs text-[var(--color-ink-muted)] mt-4 md:mt-0">
            © 2026 MetUps. Designed in Neo-Brutalist Newspaper grids.
          </span>
        </div>
      </footer>

    </div>
  );
}
