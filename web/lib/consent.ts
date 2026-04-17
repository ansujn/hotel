import { api, ApiError } from "./api";

export interface ConsentScope {
  channel: boolean;
  social: boolean;
  print: boolean;
  valid_months: 6 | 12 | 24;
}

export interface ConsentSignReq {
  otp?: string;
  signed_name?: string;
  scope: ConsentScope;
}

export interface ConsentContext {
  asset: {
    id: string;
    title: string;
    type: string;
    mux_playback_id?: string;
    thumbnail_url?: string;
    created_at: string;
  };
  student: { id: string; name: string };
  batch?: { id: string; name: string };
  parent_phone_masked?: string;
  expires_at?: string;
}

// GET /v1/consent/{token} — NOTE: endpoint not yet in openapi.yaml.
// Agent A (backend) will expose this. Until then, a 404 is expected and we
// show an "invalid / expired" state. If the backend returns 200 with shape
// above we render the full preview.
export async function getConsentContext(
  token: string,
): Promise<ConsentContext | null> {
  try {
    return await api<ConsentContext>(`/consent/${encodeURIComponent(token)}`);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 410)) {
      return null;
    }
    // Temporary: backend may not support GET on this path yet — treat any
    // non-2xx as "no context" and still let parent proceed with sign form.
    return null;
  }
}

export async function submitConsent(
  token: string,
  body: ConsentSignReq,
): Promise<void> {
  await api<void>(`/consent/${encodeURIComponent(token)}`, {
    method: "POST",
    body,
  });
}

// ---------- Bilingual strings ----------
export type Lang = "en" | "hi";

export interface ConsentStringBundle {
  brand: string;
  pageTitle: string;
  intro: string;
  step1: string;
  step2: string;
  step3: string;
  reviewHeading: string;
  reviewHint: string;
  scopeHeading: string;
  scopeSub: string;
  channelTitle: string;
  channelHint: string;
  socialTitle: string;
  socialHint: string;
  printTitle: string;
  printHint: string;
  validityTitle: string;
  validityHint: string;
  months6: string;
  months12: string;
  months24: string;
  verifyHeading: string;
  otpLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  nameHint: string;
  signButton: string;
  signingButton: string;
  back: string;
  next: string;
  revoke: string;
  successTitle: string;
  successBody: string;
  successLink: string;
  invalidTitle: string;
  invalidBody: string;
  errorGeneric: string;
  errorOtp: string;
  errorName: string;
  errorScope: string;
  langToggle: string;
}

