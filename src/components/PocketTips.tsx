import React, { useState } from 'react';
import { NYC_SLANG_TERMS, NEIGHBORHOODS } from '../data/nycData';
import { Neighborhood, LanguageCode } from '../types';
import { Calculator, BookMarked, PhoneCall, DollarSign, BookmarkX, ArrowRight } from 'lucide-react';

interface PocketTipsProps {
  selectedLanguage: LanguageCode;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onSelectNeighborhood: (n: Neighborhood) => void;
  onAskAI: (query: string) => void;
}

export const PocketTips: React.FC<PocketTipsProps> = ({
  selectedLanguage,
  savedIds,
  onToggleSave,
  onSelectNeighborhood,
  onAskAI,
}) => {
  const [billAmount, setBillAmount] = useState<number>(68.0);
  const [tipPercentage, setTipPercentage] = useState<number>(20);
  const [partySize, setPartySize] = useState<number>(2);

  const [activeGlossaryCategory, setActiveGlossaryCategory] = useState<string>('All');

  const tipAmount = (billAmount * tipPercentage) / 100;
  const totalAmount = billAmount + tipAmount;
  const perPersonAmount = partySize > 0 ? totalAmount / partySize : totalAmount;

  const savedNeighborhoods = NEIGHBORHOODS.filter((n) => savedIds.includes(n.id));

  const categories = ['All', 'Transit', 'Food', 'Street Etiquette'];
  const filteredTerms = NYC_SLANG_TERMS.filter(
    (t) => activeGlossaryCategory === 'All' || t.category === activeGlossaryCategory
  );

  const labels = {
    en: {
      title: 'Pocket Toolkit & NYC Etiquette',
      sub: 'The essential survival guide for dining, tipping, understanding urban customs, and accessing your saved itinerary bookmarks.',
      calcTitle: 'Interactive NYC Tipping Calculator',
      calcSub: 'Calculates standard 18–20% pre-tax rates and splits the bill.',
      preTax: 'Pre-Tax Bill Amount ($ USD)',
      experience: 'Service Experience',
      split: 'Split With (Party Size)',
      tipAmt: 'Tip Amount',
      totalAmt: 'Total with Tip',
      eachAmt: 'Each Person',
      diningRule: 'Sit-down dining: In NYC, servers rely on tips for living wage. 20% on the pre-tax bill is customary.',
      barRule: 'Bars: $1–$2 in cash or per tap per beer/wine, $2–$3 for craft cocktails.',
      savedTitle: 'Saved Pocket Places',
      savedEmpty: 'You haven’t bookmarked any neighborhoods yet.',
      emergencyTitle: 'Essential NYC City Assistance',
      slangTitle: 'NYC Slang & Street Customs Glossary',
      slangSub: 'Decipher authentic street jargon, bagel orders, and transit idioms.',
    },
    hi: {
      title: 'पॉकेट टूलकिट और स्थानीय शिष्टाचार',
      sub: 'भोजन, टिपिंग, शहर के नियम और आपकी सहेजी गई पसंदीदा जगहों की उपयोगी मार्गदर्शिका।',
      calcTitle: 'इंटरैक्टिव NYC टिपिंग कैलकुलेटर',
      calcSub: 'न्यूयॉर्क के सामान्य 18–20% टिप और प्रति व्यक्ति खर्च की त्वरित गणना।',
      preTax: 'बिल राशि ($ USD)',
      experience: 'सर्विस का अनुभव',
      split: 'कुल लोग (Party Size)',
      tipAmt: 'टिप राशि',
      totalAmt: 'टिप सहित कुल बिल',
      eachAmt: 'प्रति व्यक्ति हिस्सा',
      diningRule: 'रेस्टोरेंट: न्यूयॉर्क में वेटर की आय का बड़ा हिस्सा टिप होता है। 20% देना सामान्य शिष्टाचार है।',
      barRule: 'बार: प्रति बीयर/वाइन $1–$2 और कॉकटेल पर $2–$3 टिप दें।',
      savedTitle: 'सहेजे गए स्थान (Saved)',
      savedEmpty: 'आपने अभी तक कोई स्थान सेव नहीं किया है।',
      emergencyTitle: 'आपातकालीन व आवश्यक फोन नंबर',
      slangTitle: 'स्थानीय बोलचाल और शब्दावली (Glossary)',
      slangSub: 'बेगल ऑर्डर करने, सबवे और सड़क के अनकहे नियमों को समझें।',
    },
    te: {
      title: 'పాకెట్ టూల్స్ & న్యూయార్క్ మర్యాదలు',
      sub: 'భోజనం, టిప్పింగ్, స్థానిక పద్ధతులు మరియు మీ సేవ్ చేసుకున్న ప్రదేశాల సమాచారం.',
      calcTitle: 'ఇంటరాక్టివ్ NYC టిప్పింగ్ కాలిక్యులేటర్',
      calcSub: 'సాధారణ 18-20% టిప్ మరియు తలసరి ఖర్చును లెక్కించండి.',
      preTax: 'బిల్లు మొత్తం ($ USD)',
      experience: 'సర్వీస్ అనుభవం',
      split: 'వ్యక్తుల సంఖ్య (Party Size)',
      tipAmt: 'టిప్ మొత్తం',
      totalAmt: 'మొత్తం బిల్లు',
      eachAmt: 'ఒక్కొక్కరికి వచ్చే మొత్తం',
      diningRule: 'రెస్టారెంట్లు: న్యూయార్క్‌లో సర్వర్లకు 20% టిప్ ఇవ్వడం సహజమైన ఆచారం.',
      barRule: 'బార్లు: డ్రింక్‌కి $1–$2 టిప్ ఇవ్వడం మంచిది.',
      savedTitle: 'సేవ్ చేసుకున్న ప్రదేశాలు',
      savedEmpty: 'మీరు ఇంకా ఏ ప్రదేశాన్ని బుక్‌మార్క్ చేయలేదు.',
      emergencyTitle: 'ముఖ్యమైన ఎమర్జెన్సీ నంబర్లు',
      slangTitle: 'స్థానిక భాష & పదకోశం (Glossary)',
      slangSub: 'ఆహార ఆర్డర్లు, సబ్‌వే నియమాలు మరియు వీధి పదజాలం తెలుసుకోండి.',
    },
  }[selectedLanguage];

  return (
    <div className="space-y-12 pb-16">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2 mb-1">
          <BookMarked className="w-4 h-4 text-secondary-container" />
          <span>Practical Traveler Arsenal</span>
          <span aria-hidden="true">·</span>
          <span>English · हिन्दी · తెలుగు</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-primary tracking-tight">
          {labels.title}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          {labels.sub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tipping Calculator (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 sm:p-7 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                <Calculator className="w-4 h-4 text-secondary-container" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-primary">
                  {labels.calcTitle}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {labels.calcSub}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-primary bg-surface-container px-2.5 py-1 rounded">
              Standard: 20%
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                {labels.preTax}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={billAmount || ''}
                  onChange={(e) => setBillAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/50 text-sm font-mono font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                {labels.experience}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { percent: 18, label: '18% Standard' },
                  { percent: 20, label: '20% Great (NYC Normal)' },
                  { percent: 22, label: '22% Stellar' },
                ].map((item) => (
                  <button
                    key={item.percent}
                    onClick={() => setTipPercentage(item.percent)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                      tipPercentage === item.percent
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-on-surface border-outline-variant/40 hover:bg-surface-container'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                {labels.split}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6].map((size) => (
                  <button
                    key={size}
                    onClick={() => setPartySize(size)}
                    className={`w-9 h-9 rounded-lg font-mono text-xs font-bold flex items-center justify-center border transition-colors ${
                      partySize === size
                        ? 'bg-secondary-container text-on-secondary-container border-secondary-container font-extrabold shadow-xs'
                        : 'bg-white text-on-surface border-outline-variant/40 hover:bg-surface-container'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="p-5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
            <div className="grid grid-cols-3 gap-3 pb-3 border-b border-outline-variant/20 text-center">
              <div>
                <div className="text-[11px] text-on-surface-variant">{labels.tipAmt}</div>
                <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-primary">
                  ${tipAmount.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-on-surface-variant">{labels.totalAmt}</div>
                <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-primary">
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-on-surface-variant">
                  {labels.eachAmt} ({partySize}p)
                </div>
                <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-emerald-700">
                  ${perPersonAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="text-xs text-on-surface-variant space-y-1">
              <p>{labels.diningRule}</p>
              <p>{labels.barRule}</p>
            </div>
          </div>
        </div>

        {/* Saved Neighborhoods & Emergency (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <h2 className="text-base font-bold font-display text-primary flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-secondary-container" />
              <span>
                {labels.savedTitle} ({savedNeighborhoods.length})
              </span>
            </h2>
            <span className="text-xs text-on-surface-variant font-mono">Offline</span>
          </div>

          {savedNeighborhoods.length === 0 ? (
            <div className="py-6 text-center space-y-1">
              <p className="text-xs text-on-surface-variant">{labels.savedEmpty}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedNeighborhoods.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-lg bg-surface-container border border-outline-variant/20 flex items-center justify-between gap-3"
                >
                  <div
                    onClick={() => onSelectNeighborhood(n)}
                    className="cursor-pointer flex-1"
                  >
                    <div className="text-xs font-bold text-primary hover:underline">
                      {n.name}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">
                      {n.borough} · {n.nearestStation}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectNeighborhood(n)}
                      className="p-1.5 rounded-md text-primary hover:bg-surface-container-high"
                      title="Open details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleSave(n.id)}
                      className="p-1.5 rounded-md text-on-surface-variant hover:text-error hover:bg-surface-container-high"
                      title="Remove"
                    >
                      <BookmarkX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Emergency Numbers Box */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3 text-xs">
            <div className="font-bold text-primary flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-error" />
              {labels.emergencyTitle}
            </div>
            <div className="space-y-1.5 text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>NYC Non-Emergency / Lost in Taxis:</span>
                <span className="font-mono font-bold text-primary">Dial 311</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Immediate Police / Medical:</span>
                <span className="font-mono font-bold text-error">Dial 911</span>
              </div>
              <div className="flex items-center justify-between">
                <span>MTA Transit Customer Assistance:</span>
                <span className="font-mono font-bold text-primary">511</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slang Glossary */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-primary">
              {labels.slangTitle}
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              {labels.slangSub}
            </p>
          </div>

          <div className="flex items-center p-1 bg-surface-container rounded-lg border border-outline-variant/30 self-start sm:self-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveGlossaryCategory(c)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeGlossaryCategory === c
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTerms.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-[10px] text-secondary-container bg-primary px-1.5 py-0.5 rounded-xs font-bold">
                    {item.category}
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    /{item.pronunciation}/
                  </span>
                </div>

                <h3 className="text-base font-bold font-display text-primary mt-1">
                  {item.term}
                </h3>

                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  {item.definition[selectedLanguage] || item.definition.en}
                </p>
              </div>

              <div className="pt-2 border-t border-outline-variant/20">
                <div className="text-[11px] italic text-on-surface bg-surface-container-low p-2 rounded">
                  {item.example}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
