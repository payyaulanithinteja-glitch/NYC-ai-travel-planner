import React, { useState } from 'react';
import { SUBWAY_LINES, NYC_STATIONS, NYC_IMAGE_ASSETS } from '../data/nycData';
import { LanguageCode } from '../types';
import { Train, ArrowUpDown, CheckCircle2, AlertTriangle, CreditCard, Compass, ChevronRight } from 'lucide-react';

interface TransitNavigatorProps {
  selectedLanguage: LanguageCode;
  onAskAI: (query: string) => void;
}

export const TransitNavigator: React.FC<TransitNavigatorProps> = ({
  selectedLanguage,
  onAskAI,
}) => {
  const [originStation, setOriginStation] = useState(NYC_STATIONS[0]);
  const [destStation, setDestStation] = useState(NYC_STATIONS[5]); // DUMBO
  const [calculatedRoute, setCalculatedRoute] = useState<any>(null);

  const handleSwapStations = () => {
    const temp = originStation;
    setOriginStation(destStation);
    setDestStation(temp);
    calculateSubwayRoute(destStation, temp);
  };

  const calculateSubwayRoute = (from: string, to: string) => {
    if (from === to) {
      setCalculatedRoute({
        sameStation: true,
      });
      return;
    }

    let recommendedLines: string[] = [];
    let minutes = 15;
    let stops = 4;
    let transfer = 'Direct ride with no train changes';
    let advisory = 'Local train; runs every 3-5 minutes.';

    if (from.includes('Times Sq') && to.includes('DUMBO')) {
      recommendedLines = ['A', 'C'];
      minutes = 18;
      stops = 6;
      transfer =
        selectedLanguage === 'te'
          ? '42 St నుండి High St (DUMBO) వరకు నేరుగా సబ్‌వే'
          : selectedLanguage === 'hi'
          ? '42 St से सीधे High St (DUMBO) तक बिना बदले ट्रेन'
          : 'Direct from 42 St – Port Authority to High St (DUMBO)';
      advisory =
        selectedLanguage === 'te'
          ? 'A ట్రైన్ ఎక్స్‌ప్రెస్, నేరుగా వంతెన కింద High St వద్ద ఆగుతుంది.'
          : selectedLanguage === 'hi'
          ? 'A ट्रेन एक्सप्रेस है, सीधे हाई स्ट्रीट (High St) पर रुकती है।'
          : 'A is express in Manhattan; stops directly at High St under the bridge.';
    } else if (from.includes('Grand Central') && to.includes('DUMBO')) {
      recommendedLines = ['4', '5', 'A'];
      minutes = 22;
      stops = 5;
      transfer =
        selectedLanguage === 'te'
          ? '4/5 ఎక్స్‌ప్రెస్‌లో ఫుల్టన్ స్ట్రీట్‌కు వెళ్లి, అక్కడి నుండి A/C కి మారండి.'
          : selectedLanguage === 'hi'
          ? '4/5 एक्सप्रेस से फुल्टन स्ट्रीट (Fulton St) जाएं, वहां से A/C ट्रेन लें।'
          : 'Take 4/5 express south to Fulton St, quick in-station transfer to Brooklyn-bound A/C.';
      advisory =
        selectedLanguage === 'te'
          ? 'ఫుల్టన్ స్ట్రీట్ స్టేషన్‌లో లిఫ్టులు (Elevators) అందుబాటులో ఉన్నాయి.'
          : selectedLanguage === 'hi'
          ? 'फुल्टन स्ट्रीट स्टेशन पर लिफ्ट की पूरी सुविधा है।'
          : 'Fulton Street transfer is fully accessible with ADA elevators.';
    } else if (to.includes('Williamsburg') || from.includes('Williamsburg')) {
      recommendedLines = ['L'];
      minutes = 14;
      stops = 4;
      transfer =
        selectedLanguage === 'te'
          ? 'L ట్రైన్ ద్వారా ఈస్ట్ రివర్ దాటి బెడ్‌ఫోర్డ్ అవెన్యూకు చేరుకోండి.'
          : selectedLanguage === 'hi'
          ? 'L ट्रेन से ईस्ट रिवर पार करके बेडफोर्ड एवेन्यू (Bedford Ave) पहुंचें।'
          : 'Take the L train across the East River to Bedford Ave.';
      advisory =
        selectedLanguage === 'te'
          ? 'ప్రతి 4 నిమిషాలకు ఒక రైలు వస్తుంది.'
          : selectedLanguage === 'hi'
          ? 'हर 4 मिनट में ट्रेन उपलब्ध है।'
          : 'Headways are ~4 minutes. Bedford Ave has exits at both N 7th and Bedford.';
    } else {
      recommendedLines = ['N', 'Q', 'R'];
      minutes = 16;
      stops = 5;
      transfer =
        selectedLanguage === 'te'
          ? 'బ్రాడ్‌వే లైన్ ద్వారా నేరుగా ప్రయాణం.'
          : selectedLanguage === 'hi'
          ? 'ब्रॉडवे लाइन से सीधा सफर।'
          : 'Direct service along Broadway trunk corridor.';
      advisory =
        selectedLanguage === 'te'
          ? 'స్టేషన్‌లోకి ప్రవేశించే ముందు అప్‌టౌన్ లేదా డౌన్‌టౌన్ బోర్డు చూడండి.'
          : selectedLanguage === 'hi'
          ? 'सीढ़ियों से उतरने से पहले अपटाउन (Uptown) या डाउनटाउन (Downtown) बोर्ड देखें।'
          : 'Look for uptown or downtown signs before swiping into street stairs.';
    }

    setCalculatedRoute({
      sameStation: false,
      from,
      to,
      lines: recommendedLines,
      minutes,
      stops,
      transfer,
      advisory,
      fare: '$2.90 (OMNY Tap)',
    });
  };

  React.useEffect(() => {
    calculateSubwayRoute(originStation, destStation);
  }, [originStation, destStation, selectedLanguage]);

  const labels = {
    en: {
      tag: 'MTA Kinetic Transit Network',
      title: 'Subway & Kinetic Route Calculator',
      sub: 'The New York subway carries 4 million daily riders across 472 stations. Calculate fast cross-borough transfers and navigate with contactless OMNY tap-to-pay.',
      plannerTitle: 'Point-to-Point Station Planner',
      plannerSub: 'Calculates fastest train lines, transfer hubs, and travel time.',
      depLabel: 'Departure Station',
      destLabel: 'Destination Station',
      fastest: 'Fastest Train Lines:',
      noTickets: 'No ticket line required — tap with phone/card ($2.90)',
      askAIDir: 'Ask AI detailed directions',
      greenGlobeTitle: 'MTA Green Globe Rule',
      greenGlobeDesc: 'Subway entrances with glowing green globes are open 24/7 with turnstiles. Red globes indicate exit-only or restricted hours.',
      omnyTitle: 'OMNY Contactless Fare System',
      rule1Title: '1. Stand Right, Walk Left',
      rule1Desc: 'When riding escalators, always hold to the right. The left lane is for commuters in a hurry.',
      rule2Title: '2. Exit Before Entering',
      rule2Desc: 'Step to the side of the subway doors on the platform and allow riders to exit before stepping on.',
      rule3Title: '3. Check Uptown vs. Downtown',
      rule3Desc: 'Check the sign above street subway stairs before entering to avoid paying twice on opposite platforms.',
    },
    hi: {
      tag: 'MTA सबवे और मेट्रो नेटवर्क',
      title: 'सबवे रूट और स्टेशन कैलकुलेटर',
      sub: 'न्यूयॉर्क सबवे 472 स्टेशनों के साथ 40 लाख यात्रियों को जोड़ता है। OMNY से सीधे $2.90 टैप करके आसानी से सफर करें।',
      plannerTitle: 'स्टेशन-से-स्टेशन यात्रा योजना',
      plannerSub: 'सबसे तेज़ सबवे लाइन, बदलने का स्टेशन और समय की गणना।',
      depLabel: 'शुरुआती स्टेशन (Departure)',
      destLabel: 'मंज़िल स्टेशन (Destination)',
      fastest: 'सबसे तेज़ ट्रेन लाइनें:',
      noTickets: 'टिकट लाइन की ज़रूरत नहीं — फ़ोन या कार्ड से $2.90 टैप करें',
      askAIDir: 'AI से रास्ते की पूरी जानकारी लें',
      greenGlobeTitle: 'हरी बत्ती (Green Globe) का नियम',
      greenGlobeDesc: 'सड़क पर हरे ग्लोब वाली सीढ़ियां 24 घंटे खुली रहती हैं। लाल ग्लोब केवल बाहर निकलने के लिए होते हैं।',
      omnyTitle: 'OMNY संपर्क-रहित किराया प्रणाली',
      rule1Title: '1. दाईं ओर खड़े हों, बाईं ओर चलें',
      rule1Desc: 'एस्केलेटर और सीढ़ियों पर हमेशा दाईं तरफ खड़े रहें ताकि जल्दी जाने वाले बाईं तरफ से निकल सकें।',
      rule2Title: '2. पहले उतरने दें, फिर चढ़ें',
      rule2Desc: 'ट्रेन का दरवाज़ा खुलने पर पहले सवारियों को बाहर निकलने दें, फिर अंदर कदम रखें।',
      rule3Title: '3. अपटाउन व डाउनटाउन ध्यान से देखें',
      rule3Desc: 'सड़क पर सबवे सीढ़ियों के ऊपर लिखा बोर्ड देखें कि यह उत्तर (Uptown) जा रही है या दक्षिण (Downtown)।',
    },
    te: {
      tag: 'MTA సబ్‌వే నెట్‌వర్క్',
      title: 'సబ్‌వే రూట్ & స్టేషన్ కాలిక్యులేటర్',
      sub: 'న్యూయార్క్ సబ్‌వే 472 స్టేషన్లతో ప్రతిరోజూ 40 లక్షల మందిని గమ్యస్థానాలకు చేరుస్తుంది. OMNY ద్వారా ఫోన్ ట్యాప్ చేసి సులభంగా ప్రయాణించండి.',
      plannerTitle: 'స్టేషన్-టు-స్టేషన్ రూట్ ప్లానర్',
      plannerSub: 'వేగవంతమైన రైలు లైన్లు మరియు ప్రయాణ సమయాన్ని లెక్కిస్తుంది.',
      depLabel: 'ప్రారంభ స్టేషన్ (Departure)',
      destLabel: 'గమ్యస్థాన స్టేషన్ (Destination)',
      fastest: 'వేగవంతమైన రైలు లైన్లు:',
      noTickets: 'టికెట్ కోసం లైన్‌లో నిలబడనవసరం లేదు — ఫోన్ లేదా కార్డుతో $2.90 ట్యాప్ చేయండి',
      askAIDir: 'AI ని పూర్తి వివరాలు అడగండి',
      greenGlobeTitle: 'గ్రీన్ గ్లోబ్ (Green Globe) నియమం',
      greenGlobeDesc: 'వీధిలో ఆకుపచ్చ లైట్ ఉన్న సబ్‌వే ఎంట్రన్స్ 24 గంటలు తెరిచి ఉంటాయి. ఎరుపు లైట్లు ఉన్నవి కేవలం ఎగ్జిట్ మాత్రమే.',
      omnyTitle: 'OMNY కాంటాక్ట్‌లెస్ ఫేర్ సిస్టమ్',
      rule1Title: '1. కుడి వైపున నిలబడండి',
      rule1Desc: 'ఎస్కేలేటర్లపై ఎల్లప్పుడూ కుడి వైపున నిలబడండి. ఎడమ వైపు వేగంగా నడిచేవారికి వదిలివేయండి.',
      rule2Title: '2. మొదట దిగనివ్వండి',
      rule2Desc: 'రైలు తలుపులు తెరిచినప్పుడు ప్రయాణికులు దిగే వరకు వేచి ఉండి, ఆపై లోపలికి వెళ్ళండి.',
      rule3Title: '3. అప్‌టౌన్ లేదా డౌన్‌టౌన్ చూడండి',
      rule3Desc: 'మెట్లు దిగే ముందు బోర్డుపై అప్‌టౌన్ (Uptown) లేదా డౌన్‌టౌన్ (Downtown) అని చూసి వెళ్ళండి.',
    },
  }[selectedLanguage];

  return (
    <div className="space-y-10 pb-16">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2 mb-1">
          <Train className="w-4 h-4 text-secondary-container" />
          <span>{labels.tag}</span>
          <span aria-hidden="true">·</span>
          <span>Live Line Pulses</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-primary tracking-tight">
          {labels.title}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          {labels.sub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calculator (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
            <div>
              <h2 className="text-lg font-bold font-display text-primary">
                {labels.plannerTitle}
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {labels.plannerSub}
              </p>
            </div>
            <div className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Flat $2.90 Fare
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                {labels.depLabel}
              </label>
              <select
                value={originStation}
                onChange={(e) => setOriginStation(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              >
                {NYC_STATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center -my-1">
              <button
                onClick={handleSwapStations}
                className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-colors"
                title="Swap stations"
                aria-label="Swap stations"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                {labels.destLabel}
              </label>
              <select
                value={destStation}
                onChange={(e) => setDestStation(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              >
                {NYC_STATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {calculatedRoute && !calculatedRoute.sameStation && (
            <div className="p-5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">
                    {labels.fastest}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {calculatedRoute.lines.map((l: string) => (
                      <span
                        key={l}
                        className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center font-mono shadow-xs"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs font-mono font-semibold text-primary">
                  ~{calculatedRoute.minutes} mins · {calculatedRoute.stops} stops
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-on-surface">
                  <span className="font-semibold text-primary shrink-0">Transfer:</span>
                  <span>{calculatedRoute.transfer}</span>
                </div>
                <div className="flex items-start gap-2 text-on-surface-variant">
                  <span className="font-semibold text-primary shrink-0">Tip:</span>
                  <span>{calculatedRoute.advisory}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">
                  {labels.noTickets}
                </span>
                <button
                  onClick={() =>
                    onAskAI(
                      `How do I travel from ${originStation} to ${destStation} on the NYC subway? Give me line directions.`
                    )
                  }
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  {labels.askAIDir} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Visual Showcase Card & OMNY (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl overflow-hidden border border-outline-variant/40 bg-primary shadow-xs">
            <div className="relative h-48 w-full">
              <img
                src={NYC_IMAGE_ASSETS.subway}
                alt="New York City subway station entrance"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="text-[11px] font-semibold text-secondary-container uppercase">
                  {labels.greenGlobeTitle}
                </div>
                <h3 className="text-base font-bold font-display text-white">
                  24/7 Kinetic Subway Circulation
                </h3>
              </div>
            </div>

            <div className="p-5 text-surface-container-high space-y-3 text-xs leading-relaxed">
              <p>{labels.greenGlobeDesc}</p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-secondary-container font-mono text-[11px]">
                <span>OMNY Fare: $2.90</span>
                <span>Free 2-Hour Transfer</span>
              </div>
            </div>
          </div>

          {/* OMNY Quick Guide Box */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm font-display">
              <CreditCard className="w-4 h-4 text-secondary-container" />
              {labels.omnyTitle}
            </div>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>
                  <strong>Tap with any device:</strong> Apple Pay, Google Pay, or contactless credit card ($2.90 flat fare).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>
                  <strong>12-Ride Weekly Fare Cap:</strong> After 12 paid rides ($34.80) with the same card/phone in a Monday–Sunday window, all subsequent rides that week are automatically 100% free!
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Line Matrix */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold font-display text-primary">
            Subway Line Status & Borough Matrix
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Real-time trunk route indicators and borough connections across all lines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUBWAY_LINES.map((line) => {
            const isGood = line.status === 'Good Service';
            return (
              <div
                key={line.id}
                className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {line.bullets.map((b) => (
                        <span
                          key={b}
                          style={{ backgroundColor: line.color, color: line.textColor }}
                          className="w-6 h-6 rounded-full font-mono text-xs font-extrabold flex items-center justify-center shadow-xs"
                        >
                          {b}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium">
                      {isGood ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span className={isGood ? 'text-emerald-700' : 'text-amber-700'}>
                        {line.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-primary">{line.name}</h3>

                  <p className="mt-1 text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                    {line.statusDetails}
                  </p>
                </div>

                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
                  <span>{line.boroughs.join(' · ')}</span>
                  <span className="font-semibold text-primary">{line.express ? 'Express' : 'Local'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Etiquette Rules */}
      <section className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
        <h3 className="text-sm font-bold font-display text-primary flex items-center gap-2">
          <Compass className="w-4 h-4 text-secondary-container" />
          The Unwritten Subway Etiquette of New York
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-on-surface-variant">
          <div>
            <h4 className="font-bold text-on-surface mb-1">{labels.rule1Title}</h4>
            <p className="leading-relaxed">{labels.rule1Desc}</p>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-1">{labels.rule2Title}</h4>
            <p className="leading-relaxed">{labels.rule2Desc}</p>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-1">{labels.rule3Title}</h4>
            <p className="leading-relaxed">{labels.rule3Desc}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
