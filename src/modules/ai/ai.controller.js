const R = require('../../utils/response');
const logger = require('../../utils/logger')('ai.controller');

// Intent patterns — keyword → response + suggestions
const INTENTS = [
  {
    keywords: ['पाणीपट्टी', 'water bill', 'पानी बिल', 'पाणी बिल', 'water tax', 'पाणी', 'पाणी भरा'],
    reply: {
      mr: 'तुम्ही Payments (देयके) स्क्रीनवर जाऊन थेट UPI द्वारे पाणीपट्टी भरू शकता.',
      hi: 'आप Payments स्क्रीन पर जाकर UPI से पानी का बिल भर सकते हैं।',
      en: 'Go to the Payments screen to pay your water bill via UPI.',
    },
    suggestions: [
      { label: 'पाणीपट्टी भरा', route: '/(tabs)/payments' },
      { label: 'थकबाकी पाहा', route: '/(tabs)/payments' },
    ],
  },
  {
    keywords: ['तक्रार', 'complaint', 'शिकायत', 'problem', 'समस्या', 'रस्ता', 'road', 'गटार', 'drainage', 'दिवा', 'streetlight'],
    reply: {
      mr: 'तुम्ही Complaints (तक्रारी) स्क्रीनवर तक्रार नोंदवू शकता. फोटो टाकल्यास लवकर प्रतिसाद मिळतो.',
      hi: 'आप Complaints स्क्रीन पर शिकायत दर्ज कर सकते हैं। फोटो जोड़ने से जल्दी जवाब मिलेगा।',
      en: 'File a complaint on the Complaints screen. Adding a photo gets faster response.',
    },
    suggestions: [
      { label: 'तक्रार नोंदवा', route: '/(tabs)/complaints' },
      { label: 'माझ्या तक्रारी', route: '/(tabs)/complaints' },
    ],
  },
  {
    keywords: ['दाखला', 'certificate', 'प्रमाणपत्र', 'birth', 'जन्म', 'death', 'मृत्यू', 'income', 'उत्पन्न', 'residence', 'रहिवासी', 'marriage', 'विवाह'],
    reply: {
      mr: 'दाखल्यासाठी Services (सेवा) स्क्रीनवर जा. जन्म, मृत्यू, उत्पन्न, रहिवासी, विवाह दाखले ऑनलाइन मिळतात.',
      hi: 'प्रमाणपत्र के लिए Services स्क्रीन पर जाएं। जन्म, मृत्यु, आय, निवास, विवाह प्रमाणपत्र ऑनलाइन मिलते हैं।',
      en: 'Visit the Services screen for certificates. Birth, death, income, residence, marriage certificates available online.',
    },
    suggestions: [
      { label: 'दाखला अर्ज करा', route: '/(modals)/schemes' },
      { label: 'माझे दाखले', route: '/(modals)/my-documents' },
    ],
  },
  {
    keywords: ['योजना', 'scheme', 'सरकारी', 'government', 'yojana', 'लाभ', 'benefit'],
    reply: {
      mr: 'सरकारी योजनांसाठी Schemes (योजना) स्क्रीनवर पाहा. तुम्हाला लागू होणाऱ्या योजना शोधा.',
      hi: 'सरकारी योजनाओं के लिए Schemes स्क्रीन देखें। अपने लिए उपयुक्त योजनाएं खोजें।',
      en: 'Check the Schemes screen for government schemes applicable to you.',
    },
    suggestions: [
      { label: 'योजना पाहा', route: '/(modals)/schemes' },
    ],
  },
  {
    keywords: ['ग्रामसभा', 'gram sabha', 'meeting', 'बैठक', 'सभा', 'poll', 'vote', 'मतदान'],
    reply: {
      mr: 'ग्रामसभा स्क्रीनवर येणाऱ्या बैठका, त्यांचा कार्यक्रम आणि मतदान पाहता येतात.',
      hi: 'ग्राम सभा स्क्रीन पर आगामी बैठकें, एजेंडा और मतदान देख सकते हैं।',
      en: 'The Gram Sabha screen shows upcoming meetings, agenda, and polls.',
    },
    suggestions: [
      { label: 'ग्रामसभा', route: '/(modals)/gram-sabha' },
    ],
  },
  {
    keywords: ['profile', 'प्रोफाइल', 'account', 'खाते', 'login', 'logout', 'password', 'पासवर्ड'],
    reply: {
      mr: 'तुमच्या खात्याशी संबंधित माहिती Profile (प्रोफाइल) स्क्रीनवर आहे.',
      hi: 'आपके खाते की जानकारी Profile स्क्रीन पर है।',
      en: 'Your account details are on the Profile screen.',
    },
    suggestions: [
      { label: 'प्रोफाइल पाहा', route: '/(tabs)/profile' },
    ],
  },
  {
    keywords: ['notice', 'नोटीस', 'सूचना', 'announcement', 'जाहीर'],
    reply: {
      mr: 'ग्रामपंचायतीच्या सर्व नोटीसा आणि जाहीरनामे Notices (सूचना) स्क्रीनवर पाहा.',
      hi: 'ग्राम पंचायत की सभी सूचनाएं Notices स्क्रीन पर देखें।',
      en: 'All panchayat notices and announcements are on the Notices screen.',
    },
    suggestions: [
      { label: 'सूचना पाहा', route: '/(tabs)/notices' },
    ],
  },
];

const DEFAULT_REPLY = {
  mr: 'माझ्याकडे तुमच्या प्रश्नाचे उत्तर नाही. कृपया ग्रामपंचायत कार्यालयाशी संपर्क साधा.',
  hi: 'मुझे आपके प्रश्न का उत्तर नहीं मिला। कृपया ग्राम पंचायत कार्यालय से संपर्क करें।',
  en: 'I could not find an answer. Please contact the Gram Panchayat office directly.',
};

const DEFAULT_SUGGESTIONS = [
  { label: 'सेवा पाहा',    route: '/(modals)/schemes' },
  { label: 'तक्रार नोंदवा', route: '/(tabs)/complaints' },
];

const chat = async (req, res, next) => {
  try {
    const { message = '', lang = 'mr' } = req.body;
    const lower = message.toLowerCase();

    logger.debug('ai chat', { citizenId: req.user?.id, lang, messageLen: message.length });

    const intent = INTENTS.find(i =>
      i.keywords.some(kw => lower.includes(kw.toLowerCase()))
    );

    const replyText = intent ? (intent.reply[lang] || intent.reply.en) : (DEFAULT_REPLY[lang] || DEFAULT_REPLY.en);
    const suggestions = intent ? intent.suggestions : DEFAULT_SUGGESTIONS;

    return R.success(res, 'Reply generated', { reply: replyText, suggestions });
  } catch (e) { next(e); }
};

module.exports = { chat };
