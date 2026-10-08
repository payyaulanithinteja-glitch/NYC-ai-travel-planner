import React, { useState } from 'react';
import { Neighborhood, LanguageCode } from '../types';
import { X, Volume2, VolumeX, Bookmark, BookmarkCheck, Navigation, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { speechService } from '../services/api';

interface NeighborhoodModalProps {
  neighborhood: Neighborhood | null;
  onClose: () => void;
  selectedLanguage: LanguageCode;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onAskAI: (query: string) => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (val: boolean) => void;
}

export const NeighborhoodModal: React.FC<NeighborhoodModalProps> = ({
  neighborhood,
  onClose,
  selectedLanguage,
  isSaved,
  onToggleSave,
  onAskAI,
  isPlayingAudio,
  setIsPlayingAudio,
}) => {
  const [speechWarning, setSpeechWarning] = useState<string | null>(null);

  if (!neighborhood) return null;

  const audioText = neighborhood.audioScript[selectedLanguage] || neighborhood.audioScript.en;

  const handleToggleAudio = () => {
    setSpeechWarning(null);
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speechService.speak(audioText, selectedLanguage, {
        onEnd: () => setIsPlayingAudio(false),
        onVoiceUnavailable: (msg) => {
          setIsPlayingAudio(false);
          setSpeechWarning(msg);
        },
      });
    }
  };

  const labels = {
    en: {
      audioTitle: 'Multilingual Audio Narration',
      listen: 'Listen Voice',
      pause: 'Pause Audio',
      profile: 'Urban Kinetic Profile',
      transit: 'Transit Connection',
      timing: 'Optimal Timing',
      stops: 'Key Stops & Walkable Landmarks',
      food: 'Local Food Tip',
      bookmark: 'Bookmark Spot',
      saved: 'Saved to Pocket',
      askAI: 'Ask AI About This Area',
    },
    hi: {
      audioTitle: 'ऑडियो गाइड (Voice Narration)',
      listen: 'आवाज़ में सुनें',
      pause: 'रोकें (Pause)',
      profile: 'इलाके की रूपरेखा',
      transit: 'सबवे और मेट्रो लाइन',
      timing: 'घूमने का सबसे अच्छा समय',
      stops: 'प्रमुख दर्शनीय स्थल',
      food: 'प्रसिद्ध स्थानीय भोजन',
      bookmark: 'बुकमार्क करें',
      saved: 'सेव किया गया',
      askAI: 'AI साथी से इसके बारे में पूछें',
    },
    te: {
      audioTitle: 'ఆడియో గైడ్ (Voice Narration)',
      listen: 'ఆడియో వినండి',
      pause: 'ఆపండి (Pause)',
      profile: 'ప్రాంత వివరాలు',
      transit: 'రవాణా & సబ్‌వే రూట్',
      timing: 'సందర్శించడానికి ఉత్తమ సమయం',
      stops: 'ముఖ్యమైన ప్రదేశాలు',
      food: 'స్థానిక ఆహార చిట్కా',
      bookmark: 'బుక్‌మార్క్ చేయండి',
      saved: 'సేవ్ చేయబడింది',
      askAI: 'AI ని దీని గురించి అడగండి',
    },
  }[selectedLanguage];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-surface rounded-xl max-w-2xl w-full border border-outline-variant/40 shadow-2xl overflow-hidden my-8">
        {/* Header photo banner */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-primary-container">
          <img
            src={neighborhood.image}
            alt={neighborhood.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={() => {
              if (isPlayingAudio) {
                speechService.stop();
                setIsPlayingAudio(false);
              }
              onClose();
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner text */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="text-xs uppercase tracking-wider text-secondary-container font-semibold mb-1">
              {neighborhood.borough} · {neighborhood.crowdLevel} Flow
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              {neighborhood.name}
            </h2>
            <p className="text-xs sm:text-sm text-surface-container-high mt-1 max-w-lg">
              {neighborhood.tagline[selectedLanguage]}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Warning banner */}
          {speechWarning && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
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

          {/* Audio narration bar */}
          <div className="p-4 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-secondary-container fill-secondary-container" />
                {labels.audioTitle}
              </div>
              <div className="text-xs text-on-surface-variant mt-0.5">
                Narrated in your selected language ({selectedLanguage.toUpperCase()}) · {neighborhood.audioGuideDuration}
              </div>
            </div>
            <button
              onClick={handleToggleAudio}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 shrink-0 ${
                isPlayingAudio
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>{labels.pause}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{labels.listen}</span>
                </>
              )}
            </button>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              {labels.profile}
            </h4>
            <p className="text-sm text-on-surface leading-relaxed">
              {neighborhood.description[selectedLanguage]}
            </p>
          </div>

          {/* Transit & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
            <div>
              <div className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5 mb-1.5">
                <Navigation className="w-3.5 h-3.5 text-primary" />
                {labels.transit}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {neighborhood.transitLines.map((line) => (
                  <span
                    key={line}
                    className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center font-mono shadow-xs"
                  >
                    {line}
                  </span>
                ))}
                <span className="text-xs text-on-surface ml-1 font-medium">
                  {neighborhood.nearestStation}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {labels.timing}
              </div>
              <p className="text-xs text-on-surface">
                {neighborhood.bestTime[selectedLanguage]}
              </p>
            </div>
          </div>

          {/* Curated Highlights */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2.5">
              {labels.stops}
            </h4>
            <ul className="space-y-2">
              {(neighborhood.highlights[selectedLanguage] || neighborhood.highlights.en).map((h, i) => (
                <li key={i} className="text-xs text-on-surface flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-container mt-1.5 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Food tip */}
          <div className="p-3.5 rounded-lg bg-surface-container-high/60 border border-outline-variant/30">
            <div className="text-xs font-bold text-primary flex items-center gap-1.5 mb-1">
              <span className="text-base">🍕</span> {labels.food}
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {neighborhood.localFoodTip[selectedLanguage]}
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-3">
            <button
              onClick={() => onToggleSave(neighborhood.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-700" />
                  <span>{labels.saved}</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>{labels.bookmark}</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                onAskAI(`Tell me the best hidden spots and transit tips for ${neighborhood.name} in New York.`);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-secondary-container" />
              <span>{labels.askAI}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
