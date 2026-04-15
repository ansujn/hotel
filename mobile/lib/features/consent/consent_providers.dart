import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/api_client.dart';
import '../../models/consent.dart';
import 'consent_repository.dart';

enum ConsentLang { en, hi }

class ConsentFormState {
  final int step; // 1..3
  final ConsentLang lang;
  final ConsentScope scope;
  final String otp;
  final String signedName;
  final bool submitting;
  final bool done;
  final String? error;

  const ConsentFormState({
    this.step = 1,
    this.lang = ConsentLang.en,
    this.scope = const ConsentScope(
      channel: true,
      social: false,
      print: false,
      validMonths: 12,
    ),
    this.otp = '',
    this.signedName = '',
    this.submitting = false,
    this.done = false,
    this.error,
  });

  ConsentFormState copyWith({
    int? step,
    ConsentLang? lang,
    ConsentScope? scope,
    String? otp,
    String? signedName,
    bool? submitting,
    bool? done,
    String? error,
    bool clearError = false,
  }) {
    return ConsentFormState(
      step: step ?? this.step,
      lang: lang ?? this.lang,
      scope: scope ?? this.scope,
      otp: otp ?? this.otp,
      signedName: signedName ?? this.signedName,
      submitting: submitting ?? this.submitting,
      done: done ?? this.done,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

final consentRepositoryProvider = Provider<ConsentRepository>((ref) {
  return ConsentRepository(client: ApiClient());
});

class ConsentFormController extends StateNotifier<ConsentFormState> {
  ConsentFormController(this._ref) : super(const ConsentFormState());
  final Ref _ref;

  void setLang(ConsentLang l) => state = state.copyWith(lang: l);
  void setStep(int s) => state = state.copyWith(step: s, clearError: true);

  void setChannel(bool v) =>
      state = state.copyWith(scope: state.scope.copyWith(channel: v));
  void setSocial(bool v) =>
      state = state.copyWith(scope: state.scope.copyWith(social: v));
  void setPrint(bool v) =>
      state = state.copyWith(scope: state.scope.copyWith(print: v));
  void setValidMonths(int m) =>
      state = state.copyWith(scope: state.scope.copyWith(validMonths: m));

  void setOtp(String v) => state = state.copyWith(otp: v);
  void setName(String v) => state = state.copyWith(signedName: v);

  Future<void> submit(String token, {required String errorFallback}) async {
    if (state.otp.length != 6 || state.signedName.trim().isEmpty) {
      state = state.copyWith(error: errorFallback);
      return;
    }
    state = state.copyWith(submitting: true, clearError: true);
    try {
      final req = ConsentSignReq(
        otp: state.otp,
        signedName: state.signedName.trim(),
        scope: state.scope,
      );
      await _ref.read(consentRepositoryProvider).submit(token, req);
      state = state.copyWith(submitting: false, done: true);
    } catch (e) {
      state = state.copyWith(submitting: false, error: e.toString());
    }
  }
}

final consentFormProvider = StateNotifierProvider.autoDispose
    .family<ConsentFormController, ConsentFormState, String>(
  (ref, token) => ConsentFormController(ref),
);

final consentContextProvider = FutureProvider.autoDispose
    .family<ConsentContext?, String>((ref, token) async {
  return ref.read(consentRepositoryProvider).getContext(token);
});

// ---------- Bilingual strings ----------
class ConsentStrings {
  final String brand;
  final String pageTitle;
  final String intro;
  final String step1;
  final String step2;
  final String step3;
  final String reviewHeading;
  final String reviewHint;
  final String scopeHeading;
  final String scopeSub;
  final String channelTitle;
  final String channelHint;
  final String socialTitle;
  final String socialHint;
  final String printTitle;
  final String printHint;
  final String validityTitle;
  final String validityHint;
  final String months6;
  final String months12;
  final String months24;
  final String verifyHeading;
  final String otpLabel;
  final String nameLabel;
  final String namePlaceholder;
  final String nameHint;
  final String signButton;
  final String signingButton;
  final String back;
  final String next;
  final String revoke;
  final String successTitle;
  final String successBody;
  final String invalidTitle;
  final String invalidBody;
  final String errorGeneric;
  final String langToggle;

  const ConsentStrings({
    required this.brand,
    required this.pageTitle,
    required this.intro,
    required this.step1,
    required this.step2,
    required this.step3,
    required this.reviewHeading,
    required this.reviewHint,
    required this.scopeHeading,
    required this.scopeSub,
    required this.channelTitle,
    required this.channelHint,
    required this.socialTitle,
    required this.socialHint,
    required this.printTitle,
    required this.printHint,
    required this.validityTitle,
    required this.validityHint,
    required this.months6,
    required this.months12,
    required this.months24,
    required this.verifyHeading,
    required this.otpLabel,
    required this.nameLabel,
    required this.namePlaceholder,
    required this.nameHint,
    required this.signButton,
    required this.signingButton,
    required this.back,
    required this.next,
    required this.revoke,
    required this.successTitle,
    required this.successBody,
    required this.invalidTitle,
    required this.invalidBody,
    required this.errorGeneric,
    required this.langToggle,
  });
}

const ConsentStrings kConsentEn = ConsentStrings(
  brand: 'Vik Theatre',
  pageTitle: 'Parental Consent',
  intro:
      "Your child's work is beautiful. Before we share it, we need your permission. You stay in control — you can revoke this anytime from your dashboard.",
  step1: 'Review',
  step2: 'Scope',
  step3: 'Verify & Sign',
  reviewHeading: "What you're reviewing",
  reviewHint:
      'This is the recording of your child\'s work. Watch it, then decide where (and for how long) it can be shared.',
  scopeHeading: 'Where can we share this?',
  scopeSub: "Toggle only what you're comfortable with.",
  channelTitle: 'Vik Theatre Channel',
  channelHint:
      'Show on the private student channel (other parents, instructors).',
  socialTitle: 'Social media',
  socialHint: "Instagram, YouTube — Vik Theatre's official handles only.",
  printTitle: 'Print & promo',
  printHint: 'Brochures, posters, newspaper features.',
  validityTitle: 'Validity',
  validityHint: 'How long this permission stays valid.',
  months6: '6 months',
  months12: '12 months',
  months24: '24 months',
  verifyHeading: "Verify it's really you",
  otpLabel: '6-digit code sent to your phone',
  nameLabel: 'Type your full name as signature',
  namePlaceholder: 'e.g. Sunita Sharma',
  nameHint:
      "Under India's DPDP Act 2023, typing your name here has the legal weight of a signature.",
  signButton: 'Sign consent',
  signingButton: 'Signing…',
  back: 'Back',
  next: 'Next',
  revoke: 'You can revoke this anytime from your dashboard.',
  successTitle: 'Thank you.',
  successBody:
      "Your consent has been recorded. You'll receive a PDF copy on your phone. You can close this tab.",
  invalidTitle: 'This consent link is invalid or expired.',
  invalidBody:
      "Please contact your child's instructor to request a fresh link.",
  errorGeneric: 'Something went wrong. Please try again.',
  langToggle: 'हिन्दी',
);

const ConsentStrings kConsentHi = ConsentStrings(
  brand: 'विक थिएटर',
  pageTitle: 'अभिभावक की सहमति',
  intro:
      'आपके बच्चे का प्रदर्शन सुंदर है। इसे साझा करने से पहले, हमें आपकी अनुमति चाहिए। नियंत्रण आपके पास है — आप इसे अपने डैशबोर्ड से कभी भी वापस ले सकते हैं।',
  step1: 'देखें',
  step2: 'सीमा',
  step3: 'पुष्टि व हस्ताक्षर',
  reviewHeading: 'आप क्या देख रहे हैं',
  reviewHint:
      'यह आपके बच्चे के काम की रिकॉर्डिंग है। इसे देखें, फिर तय करें कि इसे कहाँ (और कितने समय के लिए) साझा किया जा सकता है।',
  scopeHeading: 'हम इसे कहाँ साझा कर सकते हैं?',
  scopeSub: 'सिर्फ़ वही चुनें जिसमें आप सहज हैं।',
  channelTitle: 'विक थिएटर चैनल',
  channelHint: 'निजी विद्यार्थी चैनल पर दिखाएँ (अन्य अभिभावक, प्रशिक्षक)।',
  socialTitle: 'सोशल मीडिया',
  socialHint: 'इंस्टाग्राम, यूट्यूब — केवल विक थिएटर के आधिकारिक पेज।',
  printTitle: 'प्रिंट व प्रचार',
  printHint: 'ब्रोशर, पोस्टर, अख़बार के लेख।',
  validityTitle: 'वैधता',
  validityHint: 'यह अनुमति कितने समय तक मान्य रहेगी।',
  months6: '6 महीने',
  months12: '12 महीने',
  months24: '24 महीने',
  verifyHeading: 'पुष्टि करें कि यह वाकई आप हैं',
  otpLabel: 'आपके फ़ोन पर भेजा गया 6-अंकीय कोड',
  nameLabel: 'हस्ताक्षर के रूप में अपना पूरा नाम टाइप करें',
  namePlaceholder: 'जैसे सुनीता शर्मा',
  nameHint:
      'भारत के डीपीडीपी अधिनियम 2023 के अनुसार, यहाँ अपना नाम टाइप करना हस्ताक्षर के समान कानूनी महत्व रखता है।',
  signButton: 'सहमति पर हस्ताक्षर करें',
  signingButton: 'हस्ताक्षर हो रहा है…',
  back: 'वापस',
  next: 'आगे',
  revoke: 'आप इसे अपने डैशबोर्ड से कभी भी वापस ले सकते हैं।',
  successTitle: 'धन्यवाद।',
  successBody:
      'आपकी सहमति दर्ज कर ली गई है। आपके फ़ोन पर पीडीएफ की प्रति भेजी जाएगी। अब आप इस टैब को बंद कर सकते हैं।',
  invalidTitle: 'यह सहमति लिंक अमान्य या समाप्त हो चुका है।',
  invalidBody:
      'कृपया नया लिंक प्राप्त करने के लिए अपने बच्चे के प्रशिक्षक से संपर्क करें।',
  errorGeneric: 'कुछ गड़बड़ हुई। कृपया फिर से प्रयास करें।',
  langToggle: 'EN',
);

ConsentStrings consentStringsFor(ConsentLang l) =>
    l == ConsentLang.hi ? kConsentHi : kConsentEn;
