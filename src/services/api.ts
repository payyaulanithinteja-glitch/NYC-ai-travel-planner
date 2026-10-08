import { LanguageCode, StructuredPlanItem } from '../types';

export interface ChatResponse {
  reply: string;
  updatedPlan?: StructuredPlanItem[] | null;
  source: 'gemini' | 'local-knowledge';
}

export async function sendChatMessage(
  message: string,
  language: LanguageCode,
  currentPlan?: StructuredPlanItem[]
): Promise<ChatResponse> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language, currentPlan }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('API fetch failed, generating offline response:', error);
    return {
      reply: getOfflineFallback(message, language),
      source: 'local-knowledge',
    };
  }
}

// Voice Input: Web Speech API (SpeechRecognition)
// Requirements: English "en-IN", Hindi "hi-IN", Telugu "te-IN"
export const SPEECH_INPUT_LANG_CODES: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
};

// Voice Output: SpeechSynthesis API codes
export const SPEECH_OUTPUT_LANG_CODES: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
};

export class VoiceInputService {
  private recognition: any = null;
  private isListening = false;

  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  public startListening(
    lang: LanguageCode,
    onResult: (transcript: string) => void,
    onError: (errorMsg: string) => void,
    onEnd: () => void
  ) {
    if (!this.isSupported()) {
      onError('Speech recognition is not supported in this browser. You can still type your request.');
      return;
    }

    try {
      this.stopListening();

      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognitionClass();
      recognition.lang = SPEECH_INPUT_LANG_CODES[lang] || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.isListening = true;
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        this.isListening = false;
        let message = 'Speech recognition error occurred. Please try speaking again or type.';
        if (event.error === 'not-allowed') {
          message = 'Microphone permission was denied. Please allow microphone access to use voice input.';
        } else if (event.error === 'no-speech') {
          message = 'No speech was detected. Please try again.';
        } else if (event.error === 'network') {
          message = 'Network error during voice recognition. Please try typing.';
        }
        onError(message);
      };

      recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition = recognition;
      recognition.start();
    } catch (err: any) {
      this.isListening = false;
      onError('Failed to initiate microphone listening. You can still type your query.');
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore already stopped
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  public listening(): boolean {
    return this.isListening;
  }
}

export const voiceInputService = new VoiceInputService();

// Voice Output Service using SpeechSynthesis
export class VoiceOutputService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;

  public speak(
    text: string,
    lang: LanguageCode,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onVoiceUnavailable?: (msg: string) => void;
    }
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (callbacks?.onVoiceUnavailable) {
        callbacks.onVoiceUnavailable("Voice isn't available for this language on your device. You can still read the reply.");
      }
      return;
    }

    this.stop();

    const targetCode = SPEECH_OUTPUT_LANG_CODES[lang] || 'en-IN';
    const langPrefix = lang; // 'en', 'hi', 'te'

    const voices = window.speechSynthesis.getVoices();

    // Look for matching voice
    let matchingVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === targetCode.toLowerCase() ||
        v.lang.toLowerCase().replace('_', '-') === targetCode.toLowerCase()
    );

    if (!matchingVoice) {
      matchingVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(langPrefix.toLowerCase())
      );
    }

    // If no voice available for this language
    if (!matchingVoice && lang !== 'en') {
      if (callbacks?.onVoiceUnavailable) {
        callbacks.onVoiceUnavailable("Voice isn't available for this language on your device. You can still read the reply.");
      }
      return;
    }

    // Clean markdown characters for pleasant speech
    const cleanText = text
      .replace(/[#*`_\[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetCode;
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (callbacks?.onStart) callbacks.onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (callbacks?.onEnd) callbacks.onEnd();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (callbacks?.onEnd) callbacks.onEnd();
    };

    this.currentUtterance = utterance;
    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  public speaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechService = new VoiceOutputService();

function getOfflineFallback(query: string, language: LanguageCode): string {
  if (language === 'te') {
    return `### న్యూయార్క్ సిటీ గైడ్ 🗽
- **సబ్‌వే OMNY:** ప్రయాణానికి మీ ఫోన్ లేదా కార్డును ట్యాప్ చేయండి ($2.90).
- **టిప్పింగ్ (Tipping):** రెస్టారెంట్లలో 18%-20% టిప్ ఇవ్వడం సహజం.
- **ఎడమ వైపు నడవకండి:** ఎస్కేలేటర్లపై కుడి వైపున నిలబడండి, ఎడమ వైపు తొందరగా వెళ్ళేవారికి దారి ఇవ్వండి.`;
  }

  if (language === 'hi') {
    return `### न्यूयॉर्क सिटी गाइड 🗽
- **सबवे OMNY:** यात्रा के लिए बस अपना फ़ोन या कार्ड टैप करें ($2.90)।
- **टिपिंग (Tipping):** रेस्टोरेंट में 18%-20% टिप देना सामान्य शिष्टाचार है।
- **चलने का नियम:** एस्केलेटर पर दाईं तरफ खड़े हों, बाईं तरफ निकलने वालों को रास्ता दें।`;
  }

  return `### Essential NYC Pulse 🗽
- **Subway OMNY:** Tap contactless debit/credit card or Apple/Google Pay at any turnstile ($2.90).
- **Tipping:** 18%–20% standard at sit-down eateries; $1–$2 per drink at bars.
- **Subway Etiquette:** Stand right, walk left on escalators and stairs.`;
}