export const consentStrings: Record<Lang, ConsentStringBundle> = {
  en: {
    brand: "Vik Theatre",
    pageTitle: "Parental Consent",
    intro:
      "Your child's work is beautiful. Before we share it, we need your permission. You stay in control — you can revoke this anytime from your dashboard.",
    step1: "Review",
    step2: "Scope",
    step3: "Verify & Sign",
    reviewHeading: "What you're reviewing",
    reviewHint:
      "This is the recording of your child's work. Watch it, then decide where (and for how long) it can be shared.",
    scopeHeading: "Where can we share this?",
    scopeSub: "Toggle only what you're comfortable with.",
    channelTitle: "Vik Theatre Channel",
    channelHint: "Show on the private student channel (other parents, instructors).",
    socialTitle: "Social media",
    socialHint: "Instagram, YouTube — Vik Theatre's official handles only.",
    printTitle: "Print & promo",
    printHint: "Brochures, posters, newspaper features.",
    validityTitle: "Validity",
    validityHint: "How long this permission stays valid.",
    months6: "6 months",
    months12: "12 months",
    months24: "24 months",
    verifyHeading: "Verify it's really you",
    otpLabel: "6-digit code sent to your phone",
    nameLabel: "Type your full name as signature",
    namePlaceholder: "e.g. Sunita Sharma",
    nameHint:
      "Under India's DPDP Act 2023, typing your name here has the legal weight of a signature.",
    signButton: "Sign consent",
    signingButton: "Signing…",
    back: "Back",
    next: "Next",
    revoke: "You can revoke this anytime from your dashboard.",
    successTitle: "Thank you.",
    successBody:
      "Your consent has been recorded. You'll receive a PDF copy on your phone. You can close this tab.",
    successLink: "Visit viktheatre.in",
    invalidTitle: "This consent link is invalid or expired.",
    invalidBody:
      "Please contact your child's instructor to request a fresh link.",
    errorGeneric: "Something went wrong. Please try again.",
    errorOtp: "Enter the 6-digit code.",
    errorName: "Please type your full name.",
    errorScope: "Please pick validity.",
    langToggle: "हिन्दी",
  },
  hi: {
    brand: "विक थिएटर",
    pageTitle: "अभिभावक की सहमति",
    intro:
      "आपके बच्चे का प्रदर्शन सुंदर है। इसे साझा करने से पहले, हमें आपकी अनुमति चाहिए। नियंत्रण आपके पास है — आप इसे अपने डैशबोर्ड से कभी भी वापस ले सकते हैं।",
    step1: "देखें",
    step2: "सीमा",
    step3: "पुष्टि व हस्ताक्षर",
    reviewHeading: "आप क्या देख रहे हैं",
    reviewHint:
      "यह आपके बच्चे के काम की रिकॉर्डिंग है। इसे देखें, फिर तय करें कि इसे कहाँ (और कितने समय के लिए) साझा किया जा सकता है।",
    scopeHeading: "हम इसे कहाँ साझा कर सकते हैं?",
    scopeSub: "सिर्फ़ वही चुनें जिसमें आप सहज हैं।",
    channelTitle: "विक थिएटर चैनल",
    channelHint:
      "निजी विद्यार्थी चैनल पर दिखाएँ (अन्य अभिभावक, प्रशिक्षक)।",
    socialTitle: "सोशल मीडिया",
    socialHint: "इंस्टाग्राम, यूट्यूब — केवल विक थिएटर के आधिकारिक पेज।",
    printTitle: "प्रिंट व प्रचार",
    printHint: "ब्रोशर, पोस्टर, अख़बार के लेख।",
    validityTitle: "वैधता",
    validityHint: "यह अनुमति कितने समय तक मान्य रहेगी।",
    months6: "6 महीने",
    months12: "12 महीने",
    months24: "24 महीने",
    verifyHeading: "पुष्टि करें कि यह वाकई आप हैं",
    otpLabel: "आपके फ़ोन पर भेजा गया 6-अंकीय कोड",
    nameLabel: "हस्ताक्षर के रूप में अपना पूरा नाम टाइप करें",
    namePlaceholder: "जैसे सुनीता शर्मा",
    nameHint:
      "भारत के डीपीडीपी अधिनियम 2023 के अनुसार, यहाँ अपना नाम टाइप करना हस्ताक्षर के समान कानूनी महत्व रखता है।",
    signButton: "सहमति पर हस्ताक्षर करें",
    signingButton: "हस्ताक्षर हो रहा है…",
    back: "वापस",
    next: "आगे",
    revoke: "आप इसे अपने डैशबोर्ड से कभी भी वापस ले सकते हैं।",
    successTitle: "धन्यवाद।",
    successBody:
      "आपकी सहमति दर्ज कर ली गई है। आपके फ़ोन पर पीडीएफ की प्रति भेजी जाएगी। अब आप इस टैब को बंद कर सकते हैं।",
    successLink: "viktheatre.in पर जाएँ",
    invalidTitle: "यह सहमति लिंक अमान्य या समाप्त हो चुका है।",
    invalidBody:
      "कृपया नया लिंक प्राप्त करने के लिए अपने बच्चे के प्रशिक्षक से संपर्क करें।",
    errorGeneric: "कुछ गड़बड़ हुई। कृपया फिर से प्रयास करें।",
    errorOtp: "6-अंकीय कोड दर्ज करें।",
    errorName: "कृपया अपना पूरा नाम टाइप करें।",
    errorScope: "कृपया वैधता चुनें।",
    langToggle: "EN",
  },
};

export type ConsentStrings = ConsentStringBundle;
