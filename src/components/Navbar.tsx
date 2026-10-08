import React from 'react';
import { SUPPORTED_LANGUAGES } from '../data/nycData';
import { LanguageCode } from '../types';
import { VolumeX, MessageSquareText, Globe } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isAudioActive: boolean;
  onStopAudio: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  selectedLanguage,
  onLanguageChange,
  isAudioActive,
  onStopAudio,
  savedCount,
}) => {
  const labels: Record<LanguageCode, { explore: string; transit: string; routes: string; companion: string; tips: string; ask: string }> = {
    en: {
      explore: 'Explore & Pulse',
      transit: 'Subway & Transit',
      routes: 'Kinetic Routes',
      companion: 'AI Companion',
      tips: 'Pocket Tips',
      ask: 'Ask Companion',
    },
    hi: {
      explore: 'एक्सप्लोर और पल्स',
      transit: 'सबवे व मेट्रो',
      routes: 'यात्रा योजनाएं',
      companion: 'AI साथी (Companion)',
      tips: 'पॉकेट टिप्स',
      ask: 'AI से पूछें',
    },
    te: {
      explore: 'నగర అన్వేషణ',
      transit: 'సబ్‌వే & రవాణా',
      routes: 'టూర్ ప్లాన్స్',
      companion: 'AI గైడ్ (Companion)',
      tips: 'పాకెట్ చిట్కాలు',
      ask: 'AI ని అడగండి',
    },
  };

  const currentLabels = labels[selectedLanguage] || labels.en;

  const navItems = [
    { id: 'explore', label: currentLabels.explore },
    { id: 'transit', label: currentLabels.transit },
    { id: 'routes', label: currentLabels.routes },
    { id: 'companion', label: currentLabels.companion },
    { id: 'tips', label: `${currentLabels.tips}${savedCount > 0 ? ` (${savedCount})` : ''}` },
  ];

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onTabChange('explore')}
          className="text-lg font-bold tracking-tight text-primary font-display hover:opacity-80 transition-opacity whitespace-nowrap text-left flex items-center gap-2"
        >
          <span>Urban Kinetic Pulse</span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-on-surface-variant">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`transition-colors whitespace-nowrap py-1 relative ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary-container rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions + Persistent Language Selector */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Audio voice playback indicator if speaking */}
          {isAudioActive && (
            <button
              onClick={onStopAudio}
              title="Stop audio guide"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-secondary-container text-on-secondary-container hover:opacity-90 transition-opacity"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mute Audio</span>
            </button>
          )}

          {/* Persistent Language Selector visible on every screen in the header */}
          <div className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant/60 rounded-md py-1 px-2 text-xs font-semibold text-primary">
            <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              aria-label="Select session language (English, Hindi, Telugu)"
              className="bg-transparent text-primary text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-white text-on-surface">
                  {lang.flag} {lang.nativeName} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Quick AI button */}
          <button
            onClick={() => onTabChange('companion')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-on-primary hover:bg-primary-container transition-colors whitespace-nowrap shadow-xs"
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentLabels.ask}</span>
            <span className="sm:hidden">AI</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav row */}
      <div className="md:hidden border-t border-outline-variant/20 px-3 py-2 flex items-center justify-between overflow-x-auto gap-2 bg-surface">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md font-medium transition-colors ${
              currentTab === item.id
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
