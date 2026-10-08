import React, { useState } from 'react';
import { KINETIC_ROUTES } from '../data/nycData';
import { KineticRoute, LanguageCode, RouteStop, StructuredPlanItem } from '../types';
import { Compass, CheckCircle2, Clock, Footprints, Train, Volume2, Sparkles, Printer, DollarSign, Calendar } from 'lucide-react';
import { speechService } from '../services/api';

interface KineticRoutesProps {
  selectedLanguage: LanguageCode;
  onAskAI: (query: string) => void;
  structuredPlan: StructuredPlanItem[];
  onUpdatePlan: (newPlan: StructuredPlanItem[]) => void;
}

export const KineticRoutes: React.FC<KineticRoutesProps> = ({
  selectedLanguage,
  onAskAI,
  structuredPlan,
  onUpdatePlan,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(KINETIC_ROUTES[0].id);
  const [visitedStopIds, setVisitedStopIds] = useState<Record<string, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechWarning, setSpeechWarning] = useState<string | null>(null);

  const activeRoute = KINETIC_ROUTES.find((r) => r.id === selectedRouteId) || KINETIC_ROUTES[0];

  const toggleStopVisited = (stopId: string) => {
    setVisitedStopIds((prev) => ({
      ...prev,
      [stopId]: !prev[stopId],
    }));
  };

  const handlePlayAudioPrologue = () => {
    setSpeechWarning(null);
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const text = `${activeRoute.title[selectedLanguage]}. ${activeRoute.summary[selectedLanguage]}`;
      speechService.speak(text, selectedLanguage, {
        onEnd: () => setIsPlayingAudio(false),
        onVoiceUnavailable: (msg) => {
          setIsPlayingAudio(false);
          setSpeechWarning(msg);
        },
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const titles = {
    en: {
      header: 'Curated Kinetic Day Itineraries',
      sub: 'Tested, walking-first linear routes through New York’s most evocative neighborhoods. Built with optimized subway connections and authentic food breaks.',
      planTitle: 'Live Structured Itinerary Plan',
      planSub: 'Structured plan format with English JSON keys (day, time, place, description, cost). Descriptions reflect your selected language.',
      cheapCTA: 'Make Day 2 Cheaper via AI',
      askAI: 'Ask AI Companion to Customize',
    },
    hi: {
      header: 'तैयार की गई दैनिक यात्रा योजनाएं',
      sub: 'न्यूयॉर्क के प्रसिद्ध इलाकों में पैदल और सबवे से घूमने के लिए परखे गए मार्ग।',
      planTitle: 'लाइव संरचित यात्रा योजना (Structured Plan)',
      planSub: 'अंग्रेजी कीज़ (day, time, place, description, cost) के साथ संरचित योजना। विवरण आपकी चुनी हुई भाषा में है।',
      cheapCTA: 'AI से दिन 2 को सस्ता कराएं',
      askAI: 'AI साथी से बदलाव करवाएं',
    },
    te: {
      header: 'న్యూయార్క్ డైలీ టూర్ ప్లాన్స్',
      sub: 'మాన్‌హాటన్ మరియు బ్రూక్లిన్ పరిసరాలలో కాలినడకన మరియు సబ్‌వే ద్వారా సులభంగా తిరిగే మార్గాలు.',
      planTitle: 'లైవ్ స్ట్రక్చర్డ్ ఇటినెరరీ ప్లాన్ (Structured Plan)',
      planSub: 'ఇంగ్లీష్ కీస్ (day, time, place, description, cost) తో రూపొందించిన ప్లాన్. వివరాలు మీ ఎంపిక చేసుకున్న భాషలో ఉంటాయి.',
      cheapCTA: 'AI తో రోజు 2 చౌకగా చేయండి',
      askAI: 'AI గైడ్‌తో మార్పులు చేయండి',
    },
  }[selectedLanguage];

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-secondary-container" />
          <span>Curated Kinetic Journeys</span>
          <span aria-hidden="true">·</span>
          <span>English · हिन्दी · తెలుగు</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-primary tracking-tight">
          {titles.header}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          {titles.sub}
        </p>
      </div>

      {/* Voice Warning */}
      {speechWarning && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-xs">
          <span>{speechWarning}</span>
          <button
            onClick={() => setSpeechWarning(null)}
            className="text-amber-800 font-semibold underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Structured Plan Section (JSON Keys: day, time, place, description, cost) */}
      <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary-container" />
              <h2 className="text-lg font-bold font-display text-primary">
                {titles.planTitle}
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {titles.planSub}
            </p>
          </div>

          {/* Quick Chat Edit Trigger */}
          <button
            onClick={() => {
              const query =
                selectedLanguage === 'te'
                  ? 'రోజు 2 చౌకగా చేయండి'
                  : selectedLanguage === 'hi'
                  ? 'दिन 2 को सस्ता करें'
                  : 'Make day 2 cheaper';
              onAskAI(query);
            }}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-secondary-container text-on-secondary-container hover:opacity-90 transition-opacity flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{titles.cheapCTA}</span>
          </button>
        </div>

        {/* Structured Grid Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {structuredPlan.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col justify-between space-y-3"
            >
              <div>
                {/* JSON Keys display: day, time */}
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded">
                    day: {item.day}
                  </span>
                  <span className="text-on-surface-variant font-medium">
                    time: {item.time}
                  </span>
                </div>

                {/* place */}
                <h3 className="text-sm font-bold font-display text-primary mt-1">
                  {item.place}
                </h3>

                {/* description */}
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* cost */}
              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs font-mono">
                <span className="text-on-surface-variant text-[11px]">cost:</span>
                <span className="font-bold text-emerald-700">{item.cost}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Itinerary Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {KINETIC_ROUTES.map((route) => {
          const isSelected = route.id === selectedRouteId;
          return (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-primary/40'
              }`}
            >
              <div>
                <div
                  className={`text-xs font-mono font-medium ${
                    isSelected ? 'text-secondary-container' : 'text-on-surface-variant'
                  }`}
                >
                  {route.borough}
                </div>
                <h3
                  className={`text-base font-bold font-display mt-1 ${
                    isSelected ? 'text-white' : 'text-primary'
                  }`}
                >
                  {route.title[selectedLanguage]}
                </h3>
                <p
                  className={`text-xs mt-1.5 line-clamp-2 ${
                    isSelected ? 'text-surface-container-high' : 'text-on-surface-variant'
                  }`}
                >
                  {route.subheading[selectedLanguage]}
                </p>
              </div>

              <div
                className={`pt-3 border-t flex items-center justify-between text-xs font-mono tabular-nums ${
                  isSelected
                    ? 'border-white/15 text-surface-container-high'
                    : 'border-outline-variant/20 text-on-surface-variant'
                }`}
              >
                <span>{route.durationHours}</span>
                <span>{route.walkingMiles} miles walk</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Route Detail Panel */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 sm:p-8 space-y-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline-variant/20">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span className="w-2 h-2 rounded-full bg-secondary-container" />
              <span>{activeRoute.vibe}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary">
              {activeRoute.title[selectedLanguage]}
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {activeRoute.summary[selectedLanguage]}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handlePlayAudioPrologue}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${
                isPlayingAudio
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-primary text-white hover:bg-primary-container'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isPlayingAudio ? 'Stop Audio' : 'Play Audio Voice'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-md border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
              title="Print itinerary"
              aria-label="Print itinerary"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Waypoints Timeline */}
        <div className="space-y-6">
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/40">
            {activeRoute.stops.map((stop, idx) => {
              const isDone = visitedStopIds[stop.id] || false;

              return (
                <div key={stop.id} className="relative group">
                  <button
                    onClick={() => toggleStopVisited(stop.id)}
                    className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : 'bg-white border-2 border-primary text-primary hover:bg-surface-container'
                    }`}
                    title={isDone ? 'Mark unvisited' : 'Mark completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-[11px] font-bold font-mono">{idx + 1}</span>
                    )}
                  </button>

                  <div
                    className={`p-5 rounded-lg border transition-all ${
                      isDone
                        ? 'bg-surface-container-low/50 border-outline-variant/30 opacity-80'
                        : 'bg-white border-outline-variant/40 hover:border-primary/50 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-secondary-container bg-primary px-2 py-0.5 rounded-sm">
                          {stop.category}
                        </span>
                        <h4
                          className={`text-sm sm:text-base font-bold font-display ${
                            isDone ? 'line-through text-on-surface-variant' : 'text-primary'
                          }`}
                        >
                          {stop.place}
                        </h4>
                      </div>

                      <div className="text-xs font-mono text-on-surface-variant">
                        {stop.time} · {stop.cost}
                      </div>
                    </div>

                    <p className="text-xs text-on-surface leading-relaxed mt-1">
                      {stop.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-on-surface-variant flex items-center gap-1.5">
                        <Train className="w-3.5 h-3.5 text-primary" />
                        <span>Transit tip: {stop.transitTip}</span>
                      </div>

                      <div className="text-on-surface-variant font-mono text-[11px]">
                        {stop.address}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
