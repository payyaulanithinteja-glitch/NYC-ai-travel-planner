export type LanguageCode = 'en' | 'hi' | 'te';

export interface Language {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
  speechCode: string; // 'en-IN', 'hi-IN', 'te-IN'
}

// Structured plan: JSON keys in English (day, time, place, description, cost)
export interface StructuredPlanItem {
  day: number;
  time: string;
  place: string;
  description: string;
  cost: string;
}

export interface SubwayLine {
  id: string;
  name: string;
  color: string;
  textColor: string;
  bullets: string[];
  status: 'Good Service' | 'Planned Work' | 'Delays';
  statusDetails: string;
  boroughs: string[];
  express: boolean;
}

export interface Neighborhood {
  id: string;
  name: string;
  borough: 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx';
  tagline: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
  image: string;
  transitLines: string[];
  nearestStation: string;
  walkMinutes: number;
  crowdLevel: 'Low' | 'Moderate' | 'Vibrant' | 'High';
  vibeTags: string[];
  audioGuideDuration: string;
  audioScript: Record<LanguageCode, string>;
  highlights: Record<LanguageCode, string[]>;
  localFoodTip: Record<LanguageCode, string>;
  bestTime: Record<LanguageCode, string>;
  latitude: number;
  longitude: number;
}

export interface RouteStop {
  id: string;
  day: number;
  time: string;
  place: string;
  description: string;
  cost: string;
  category: 'Sight' | 'Food' | 'Culture' | 'Park' | 'View';
  address: string;
  durationMinutes: number;
  transitTip: string;
  notes: string;
}

export interface KineticRoute {
  id: string;
  title: Record<LanguageCode, string>;
  subheading: Record<LanguageCode, string>;
  borough: string;
  durationHours: string;
  walkingMiles: number;
  subwayRides: number;
  vibe: string;
  summary: Record<LanguageCode, string>;
  structuredPlan: StructuredPlanItem[];
  stops: RouteStop[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  timestamp: string;
  language: LanguageCode;
  updatedPlan?: StructuredPlanItem[];
  source?: 'gemini' | 'local-knowledge';
}

export interface SlangTerm {
  term: string;
  pronunciation: string;
  definition: Record<LanguageCode, string>;
  example: string;
  category: 'Transit' | 'Food' | 'Street Etiquette' | 'Slang';
}
