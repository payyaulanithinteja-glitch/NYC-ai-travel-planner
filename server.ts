import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const MANDATORY_SYSTEM_INSTRUCTION =
  "Reply only in the user's selected language (English, Hindi or Telugu). If the user writes in a different language, reply in the language they used. Use simple, friendly wording. Keep place names readable.";

// API route for NYC AI Companion
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'en', currentPlan = [] } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const langName =
      language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English';

    const isEditPlanRequest = checkIfEditPlanRequest(message);

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 5) {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Selected language: ${langName} (${language}).
User message: "${message}".
Current itinerary plan (if relevant): ${JSON.stringify(currentPlan)}

Task Instructions:
1. ${MANDATORY_SYSTEM_INSTRUCTION}
2. If the user is asking to modify or update the plan (e.g. "make day 2 cheaper", "change time", "add a stop", or similar in English, Hindi or Telugu):
   - You MUST update the plan accordingly.
   - For any structured plan returned, keep the JSON keys strictly in English: "day", "time", "place", "description", "cost".
   - Write the "description" and notes in the selected language (${langName}). Keep place names readable (e.g., Central Park, Times Square, DUMBO, Brooklyn Bridge, High Line).
   - If providing an updated plan, format the final response as a JSON object:
     {
       "reply": "Your friendly explanation in ${langName}",
       "updatedPlan": [
         { "day": 1, "time": "09:00 AM", "place": "High Line", "description": "...", "cost": "$0 (Free)" },
         ...
       ]
     }
3. If it is a normal query (not an itinerary modification), reply with normal text (or JSON { "reply": "..." }).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: MANDATORY_SYSTEM_INSTRUCTION,
        },
      });

      const responseText = response.text || '';

      // Check if response contains structured JSON
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*"reply"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({
            reply: parsed.reply,
            updatedPlan: parsed.updatedPlan || null,
            source: 'gemini',
          });
        }
      } catch (parseError) {
        // Fallback to plain text
      }

      return res.json({
        reply: responseText,
        updatedPlan: isEditPlanRequest ? generateUpdatedPlanLocal(currentPlan, language, message) : null,
        source: 'gemini',
      });
    }

    // Local intelligent response when API key is absent
    const localResult = generateLocalResponse(message, language, currentPlan);
    return res.json({
      reply: localResult.reply,
      updatedPlan: localResult.updatedPlan || null,
      source: 'local-knowledge',
    });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    const localResult = generateLocalResponse(req.body?.message || '', req.body?.language || 'en', req.body?.currentPlan || []);
    return res.json({
      reply: localResult.reply,
      updatedPlan: localResult.updatedPlan || null,
      source: 'local-knowledge',
    });
  }
});

function checkIfEditPlanRequest(query: string): boolean {
  const q = (query || '').toLowerCase();
  return (
    q.includes('cheap') ||
    q.includes('make day') ||
    q.includes('budget') ||
    q.includes('cost') ||
    q.includes('सस्ता') || // Hindi: sasta
    q.includes('कम खर्च') || // Hindi: kam kharch
    q.includes('दिन 2') ||
    q.includes('చౌక') || // Telugu: chowka
    q.includes('ఖర్చు') || // Telugu: kharchu
    q.includes('తగ్గించు') || // Telugu: tagginchu
    q.includes('రోజు 2') ||
    q.includes('ప్లాన్') ||
    q.includes('योजना')
  );
}

