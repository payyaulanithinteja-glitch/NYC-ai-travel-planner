import React, { useState, useRef, useEffect } from 'react';
import { LanguageCode, ChatMessage, StructuredPlanItem } from '../types';
import {
  sendChatMessage,
  speechService,
  voiceInputService,
  SPEECH_INPUT_LANG_CODES,
} from '../services/api';
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Copy,
  Check,
  AlertCircle,
  Calendar,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

interface AICompanionProps {
  selectedLanguage: LanguageCode;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  currentPlan: StructuredPlanItem[];
  onUpdatePlan: (newPlan: StructuredPlanItem[]) => void;
  onNavigateTab: (tab: string) => void;
}

export const AICompanion: React.FC<AICompanionProps> = ({
  selectedLanguage,
  initialQuery,
  onClearInitialQuery,
  currentPlan,
  onUpdatePlan,
  onNavigateTab,
}) => {
  const welcomeMessages: Record<LanguageCode, string> = {
    en: `Welcome to New York City! 🗽\nI am your Urban Kinetic Pulse AI Companion. You can ask for directions, subway tips, or customize your itinerary (e.g., try saying "make day 2 cheaper").\n\nHow can I help you today?`,
    hi: `न्यूयॉर्क सिटी में आपका स्वागत है! 🗽\nमैं आपका अर्बन काइनेटिक पल्स AI साथी हूँ। आप सबवे के नियम, घूमने की जगहें या यात्रा योजना में बदलाव (जैसे "दिन 2 को सस्ता करें") के बारे में पूछ सकते हैं।\n\nआज मैं आपकी क्या सहायता कर सकता हूँ?`,
    te: `న్యూయార్క్ సిటీకి స్వాగతం! 🗽\nనేను మీ అర్బన్ కైనెటిక్ పల్స్ AI గైడ్‌ని. మీరు సబ్‌వే మార్గాలు, దర్శనీయ స్థలాలు లేదా టూర్ ప్లాన్ మార్పులు (ఉదాహరణకు "రోజు 2 చౌకగా చేయండి") గురించి అడగవచ్చు.\n\nనేను మీకు ఎలా సహాయపడగలను?`,
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'companion',
      text: welcomeMessages[selectedLanguage],
      timestamp: 'Just now',
      language: selectedLanguage,
      source: 'local-knowledge',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [speechWarning, setSpeechWarning] = useState<string | null>(null);
  const [voiceInputError, setVoiceInputError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isListening]);

  // Handle external query (e.g. from neighborhood detail or route advice)
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  // If language changes, append a localized switch greeting
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'companion',
            text: welcomeMessages[selectedLanguage],
            timestamp: 'Just now',
            language: selectedLanguage,
            source: 'local-knowledge',
          },
        ];
      }
      return prev;
    });
  }, [selectedLanguage]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    setVoiceInputError(null);
    setSpeechWarning(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: selectedLanguage,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(textToSend, selectedLanguage, currentPlan);

      if (response.updatedPlan && response.updatedPlan.length > 0) {
        onUpdatePlan(response.updatedPlan);
      }

      const companionMsg: ChatMessage = {
        id: `comp-${Date.now()}`,
        sender: 'companion',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: selectedLanguage,
        updatedPlan: response.updatedPlan || undefined,
        source: response.source,
      };

      setMessages((prev) => [...prev, companionMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'companion',
        text:
          selectedLanguage === 'te'
            ? 'క్షమించండి, సర్వర్ స్పందించలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.'
            : selectedLanguage === 'hi'
            ? 'माफ़ कीजिए, सर्वर से संपर्क नहीं हो पाया। कृपया दोबारा प्रयास करें।'
            : 'Sorry, I had trouble connecting. Please try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: selectedLanguage,
        source: 'local-knowledge',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Input with Web Speech API
  const handleStartVoiceInput = () => {
    if (isListening) {
      voiceInputService.stopListening();
      setIsListening(false);
      return;
    }

    setVoiceInputError(null);
    setIsListening(true);

    voiceInputService.startListening(
      selectedLanguage,
      (transcript) => {
        setIsListening(false);
        if (transcript && transcript.trim()) {
          setInputMessage(transcript);
          handleSendMessage(transcript);
        }
      },
      (errorMsg) => {
        setIsListening(false);
        setVoiceInputError(errorMsg);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  // Voice Output with SpeechSynthesis API and fallback message
  const handleSpeakMessage = (msgId: string, text: string) => {
    setSpeechWarning(null);

    if (activeSpeechId === msgId) {
      speechService.stop();
      setActiveSpeechId(null);
      return;
    }

    setActiveSpeechId(msgId);

    speechService.speak(text, selectedLanguage, {
      onEnd: () => {
        setActiveSpeechId(null);
      },
      onVoiceUnavailable: (msg) => {
        setActiveSpeechId(null);
        setSpeechWarning(msg);
      },
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Multilingual quick suggestions for edits and common queries
  const quickChips = {
    en: [
      'Make day 2 cheaper',
      'Explain OMNY subway tap & go',
      'Best free skyline view in Brooklyn',
      'How to order a classic NYC bagel',
    ],
    hi: [
      'दिन 2 को सस्ता करें',
      'सबवे OMNY कैसे काम करता है?',
      'ब्रुकलिन में सबसे अच्छा मुफ्त स्काईलाइन नज़ारा',
      'न्यूयॉर्क बेगल कैसे ऑर्डर करें?',
    ],
    te: [
      'రోజు 2 చౌకగా చేయండి',
      'సబ్‌వే OMNY ఎలా ఉపయోగించాలి?',
      'బ్రూక్లిన్‌లో ఉచిత స్కైలైన్ వ్యూ ఎక్కడ ఉంది?',
      'న్యూయార్క్ బాగెల్ ఎలా ఆర్డర్ చేయాలి?',
    ],
  }[selectedLanguage];

  const currentSpeechCode = SPEECH_INPUT_LANG_CODES[selectedLanguage];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-secondary-container" />
          <span>Multilingual Local Guide</span>
          <span aria-hidden="true">·</span>
          <span>English · हिन्दी · తెలుగు</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-primary tracking-tight">
          {selectedLanguage === 'te'
            ? 'AI గైడ్ మరియు టూర్ ఎడిటర్'
            : selectedLanguage === 'hi'
            ? 'AI साथी और यात्रा योजना संपादक'
            : 'NYC AI Companion & Plan Editor'}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          {selectedLanguage === 'te'
            ? 'వాయిస్ లేదా టెక్స్ట్ ద్వారా మాట్లాడండి. "రోజు 2 చౌకగా చేయండి" అని అడగడం ద్వారా మీ టూర్ ప్లాన్‌ను తక్షణమే మార్చుకోండి.'
            : selectedLanguage === 'hi'
            ? 'आवाज़ या टाइप करके पूछें। "दिन 2 को सस्ता करें" कहकर तुरंत अपनी यात्रा योजना में बदलाव करें।'
            : 'Speak or type naturally. Edit your itinerary on the fly (e.g. "make day 2 cheaper") and receive structured travel updates.'}
        </p>
      </div>

      {/* Warnings & Alerts */}
      {speechWarning && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <span>{speechWarning}</span>
          </div>
          <button
            onClick={() => setSpeechWarning(null)}
            className="text-amber-800 hover:text-black font-semibold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {voiceInputError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <span>{voiceInputError}</span>
          </div>
          <button
            onClick={() => setVoiceInputError(null)}
            className="text-red-800 hover:text-black font-semibold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Chat Panel (8 cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/40 rounded-xl flex flex-col h-[670px] shadow-xs overflow-hidden">
          {/* Chat Header Status */}
          <div className="px-5 py-3.5 border-b border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-secondary-container" />
              </div>
              <div>
                <div className="text-xs font-bold text-primary">Urban Kinetic NYC Companion</div>
                <div className="text-[11px] text-on-surface-variant font-mono">
                  Input Code: {currentSpeechCode} · Language: {selectedLanguage.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isListening && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>Listening ({currentSpeechCode})...</span>
                </div>
              )}
              <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Live AI
              </div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSpeaking = activeSpeechId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-xl p-4 space-y-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-surface-container border border-outline-variant/30 text-on-surface rounded-bl-none'
                    }`}
                  >
                    {/* Message text */}
                    <div className="whitespace-pre-line space-y-1">
                      {msg.text}
                    </div>

                    {/* If message returned an updated structured plan */}
                    {msg.updatedPlan && msg.updatedPlan.length > 0 && (
                      <div className="mt-3 p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 space-y-3 text-on-surface">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                            <Calendar className="w-3.5 h-3.5 text-secondary-container" />
                            <span>Updated Structured Itinerary Plan</span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                            {msg.updatedPlan.length} stops updated
                          </span>
                        </div>

                        {/* List structured plan items with English keys: day, time, place, description, cost */}
                        <div className="space-y-2">
                          {msg.updatedPlan.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-md bg-surface-container-low text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="font-bold text-primary">
                                  Day {item.day} · {item.time}
                                </span>
                                <span className="font-semibold text-emerald-700">
                                  {item.cost}
                                </span>
                              </div>
                              <div className="font-semibold text-primary">{item.place}</div>
                              <div className="text-on-surface-variant text-[11px] leading-relaxed">
                                {item.description}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => onNavigateTab('routes')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                          >
                            <span>View in Kinetic Routes</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Footer actions on companion messages */}
                    {!isUser && (
                      <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span className="font-mono text-[10px]">{msg.timestamp}</span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSpeakMessage(msg.id, msg.text)}
                            className={`p-1.5 rounded hover:bg-surface-container-high transition-colors ${
                              isSpeaking ? 'text-secondary-container font-bold bg-primary' : ''
                            }`}
                            title={isSpeaking ? 'Stop speaking' : 'Read aloud with AI voice'}
                            aria-label="Voice output"
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-3.5 h-3.5 text-secondary-container" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="p-1.5 rounded hover:bg-surface-container-high transition-colors"
                            title="Copy reply"
                            aria-label="Copy message"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container border border-outline-variant/30 rounded-xl rounded-bl-none p-3.5 text-xs text-on-surface-variant flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping" />
                  <span>
                    {selectedLanguage === 'te'
                      ? 'AI స్పందిస్తోంది...'
                      : selectedLanguage === 'hi'
                      ? 'AI उत्तर तैयार कर रहा है...'
                      : 'Consulting NYC AI grid in selected language...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Input Active Banner */}
          {isListening && (
            <div className="bg-red-500 text-white px-4 py-2 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>
                  Listening in {selectedLanguage === 'te' ? 'Telugu' : selectedLanguage === 'hi' ? 'Hindi' : 'English'} ({currentSpeechCode}). Speak now...
                </span>
              </div>
              <button
                onClick={() => {
                  voiceInputService.stopListening();
                  setIsListening(false);
                }}
                className="underline text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Input & Microphone Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-outline-variant/20 bg-surface-container-low flex items-center gap-2"
          >
            {/* Microphone Button (SpeechRecognition) */}
            <button
              type="button"
              onClick={handleStartVoiceInput}
              title={`Voice input in ${currentSpeechCode}`}
              aria-label="Voice input"
              className={`p-2.5 rounded-lg transition-colors border ${
                isListening
                  ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-300'
                  : 'bg-surface-container-lowest text-primary border-outline-variant/50 hover:bg-surface-container'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                selectedLanguage === 'te'
                  ? 'సందేశం టైప్ చేయండి లేదా మాట్లాడండి ("రోజు 2 చౌకగా చేయండి")...'
                  : selectedLanguage === 'hi'
                  ? 'संदेश लिखें या बोलें (जैसे "दिन 2 को सस्ता करें")...'
                  : 'Type or speak (e.g. "make day 2 cheaper")...'
              }
              className="flex-1 bg-white border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-lg bg-primary text-white hover:bg-primary-container disabled:opacity-40 transition-colors shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Sidebar: Voice Controls & Quick Edit Chips (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Voice Input & Output Specs Card */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-3.5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Voice System Settings
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
                <span className="text-on-surface-variant">Active Language:</span>
                <span className="font-bold text-primary font-mono uppercase">
                  {selectedLanguage}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
                <span className="text-on-surface-variant">Voice Recognition:</span>
                <span className="font-bold text-primary font-mono">
                  {currentSpeechCode}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
                <span className="text-on-surface-variant">Speech Engine:</span>
                <span className="font-semibold text-emerald-700">Web Speech API</span>
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Tap the microphone to speak your query. Tap the speaker icon beside any response to listen. If your operating system lacks a voice for Telugu or Hindi, a fallback note will be displayed.
            </p>
          </div>

          {/* Quick Chat Edit Chips */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="w-3.5 h-3.5 text-secondary-container" />
              <span>
                {selectedLanguage === 'te'
                  ? 'శీఘ్ర ఆదేశాలు (Quick Prompts)'
                  : selectedLanguage === 'hi'
                  ? 'त्वरित निर्देश (Quick Prompts)'
                  : 'Quick Chat & Edit Prompts'}
              </span>
            </div>
            <div className="space-y-2">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="w-full text-left p-3 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 text-xs text-on-surface transition-colors font-medium hover:border-primary/40 block"
                >
                  "{chip}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
