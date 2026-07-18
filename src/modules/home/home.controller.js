const R = require('../../utils/response');
const env = require('../../config/env');

const quickServices = async (req, res, next) => {
  try {
    const services = [
      { id: 'birth_cert', label: { mr: 'जन्म दाखला', hi: 'जन्म प्रमाणपत्र', en: 'Birth Certificate' }, icon: 'person-add', color: '#3b82f6', route: '/(modals)/service/birth', is_active: true, order: 1, badge: null },
      { id: 'property_tax', label: { mr: 'मालमत्ता कर', hi: 'संपत्ति कर', en: 'Property Tax' }, icon: 'home', color: '#f59e0b', route: '/(tabs)/payments', is_active: true, order: 2, badge: null },
      { id: 'complaints', label: { mr: 'तक्रारी', hi: 'शिकायतें', en: 'Complaints' }, icon: 'alert-circle', color: '#ef4444', route: '/(tabs)/complaints', is_active: true, order: 3, badge: null },
      { id: 'schemes', label: { mr: 'योजना', hi: 'योजनाएं', en: 'Schemes' }, icon: 'star', color: '#8b5cf6', route: '/(modals)/schemes', is_active: true, order: 4, badge: null },
      { id: 'gram_sabha', label: { mr: 'ग्रामसभा', hi: 'ग्राम सभा', en: 'Gram Sabha' }, icon: 'people', color: '#10b981', route: '/(modals)/gram-sabha', is_active: true, order: 5, badge: null },
      { id: 'ai_assistant', label: { mr: 'एआय सहाय्यक', hi: 'एआई सहायक', en: 'AI Assistant' }, icon: 'sparkles', color: '#06b6d4', route: '/(modals)/ai-assistant', is_active: true, order: 6, badge: null },
      { id: 'emergency', label: { mr: 'आपत्कालीन', hi: 'आपातकालीन', en: 'Emergency' }, icon: 'medkit', color: '#dc2626', route: '/(modals)/emergency', is_active: true, order: 7, badge: null },
      { id: 'directory', label: { mr: 'निर्देशिका', hi: 'निर्देशिका', en: 'Directory' }, icon: 'book', color: '#0F4C35', route: '/(modals)/directory', is_active: true, order: 8, badge: null },
    ];
    return R.success(res, 'Quick services fetched', services);
  } catch (e) { next(e); }
};

const emergencyContacts = async (req, res, next) => {
  try {
    const contacts = [
      { id: 'ambulance', label: { mr: 'रुग्णवाहिका', hi: 'एम्बुलेंस', en: 'Ambulance' }, number: '108', icon: 'medkit', colors: ['#dc2626', '#ef4444'], description: { mr: 'राष्ट्रीय रुग्णवाहिका सेवा', hi: 'राष्ट्रीय एम्बुलेंस सेवा', en: 'National Ambulance Service' }, pulse: true, order: 1 },
      { id: 'police', label: { mr: 'पोलीस', hi: 'पुलिस', en: 'Police' }, number: '100', icon: 'shield', colors: ['#1d4ed8', '#3b82f6'], description: { mr: 'पोलीस नियंत्रण कक्ष', hi: 'पुलिस कंट्रोल रूम', en: 'Police Control Room' }, pulse: false, order: 2 },
      { id: 'fire', label: { mr: 'अग्निशमन', hi: 'अग्निशमन', en: 'Fire Brigade' }, number: '101', icon: 'flame', colors: ['#ea580c', '#f97316'], description: { mr: 'अग्निशमन विभाग', hi: 'अग्निशमन विभाग', en: 'Fire Department' }, pulse: false, order: 3 },
      { id: 'disaster', label: { mr: 'आपत्ती व्यवस्थापन', hi: 'आपदा प्रबंधन', en: 'Disaster Management' }, number: '1077', icon: 'warning', colors: ['#d97706', '#f59e0b'], description: { mr: 'राज्य आपत्ती नियंत्रण', hi: 'राज्य आपदा नियंत्रण', en: 'State Disaster Control' }, pulse: false, order: 4 },
    ];
    return R.success(res, 'Emergency contacts fetched', contacts);
  } catch (e) { next(e); }
};

const appConfig = async (req, res, next) => {
  try {
    return R.success(res, 'App config fetched', {
      min_supported_version: '1.0.0',
      latest_version:        env.app.version || '1.0.0',
      force_update:          false,
      privacy_policy_url:    'https://smartpanchayat.co.in/privacy-policy',
      terms_url:             'https://smartpanchayat.co.in/terms',
      play_store_url:        'https://play.google.com/store/apps/details?id=com.nexbuild.smartpanchayat',
      app_store_url:         'https://apps.apple.com/app/smart-panchayat',
      support_phone:         '020-12345678',
      support_email:         'support@smartpanchayat.co.in',
    });
  } catch (e) { next(e); }
};

module.exports = { quickServices, emergencyContacts, appConfig };