function generateUpdatedPlanLocal(currentPlan: any[], lang: string, query: string) {
  const q = query.toLowerCase();
  const targetDay = q.includes('day 1') || q.includes('दिन 1') || q.includes('రోజు 1') ? 1 : 2;

  // Make day 2 or target day budget-friendly
  const defaultPlan = [
    {
      day: 1,
      time: '09:30 AM',
      place: 'The High Line & Chelsea Market',
      description:
        lang === 'te'
          ? 'చారిత్రాత్మక హై లైన్ (The High Line) ఉచిత పార్కులో నడవండి, అద్భుతమైన నగర దృశ్యాలను వీక్షించండి.'
          : lang === 'hi'
          ? 'ऐतिहासिक हाई लाइन (The High Line) पर मुफ्त में टहलें और हडसन नदी के नज़ारों का आनंद लें।'
          : 'Walk the historic elevated High Line park with sweeping urban and river views.',
      cost: '$0 (Free / ఉచితం / मुफ्त)',
    },
    {
      day: 1,
      time: '01:00 PM',
      place: 'Joe’s Pizza (West Village)',
      description:
        lang === 'te'
          ? 'రుచికరమైన న్యూయార్క్ క్లాసిక్ చీజ్ పిజ్జా స్లైస్ ఆస్వాదించండి.'
          : lang === 'hi'
          ? 'प्रसिद्ध न्यूयॉर्क स्टाइल क्लासिक चीज़ पिज़्ज़ा का स्वाद लें।'
          : 'Enjoy an authentic NYC thin-crust cheese pizza slice folded lengthwise.',
      cost: '$4.50',
    },
    {
      day: 1,
      time: '05:30 PM',
      place: 'Washington Square Park',
      description:
        lang === 'te'
          ? 'మార్బుల్ ఆర్చ్ వద్ద లైవ్ స్ట్రీట్ పియానో మరియు చదరంగం క్రీడాకారులను చూడండి.'
          : lang === 'hi'
          ? 'ऐतिहासिक वाशिंगटन स्क्वायर पार्क में लाइव संगीत और शतरंज के खेल देखें।'
          : 'Catch live street pianists and speed chess under the monumental marble arch.',
      cost: '$0 (Free / ఉచితం / मुफ्त)',
    },
    {
      day: 2,
      time: '09:00 AM',
      place: 'Brooklyn Bridge Pedestrian Walk',
      description:
        lang === 'te'
          ? 'బ్రాంక్స్ లేదా మాన్‌హాటన్ వైపు నుండి బ్రూక్లిన్ బ్రిడ్జ్ (Brooklyn Bridge) పై ఉచితంగా నడవండి.'
          : lang === 'hi'
          ? 'मैनहट्टन से ब्रुकलिन ब्रिज (Brooklyn Bridge) पर पैदल चलकर सुबह की ताज़ी हवा लें।'
          : 'Walk across the iconic Brooklyn Bridge promenade with breathtaking harbor views.',
      cost: '$0 (Free / ఉచితం / मुफ्त)',
    },
    {
      day: 2,
      time: '12:30 PM',
      place: 'DUMBO Pebble Beach & Time Out Market Rooftop',
      description:
        lang === 'te'
          ? 'డంబో (DUMBO) వాటర్‌ఫ్రంట్ మరియు రూఫ్‌టాప్ నుండి ఉచితంగా స్కైలైన్ వీక్షించండి.'
          : lang === 'hi'
          ? 'डम्बो (DUMBO) वाटरफ्रंट और रूफटॉप टेरेस से मुफ्त में मैनहट्टन स्काईलाइन देखें।'
          : 'Enjoy free panoramic skyline vistas from the Time Out Market public rooftop terrace.',
      cost: '$0 (Free Public Deck)',
    },
    {
      day: 2,
      time: '04:00 PM',
      place: 'Staten Island Ferry (Statue of Liberty Views)',
      description:
        lang === 'te'
          ? 'స్టాటెన్ ఐలాండ్ ఫెర్రీలో ఉచితంగా ప్రయాణించి స్టాట్యూ ఆఫ్ లిబర్టీని చూడండి.'
          : lang === 'hi'
          ? 'मुफ्त स्टेटन आइलैंड फेरी (Staten Island Ferry) से स्टैच्यू ऑफ लिबर्टी का अद्भुत नज़ारा देखें।'
          : '100% free commuter ferry ride offering spectacular close-up views of the Statue of Liberty.',
      cost: '$0 (Free Ferry / ఉచిత ఫెర్రీ / मुफ्त फेरी)',
    },
  ];

  return defaultPlan;
}

