/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PulseExplorer } from './components/PulseExplorer';
import { TransitNavigator } from './components/TransitNavigator';
import { KineticRoutes } from './components/KineticRoutes';
import { AICompanion } from './components/AICompanion';
import { PocketTips } from './components/PocketTips';
import { NeighborhoodModal } from './components/NeighborhoodModal';
import { LanguageCode, Neighborhood, StructuredPlanItem } from './types';
import { INITIAL_STRUCTURED_PLAN } from './data/nycData';
import { speechService } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('explore');

  // Requirement 1 & 6: Language choice persisted during session and shown in header on every screen
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(() => {
    try {
      const sessionLang = sessionStorage.getItem('urban_kinetic_lang');
      if (sessionLang === 'en' || sessionLang === 'hi' || sessionLang === 'te') {
        return sessionLang;
      }
      const localLang = localStorage.getItem('urban_kinetic_lang');
      if (localLang === 'en' || localLang === 'hi' || localLang === 'te') {
        return localLang;
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  // Requirement 2 & 5: Live structured itinerary plan with English keys (day, time, place, description, cost)
  const [structuredPlan, setStructuredPlan] = useState<StructuredPlanItem[]>(() => {
    try {
      const stored = sessionStorage.getItem('urban_kinetic_plan');
      return stored ? JSON.parse(stored) : INITIAL_STRUCTURED_PLAN;
    } catch {
      return INITIAL_STRUCTURED_PLAN;
    }
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('urban_kinetic_saved');
      return stored ? JSON.parse(stored) : ['soho-village', 'dumbo-heights'];
    } catch {
      return ['soho-village', 'dumbo-heights'];
    }
  });

  const [selectedNeighborhoodForModal, setSelectedNeighborhoodForModal] = useState<Neighborhood | null>(null);
  const [companionInitialQuery, setCompanionInitialQuery] = useState<string>('');
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isModalAudioPlaying, setIsModalAudioPlaying] = useState(false);

  // Persist language choice in session and local storage
  const handleLanguageChange = (newLang: LanguageCode) => {
    setSelectedLanguage(newLang);
    try {
      sessionStorage.setItem('urban_kinetic_lang', newLang);
      localStorage.setItem('urban_kinetic_lang', newLang);
    } catch (e) {
      console.warn('Failed to persist language in session:', e);
    }
  };

  // Persist updated structured plan in session
  const handleUpdatePlan = (newPlan: StructuredPlanItem[]) => {
    setStructuredPlan(newPlan);
    try {
      sessionStorage.setItem('urban_kinetic_plan', JSON.stringify(newPlan));
    } catch (e) {
      console.warn('Failed to persist plan in session:', e);
    }
  };

  // Sync saved bookmarks with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('urban_kinetic_saved', JSON.stringify(savedIds));
    } catch (e) {
      console.warn('Failed to save bookmarks:', e);
    }
  }, [savedIds]);

  // Audio heartbeat listener
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAudioActive(speechService.speaking());
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStopAudio = () => {
    speechService.stop();
    setIsAudioActive(false);
    setIsModalAudioPlaying(false);
  };

  const handleAskAI = (query: string) => {
    setCompanionInitialQuery(query);
    setCurrentTab('companion');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Top Bar Navigation with Persistent Language Selector */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        isAudioActive={isAudioActive}
        onStopAudio={handleStopAudio}
        savedCount={savedIds.length}
      />

      {/* Main Content Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'explore' && (
          <PulseExplorer
            selectedLanguage={selectedLanguage}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectNeighborhood={setSelectedNeighborhoodForModal}
            onAskAI={handleAskAI}
            onNavigateTab={handleTabChange}
          />
        )}

        {currentTab === 'transit' && (
          <TransitNavigator
            selectedLanguage={selectedLanguage}
            onAskAI={handleAskAI}
          />
        )}

        {currentTab === 'routes' && (
          <KineticRoutes
            selectedLanguage={selectedLanguage}
            onAskAI={handleAskAI}
            structuredPlan={structuredPlan}
            onUpdatePlan={handleUpdatePlan}
          />
        )}

        {currentTab === 'companion' && (
          <AICompanion
            selectedLanguage={selectedLanguage}
            initialQuery={companionInitialQuery}
            onClearInitialQuery={() => setCompanionInitialQuery('')}
            currentPlan={structuredPlan}
            onUpdatePlan={handleUpdatePlan}
            onNavigateTab={handleTabChange}
          />
        )}

        {currentTab === 'tips' && (
          <PocketTips
            selectedLanguage={selectedLanguage}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectNeighborhood={setSelectedNeighborhoodForModal}
            onAskAI={handleAskAI}
          />
        )}
      </main>

      {/* Neighborhood Detail Modal */}
      <NeighborhoodModal
        neighborhood={selectedNeighborhoodForModal}
        onClose={() => {
          setSelectedNeighborhoodForModal(null);
          setIsModalAudioPlaying(false);
        }}
        selectedLanguage={selectedLanguage}
        isSaved={selectedNeighborhoodForModal ? savedIds.includes(selectedNeighborhoodForModal.id) : false}
        onToggleSave={handleToggleSave}
        onAskAI={handleAskAI}
        isPlayingAudio={isModalAudioPlaying}
        setIsPlayingAudio={setIsModalAudioPlaying}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-outline-variant/30 bg-surface-container-low py-8 text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold font-display text-primary">Urban Kinetic Pulse</span>
            <span aria-hidden="true">·</span>
            <span>Multilingual NYC Companion (English · हिन्दी · తెలుగు)</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span>OMNY Contactless $2.90</span>
            <span aria-hidden="true">·</span>
            <span>MTA Transit Network</span>
            <span aria-hidden="true">·</span>
            <span>Active: {selectedLanguage.toUpperCase()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
