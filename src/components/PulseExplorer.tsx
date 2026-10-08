import React, { useState } from 'react';
import { NEIGHBORHOODS, NYC_IMAGE_ASSETS } from '../data/nycData';
import { Neighborhood, LanguageCode } from '../types';
import { Search, Volume2, Bookmark, BookmarkCheck, ArrowRight, Compass, Sparkles, Train, AlertCircle } from 'lucide-react';
import { speechService } from '../services/api';

interface PulseExplorerProps {
  selectedLanguage: LanguageCode;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onSelectNeighborhood: (n: Neighborhood) => void;
  onAskAI: (query: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const PulseExplorer: React.FC<PulseExplorerProps> = ({
  selectedLanguage,
  savedIds,
  onToggleSave,
  onSelectNeighborhood,
  onAskAI,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBorough, setSelectedBorough] = useState<string>('All');
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [speechWarning, setSpeechWarning] = useState<string | null>(null);

  const boroughs = ['All', 'Manhattan', 'Brooklyn'];

  const filteredNeighborhoods = NEIGHBORHOODS.filter((n) => {
    const matchesBorough = selectedBorough === 'All' || n.borough === selectedBorough;
    const desc = n.description[selectedLanguage] || n.description.en;
    const tag = n.tagline[selectedLanguage] || n.tagline.en;
    const matchesSearch =
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.vibeTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBorough && matchesSearch;
  });

  const handlePlayAudio = (e: React.MouseEvent, n: Neighborhood) => {
    e.stopPropagation();
    setSpeechWarning(null);

    if (activeAudioId === n.id) {
      speechService.stop();
      setActiveAudioId(null);
    } else {
      setActiveAudioId(n.id);
      const text = n.audioScript[selectedLanguage] || n.audioScript.en;
      speechService.speak(text, selectedLanguage, {
        onEnd: () => setActiveAudioId(null),
        onVoiceUnavailable: (msg) => {
          setActiveAudioId(null);
          setSpeechWarning(msg);
        },
      });
    }
  };

  const texts = {
    en: {
      heroTag: 'NYC Live Pulse Companion',
      heroSubTag: 'English · Hindi · Telugu Support',
      heroTitle: 'Navigate New York with the Kinetic Rhythm of a True Local',
      heroDesc: 'Real-time subway pulses, unboxed neighborhood intelligence, and a multilingual AI companion decanting 8.4 million stories across 5 boroughs.',
      searchPlaceholder: 'Search neighborhoods, jazz spots, dumplings, or subway lines...',
      pulseHeading: 'Curated Neighborhood Pulses',
      pulseSub: 'Select any district for audio narratives, nearest transit lines, and authentic customs.',
      quickPulses: ['Cast-Iron Architecture', 'Brooklyn Skyline', 'The High Line', 'Joe’s Pizza'],
      exploreGuide: 'Explore guide',
      subwayBox: 'Kinetic Transit Navigator',
      subwayDesc: 'Calculate subway routes, local vs. express trains, and OMNY tap-to-pay flat fares.',
      routesBox: 'Curated Day Itineraries',
      routesDesc: 'Step-by-step kinetic routes with walking minutes, view spots, and structured plans.',
      aiBox: 'Multilingual Companion',
      aiDesc: 'Ask in English, Hindi, or Telugu to edit itineraries or order food like a local.',
    },
    hi: {
      heroTag: 'न्यूयॉर्क लाइव पल्स साथी',
      heroSubTag: 'अंग्रेजी · हिन्दी · तेलुगु समर्थन',
      heroTitle: 'स्थानीय निवासी की तरह आत्मविश्वास से घूमें न्यूयॉर्क',
      heroDesc: 'सटीक सबवे दिशा-निर्देश, 5 नगरों (Boroughs) की खूबसूरत गलियां, और आपकी अपनी भाषा में AI साथी।',
      searchPlaceholder: 'इलाके, घूमने की जगह, पिज़्ज़ा या सबवे लाइन खोजें...',
      pulseHeading: 'प्रमुख इलाकों की रूपरेखा',
      pulseSub: 'ऑडियो गाइड, सबवे स्टेशन और स्थानीय भोजन की जानकारी के लिए किसी भी कार्ड पर क्लिक करें।',
      quickPulses: ['ऐतिहासिक इमारतें', 'ब्रुकलिन स्काईलाइन', 'हाई लाइन पार्क', 'न्यूयॉर्क पिज़्ज़ा'],
      exploreGuide: 'विस्तार से देखें',
      subwayBox: 'सबवे और मेट्रो नेविगेटर',
      subwayDesc: 'सबवे रूट, एक्सप्रेस ट्रेन और OMNY से $2.90 में आसान यात्रा का तरीका।',
      routesBox: 'दैनिक यात्रा योजनाएं',
      routesDesc: 'पैदल चलने के रास्ते, खूबसूरत नज़ारे और पूरी तरह तैयार यात्रा कार्यक्रम।',
      aiBox: 'बहुभाषी AI साथी',
      aiDesc: 'हिन्दी, अंग्रेजी या तेलुगु में सवाल पूछें और अपनी योजना तुरंत बदलें।',
    },
    te: {
      heroTag: 'న్యూయార్క్ లైవ్ పల్స్ గైడ్',
      heroSubTag: 'ఇంగ్లీష్ · హిందీ · తెలుగు సపోర్ట్',
      heroTitle: 'స్థానిక న్యూయార్కర్‌లా నగరంలో ఆత్మవిశ్వాసంతో తిరగండి',
      heroDesc: 'నిజమైన సబ్‌వే సమాచారం, సుందరమైన పరిసరాలు, మరియు మీ సొంత భాషలో సహాయపడే AI గైడ్.',
      searchPlaceholder: 'ప్రాంతాలు, ప్రసిద్ధ ప్రదేశాలు, పిజ్జా లేదా సబ్‌వే లైన్లు శోధించండి...',
      pulseHeading: 'ప్రధాన నగర ప్రాంతాలు',
      pulseSub: 'ఆడియో వివరాలు, సమీప సబ్‌వే స్టేషన్లు మరియు ఆహార చిట్కాల కోసం కార్డును ఎంచుకోండి.',
      quickPulses: ['చారిత్రక భవనాలు', 'బ్రూక్లిన్ స్కైలైన్', 'హై లైన్ పార్క్', 'న్యూయార్క్ పిజ్జా'],
      exploreGuide: 'పూర్తి వివరాలు',
      subwayBox: 'సబ్‌వే & రవాణా గైడ్',
      subwayDesc: 'సబ్‌వే మార్గాలు, ఎక్స్‌ప్రెస్ రైళ్ళు మరియు OMNY $2.90 ట్యాప్-టు-పే సమాచారం.',
      routesBox: 'టూర్ ప్లాన్స్ & మార్గాలు',
      routesDesc: 'కాలినడకన తిరిగే మార్గాలు, వీక్షణ స్థలాలు మరియు పక్కా ప్లానింగ్.',
      aiBox: 'బహుభాషా AI గైడ్',
      aiDesc: 'తెలుగు, హిందీ లేదా ఇంగ్లీషులో ప్రశ్నలు అడగండి మరియు ప్లాన్ మార్చుకోండి.',
    },
  }[selectedLanguage];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden shadow-lg border border-outline-variant/30 bg-primary">
        <div className="relative h-80 sm:h-96 w-full">
          <img
            src={NYC_IMAGE_ASSETS.hero}
            alt="New York City skyline and Manhattan Bridge at dusk"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/70 to-primary/25" />

          {/* Hero Content */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-container mb-2">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
              <span>{texts.heroTag}</span>
              <span aria-hidden="true">·</span>
              <span>{texts.heroSubTag}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white max-w-2xl text-balance">
              {texts.heroTitle}
            </h1>

            <p className="mt-3 text-xs sm:text-base text-surface-container-high max-w-xl leading-relaxed">
              {texts.heroDesc}
            </p>

            {/* Live Ticker bar */}
            <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center gap-4 sm:gap-8 text-xs text-surface-container-high font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-white font-medium">Subway Flow:</span>
                <span className="text-emerald-300 tabular-nums">94.8% Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Weather:</span>
                <span className="text-surface-container tabular-nums">68°F / 20°C Mild</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">OMNY Fare:</span>
                <span className="text-secondary-container tabular-nums">$2.90 Flat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Warning */}
      {speechWarning && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{speechWarning}</span>
          </div>
          <button
            onClick={() => setSpeechWarning(null)}
            className="text-amber-800 font-semibold underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={texts.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/60 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center p-1 bg-surface-container rounded-lg border border-outline-variant/30 self-start sm:self-auto">
            {boroughs.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBorough(b)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedBorough === b
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {b === 'All' ? 'All Boroughs' : b}
              </button>
            ))}
          </div>
        </div>

        {/* Quick pulses */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-on-surface-variant">
          <span className="font-semibold text-primary">Quick pulses:</span>
          {texts.quickPulses.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors text-xs font-medium"
            >
              {tag}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-primary underline ml-1 font-medium"
            >
              Clear filter
            </button>
          )}
        </div>
      </section>

      {/* Neighborhood Grid */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-primary">
              {texts.pulseHeading}
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              {texts.pulseSub}
            </p>
          </div>
          <span className="text-xs font-mono text-on-surface-variant tabular-nums">
            {filteredNeighborhoods.length} districts active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNeighborhoods.map((n) => {
            const isSaved = savedIds.includes(n.id);
            const isPlaying = activeAudioId === n.id;

            return (
              <article
                key={n.id}
                onClick={() => onSelectNeighborhood(n)}
                className="group cursor-pointer rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Photo frame */}
                <div className="relative h-52 w-full overflow-hidden bg-surface-container">
                  <img
                    src={n.image}
                    alt={n.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-80" />

                  {/* Top action row */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-1 rounded-md">
                      <Train className="w-3.5 h-3.5 text-secondary-container mr-1" />
                      {n.transitLines.slice(0, 4).map((line) => (
                        <span
                          key={line}
                          className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center font-mono shadow-xs"
                        >
                          {line}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(n.id);
                      }}
                      className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
                      aria-label="Save neighborhood"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-secondary-container fill-secondary-container" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <div className="text-xs font-semibold text-secondary-container uppercase tracking-wide">
                      {n.borough}
                    </div>
                    <h3 className="text-xl font-bold font-display text-white group-hover:text-secondary-container transition-colors">
                      {n.name}
                    </h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                      <span>{n.nearestStation}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{n.walkMinutes} min walk</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-primary font-semibold">{n.crowdLevel} Flow</span>
                    </div>

                    <p className="mt-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed line-clamp-2">
                      {n.description[selectedLanguage] || n.description.en}
                    </p>
                  </div>

                  {/* Highlights and audio trigger */}
                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => handlePlayAudio(e, n)}
                      className={`flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-md transition-colors ${
                        isPlaying
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'text-primary hover:bg-surface-container'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlaying ? 'Pause' : n.audioGuideDuration}</span>
                    </button>

                    <span className="inline-flex items-center gap-1 text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
                      {texts.exploreGuide} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Bento Grid Action Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center">
              <Train className="w-5 h-5 text-secondary-container" />
            </div>
            <h3 className="text-base font-bold font-display text-primary">
              {texts.subwayBox}
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {texts.subwayDesc}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('transit')}
            className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline pt-2 text-left"
          >
            Open subway map & planner <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-white flex items-center justify-center">
              <Compass className="w-5 h-5 text-secondary-container" />
            </div>
            <h3 className="text-base font-bold font-display text-primary">
              {texts.routesBox}
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {texts.routesDesc}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('routes')}
            className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline pt-2 text-left"
          >
            View structured itineraries <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6 rounded-xl bg-primary text-white space-y-3 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-secondary-container" />
            </div>
            <h3 className="text-base font-bold font-display text-white">
              {texts.aiBox}
            </h3>
            <p className="text-xs text-surface-container-high leading-relaxed">
              {texts.aiDesc}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('companion')}
            className="text-xs font-semibold text-secondary-container flex items-center gap-1 hover:underline pt-2 text-left"
          >
            Open voice & chat companion <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
