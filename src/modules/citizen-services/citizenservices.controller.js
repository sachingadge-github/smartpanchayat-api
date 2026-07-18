const R = require('../../utils/response');

const CATALOG = [
  {
    id: 'birth',
    label: { mr: 'जन्म दाखला', hi: 'जन्म प्रमाणपत्र', en: 'Birth Certificate' },
    icon: 'person-add', color: '#3b82f6', route: '/(modals)/service/birth',
    category: 'certificate', time: '7 days', is_active: true, order: 1,
    fee: 50, fee_display: '₹50', processing_days: 7,
    processing_display: { mr: '७ कामकाजाचे दिवस', hi: '7 कार्य दिवस', en: '7 working days' },
    required_documents: [
      { mr: 'आधार कार्ड', hi: 'आधार कार्ड', en: 'Aadhaar Card' },
      { mr: 'रुग्णालय जन्म नोंद', hi: 'अस्पताल जन्म रिकॉर्ड', en: 'Hospital birth record' },
    ],
    process_steps: [
      { mr: 'अर्ज भरा', hi: 'आवेदन भरें', en: 'Fill the application form' },
      { mr: 'कागदपत्रे अपलोड करा', hi: 'दस्तावेज़ अपलोड करें', en: 'Upload required documents' },
      { mr: 'शुल्क भरा', hi: 'शुल्क भुगतान करें', en: 'Pay the fee' },
      { mr: 'दाखला डाउनलोड करा', hi: 'प्रमाणपत्र डाउनलोड करें', en: 'Download certificate' },
    ],
    is_online: true,
  },
  {
    id: 'death',
    label: { mr: 'मृत्यू दाखला', hi: 'मृत्यु प्रमाणपत्र', en: 'Death Certificate' },
    icon: 'flower', color: '#6b7280', route: '/(modals)/service/death',
    category: 'certificate', time: '7 days', is_active: true, order: 2,
    fee: 50, fee_display: '₹50', processing_days: 7,
    processing_display: { mr: '७ कामकाजाचे दिवस', hi: '7 कार्य दिवस', en: '7 working days' },
    required_documents: [
      { mr: 'आधार कार्ड', hi: 'आधार कार्ड', en: 'Aadhaar Card' },
      { mr: 'रुग्णालय मृत्यू नोंद', hi: 'अस्पताल मृत्यु रिकॉर्ड', en: 'Hospital death record' },
    ],
    process_steps: [
      { mr: 'अर्ज भरा', hi: 'आवेदन भरें', en: 'Fill the application form' },
      { mr: 'कागदपत्रे अपलोड करा', hi: 'दस्तावेज़ अपलोड करें', en: 'Upload required documents' },
      { mr: 'दाखला डाउनलोड करा', hi: 'प्रमाणपत्र डाउनलोड करें', en: 'Download certificate' },
    ],
    is_online: true,
  },
  {
    id: 'marriage',
    label: { mr: 'विवाह दाखला', hi: 'विवाह प्रमाणपत्र', en: 'Marriage Certificate' },
    icon: 'heart', color: '#ec4899', route: '/(modals)/service/marriage',
    category: 'certificate', time: '10 days', is_active: true, order: 3,
    fee: 100, fee_display: '₹100', processing_days: 10,
    processing_display: { mr: '१० कामकाजाचे दिवस', hi: '10 कार्य दिवस', en: '10 working days' },
    required_documents: [
      { mr: 'दोन्ही पक्षांचे आधार कार्ड', hi: 'दोनों पक्षों का आधार कार्ड', en: 'Aadhaar Cards of both parties' },
      { mr: 'विवाह फोटो', hi: 'विवाह की फ़ोटो', en: 'Wedding photographs' },
    ],
    process_steps: [
      { mr: 'अर्ज भरा', hi: 'आवेदन भरें', en: 'Fill the application form' },
      { mr: 'कागदपत्रे अपलोड करा', hi: 'दस्तावेज़ अपलोड करें', en: 'Upload required documents' },
      { mr: 'शुल्क भरा', hi: 'शुल्क भुगतान करें', en: 'Pay the fee' },
      { mr: 'दाखला डाउनलोड करा', hi: 'प्रमाणपत्र डाउनलोड करें', en: 'Download certificate' },
    ],
    is_online: true,
  },
  {
    id: 'income',
    label: { mr: 'उत्पन्न दाखला', hi: 'आय प्रमाणपत्र', en: 'Income Certificate' },
    icon: 'cash', color: '#22c55e', route: '/(modals)/service/income',
    category: 'certificate', time: '3 days', is_active: true, order: 4,
    fee: 20, fee_display: '₹20', processing_days: 3,
    processing_display: { mr: '३ कामकाजाचे दिवस', hi: '3 कार्य दिवस', en: '3 working days' },
    required_documents: [
      { mr: 'आधार कार्ड', hi: 'आधार कार्ड', en: 'Aadhaar Card' },
      { mr: 'रेशन कार्ड', hi: 'राशन कार्ड', en: 'Ration Card' },
    ],
    process_steps: [
      { mr: 'अर्ज भरा', hi: 'आवेदन भरें', en: 'Fill the application form' },
      { mr: 'उत्पन्नाचा तपशील भरा', hi: 'आय का विवरण दर्ज करें', en: 'Enter income details' },
      { mr: 'दाखला डाउनलोड करा', hi: 'प्रमाणपत्र डाउनलोड करें', en: 'Download certificate' },
    ],
    is_online: true,
  },
  {
    id: 'residence',
    label: { mr: 'रहिवासी दाखला', hi: 'निवास प्रमाणपत्र', en: 'Residence Certificate' },
    icon: 'location', color: '#f97316', route: '/(modals)/service/residence',
    category: 'certificate', time: '5 days', is_active: true, order: 5,
    fee: 20, fee_display: '₹20', processing_days: 5,
    processing_display: { mr: '५ कामकाजाचे दिवस', hi: '5 कार्य दिवस', en: '5 working days' },
    required_documents: [
      { mr: 'आधार कार्ड', hi: 'आधार कार्ड', en: 'Aadhaar Card' },
      { mr: 'रेशन कार्ड', hi: 'राशन कार्ड', en: 'Ration Card' },
    ],
    process_steps: [
      { mr: 'अर्ज भरा', hi: 'आवेदन भरें', en: 'Fill the application form' },
      { mr: 'पत्त्याचा पुरावा अपलोड करा', hi: 'पता प्रमाण अपलोड करें', en: 'Upload address proof' },
      { mr: 'दाखला डाउनलोड करा', hi: 'प्रमाणपत्र डाउनलोड करें', en: 'Download certificate' },
    ],
    is_online: true,
  },
  {
    id: 'property',
    label: { mr: 'मालमत्ता दाखला', hi: 'संपत्ति प्रमाणपत्र', en: 'Property Certificate' },
    icon: 'home', color: '#f59e0b', route: '/(modals)/service/property',
    category: 'certificate', time: 'Instant', is_active: true, order: 6,
    fee: 0, fee_display: 'Free', processing_days: 0,
    processing_display: { mr: 'तात्काळ', hi: 'तत्काल', en: 'Instant' },
    required_documents: [
      { mr: 'आधार कार्ड', hi: 'आधार कार्ड', en: 'Aadhaar Card' },
      { mr: 'मालमत्ता नोंदणी क्रमांक', hi: 'संपत्ति पंजीकरण संख्या', en: 'Property registration number' },
    ],
    process_steps: [
      { mr: 'मालमत्ता क्रमांक टाका', hi: 'संपत्ति संख्या दर्ज करें', en: 'Enter property number' },
      { mr: 'दाखला डाउनलोड करा', hi: 'प्रमाणपत्र डाउनलोड करें', en: 'Download certificate' },
    ],
    is_online: true,
  },
  {
    id: 'water',
    label: { mr: 'पाणीपट्टी', hi: 'जल कर', en: 'Water Tax' },
    icon: 'water', color: '#06b6d4', route: '/(modals)/service/water',
    category: 'tax', time: 'Instant', is_active: true, order: 7,
    fee: 0, fee_display: 'As per bill', processing_days: 0,
    processing_display: { mr: 'तात्काळ', hi: 'तत्काल', en: 'Instant' },
    required_documents: [],
    process_steps: [
      { mr: 'बिल निवडा', hi: 'बिल चुनें', en: 'Select your bill' },
      { mr: 'यूपीआय द्वारे भरा', hi: 'UPI से भुगतान करें', en: 'Pay via UPI' },
      { mr: 'पावती डाउनलोड करा', hi: 'रसीद डाउनलोड करें', en: 'Download receipt' },
    ],
    is_online: true,
  },
  {
    id: 'receipt',
    label: { mr: 'कागदपत्र डाउनलोड', hi: 'दस्तावेज़ डाउनलोड', en: 'Download Document' },
    icon: 'download', color: '#8b5cf6', route: '/(modals)/my-documents',
    category: 'certificate', time: 'Instant', is_active: true, order: 8,
    fee: 0, fee_display: 'Free', processing_days: 0,
    processing_display: { mr: 'तात्काळ', hi: 'तत्काल', en: 'Instant' },
    required_documents: [],
    process_steps: [
      { mr: 'माझी कागदपत्रे उघडा', hi: 'मेरे दस्तावेज़ खोलें', en: 'Open My Documents' },
      { mr: 'पीडीएफ डाउनलोड करा', hi: 'PDF डाउनलोड करें', en: 'Download PDF' },
    ],
    is_online: true,
  },
];

const CATEGORIES = [
  { id: 'all',         label: { mr: 'सर्व',    hi: 'सभी',       en: 'All' } },
  { id: 'certificate', label: { mr: 'दाखले',   hi: 'प्रमाणपत्र', en: 'Certificates' } },
  { id: 'tax',         label: { mr: 'कर',      hi: 'कर',         en: 'Tax' } },
];

const list = async (req, res, next) => {
  try {
    const { panchayat_id, category } = req.query;
    let services = CATALOG.filter(s => s.is_active);
    if (category && category !== 'all') services = services.filter(s => s.category === category);
    return R.success(res, 'Citizen services fetched', {
      panchayat_id: panchayat_id || null,
      citizen_services: services,
      categories: CATEGORIES,
    });
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const service = CATALOG.find(s => s.id === req.params.id);
    if (!service) return R.notFound(res, 'Service not found');
    return R.success(res, 'Service fetched', service);
  } catch (e) { next(e); }
};

module.exports = { list, getById };