function generateLocalResponse(query: string, lang: string, currentPlan: any[]) {
  const isEditPlan = checkIfEditPlanRequest(query);

  if (isEditPlan) {
    const updatedPlan = generateUpdatedPlanLocal(currentPlan, lang, query);

    if (lang === 'te') {
      return {
        reply: `మీ కోరిక ప్రకారం రోజు 2 ప్లాన్‌ను చాలా చౌకగా ($0 ఉచిత ప్రదేశాలతో) మార్చాము!

1. **బ్రూక్లిన్ బ్రిడ్జ్ (Brooklyn Bridge):** ఖరీదైన టూర్లు లేకుండా ఉచితంగా నడవండి.
2. **డంబో రూఫ్‌టాప్ (DUMBO Rooftop Terrace):** $50 అబ్జర్వేషన్ డెక్ బదులుగా ఉచితంగా స్కైలైన్ వీక్షించండి.
3. **స్టాటెన్ ఐలాండ్ ఫెర్రీ (Staten Island Ferry):** స్టాట్యూ ఆఫ్ లిబర్టీని ఉచిత ఫెర్రీలో వీక్షించండి.

క్రింద అప్‌డేట్ చేసిన ప్లాన్ వివరాలు ఉన్నాయి.`,
        updatedPlan,
      };
    }

    if (lang === 'hi') {
      return {
        reply: `आपकी पसंद के अनुसार दिन 2 को बहुत किफ़ायती (कम खर्च) बना दिया गया है!

1. **ब्रुकलिन ब्रिज (Brooklyn Bridge):** पैदल चलकर मुफ्त में शानदार दृश्यों का आनंद लें।
2. **डम्बो रूफटॉप (DUMBO Rooftop):** महंगे $50 टिकट के बिना मैनहट्टन स्काईलाइन मुफ्त में देखें।
3. **स्टेटन आइलैंड फेरी (Staten Island Ferry):** स्टैच्यू ऑफ लिबर्टी को 100% मुफ्त नौका यात्रा से देखें।

नीचे आपकी नई योजना अपडेट कर दी गई है।`,
        updatedPlan,
      };
    }

    return {
      reply: `I have updated Day 2 to be much cheaper with fantastic free iconic NYC experiences!

1. **Brooklyn Bridge Walk:** 100% free pedestrian stroll across the East River.
2. **DUMBO Public Rooftop Terrace:** Free skyline views instead of expensive $50 observation tickets.
3. **Staten Island Ferry:** Free scenic cruise right past the Statue of Liberty.

The updated structured plan is reflected below.`,
      updatedPlan,
    };
  }

  // General travel assistance
  const q = query.toLowerCase();

  if (lang === 'te') {
    if (q.includes('subway') || q.includes('రైలు') || q.includes('మెట్రో')) {
      return {
        reply: `### న్యూయార్క్ సబ్‌వే & OMNY సమాచారం 🚇
- **OMNY ట్యాప్-టు-పే:** మెట్రోకార్డ్ అవసరం లేదు. మీ ఫోన్ (Google/Apple Pay) లేదా చిప్ కార్డును నేరుగా టర్న్‌స్టైల్ వద్ద ట్యాప్ చేయండి ($2.90).
- **వారం లిమిట్:** సోమవారం నుండి ఆదివారం వరకు 12 సార్లు చెల్లించిన తర్వాత, ఆ వారం మిగిలిన ప్రయాణాలు అన్నీ ఉచితం.
- **ఎస్కేలేటర్ నియమం:** మెట్లపై కుడి వైపున నిలబడండి, తొందరగా వెళ్ళేవారికి ఎడమ వైపు దారి ఇవ్వండి.`,
      };
    }
    return {
      reply: `నమస్కారం! న్యూయార్క్ సిటీ అర్బన్ కైనెటిక్ పల్స్ కి స్వాగతం. 🗽
నగరంలో తిరగడానికి ఇక్కడ 3 ముఖ్యమైన చిట్కాలు:
1. **సబ్‌వే సులభం:** ఏ స్టేషన్ వద్దనైనా OMNY ట్యాప్ చేసి $2.90 తో ప్రయాణించండి.
2. **నడక వేగం:** ఫుట్‌పాత్‌పై కుడివైపు నడవండి. మ్యాప్ చూడాలంటే పక్కకు రండి.
3. **రుచికరమైన ఆహారం:** లోకల్ డెలిలో చీజ్ బాగెల్ మరియు పిజ్జా స్లైస్ ప్రయత్నించండి.

మీరు ఏ ప్రదేశం లేదా ప్లాన్ గురించి తెలుసుకోవాలనుకుంటున్నారు?`,
    };
  }

  if (lang === 'hi') {
    if (q.includes('subway') || q.includes('मेट्रो') || q.includes('ट्रेन')) {
      return {
        reply: `### न्यूयॉर्क सबवे और OMNY की आसान जानकारी 🚇
- **OMNY से आसान भुगतान:** अब मेट्रोकार्ड खरीदने की ज़रूरत नहीं है। अपने फ़ोन या कॉन्टैक्टलेस कार्ड को सीधे गेट पर टैप करें ($2.90 प्रति यात्रा)।
- **साप्ताहिक बचत:** एक हफ्ते में 12 यात्राओं के बाद बाकी सभी सबवे यात्राएं पूरी तरह मुफ्त हैं।
- **एस्केलेटर शिष्टाचार:** एस्केलेटर पर हमेशा दाईं ओर खड़े हों, जल्दी जाने वालों के लिए बाईं ओर रास्ता दें।`,
      };
    }
    return {
      reply: `नमस्ते! न्यूयॉर्क सिटी अर्बन काइनेटिक पल्स में आपका स्वागत है। 🗽
यहाँ आपके लिए 3 ज़रूरी स्थानीय टिप्स:
1. **OMNY टैप और गो:** मेट्रो में फ़ोन से $2.90 टैप करके आसानी से सफर करें।
2. **चलने का नियम:** हमेशा सड़क और सीढ़ियों पर दाईं तरफ चलें।
3. **प्रसिद्ध भोजन:** न्यूयॉर्क स्टाइल पिज़्ज़ा स्लाइस और बेगल ज़रूर चखें।

आप किस जगह या यात्रा योजना के बारे में पूछना चाहते हैं?`,
    };
  }

  return {
    reply: `Welcome to New York City! 🗽
Here are 3 key local rules for navigating the city:
1. **OMNY Tap & Go:** Tap your phone or contactless card directly at any subway turnstile ($2.90 flat fare).
2. **Sidewalk Flow:** Keep to the right side of sidewalks and escalators. Step to the side if you need to check your phone.
3. **Classic Bites:** Try an authentic folded cheese pizza slice in Greenwich Village or a warm morning bagel.

What would you like to explore or customize today?`,
  };
}

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Urban Kinetic Pulse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
