import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../models/consent.dart';
import '../../theme/app_theme.dart';
import 'consent_providers.dart';

class ConsentScreen extends ConsumerStatefulWidget {
  final String token;
  const ConsentScreen({super.key, required this.token});

  @override
  ConsumerState<ConsentScreen> createState() => _ConsentScreenState();
}

class _ConsentScreenState extends ConsumerState<ConsentScreen> {
  final _pageController = PageController();
  final List<TextEditingController> _otpControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocus = List.generate(6, (_) => FocusNode());
  final _nameController = TextEditingController();

  @override
  void dispose() {
    _pageController.dispose();
    for (final c in _otpControllers) {
      c.dispose();
    }
    for (final f in _otpFocus) {
      f.dispose();
    }
    _nameController.dispose();
    super.dispose();
  }

  void _goToStep(int step) {
    ref.read(consentFormProvider(widget.token).notifier).setStep(step);
    _pageController.animateToPage(
      step - 1,
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(consentFormProvider(widget.token));
    final t = consentStringsFor(state.lang);
    final ctx = ref.watch(consentContextProvider(widget.token));

    if (state.done) {
      return _Success(t: t);
    }

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.bg,
        elevation: 0,
        title: Text(
          t.brand,
          style: GoogleFonts.fraunces(
            fontWeight: FontWeight.w700,
            letterSpacing: 2,
            color: AppColors.primary,
          ),
        ),
        actions: <Widget>[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
            child: _LangToggle(
              lang: state.lang,
              onChange: (l) =>
                  ref.read(consentFormProvider(widget.token).notifier).setLang(l),
            ),
          ),
        ],
      ),
      body: ctx.when(
        loading: () =>
            const Center(child: CircularProgressIndicator()),
        error: (_, __) => _Invalid(t: t),
        data: (data) {
          if (data == null) return _Invalid(t: t);
          return SafeArea(
            child: Column(
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: _StepIndicator(step: state.step, t: t),
                ),
                Expanded(
                  child: PageView(
                    controller: _pageController,
                    physics: const NeverScrollableScrollPhysics(),
                    children: <Widget>[
                      _StepReview(t: t, ctx: data),
                      _StepScope(token: widget.token, t: t, state: state),
                      _StepSign(
                        token: widget.token,
                        t: t,
                        state: state,
                        otpControllers: _otpControllers,
                        otpFocus: _otpFocus,
                        nameController: _nameController,
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      t.revoke,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                ),
                if (state.error != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      state.error!,
                      style: const TextStyle(color: Colors.redAccent),
                    ),
                  ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: <Widget>[
                      OutlinedButton(
                        onPressed: state.step == 1 || state.submitting
                            ? null
                            : () => _goToStep(state.step - 1),
                        child: Text(t.back),
                      ),
                      const Spacer(),
                      if (state.step < 3)
                        ElevatedButton(
                          onPressed: () => _goToStep(state.step + 1),
                          child: Text(t.next),
                        )
                      else
                        ElevatedButton(
                          onPressed: state.submitting
                              ? null
                              : () async {
                                  final code =
                                      _otpControllers.map((c) => c.text).join();
                                  ref
                                      .read(consentFormProvider(widget.token)
                                          .notifier)
                                      .setOtp(code);
                                  ref
                                      .read(consentFormProvider(widget.token)
                                          .notifier)
                                      .setName(_nameController.text);
                                  await ref
                                      .read(consentFormProvider(widget.token)
                                          .notifier)
                                      .submit(widget.token,
                                          errorFallback: t.errorGeneric);
                                },
                          child: Text(
                            state.submitting ? t.signingButton : t.signButton,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ---------- Widgets ----------

class _LangToggle extends StatelessWidget {
  final ConsentLang lang;
  final ValueChanged<ConsentLang> onChange;
  const _LangToggle({required this.lang, required this.onChange});
  @override
  Widget build(BuildContext context) {
    Widget chip(String label, ConsentLang value) {
      final active = lang == value;
      return GestureDetector(
        onTap: () => onChange(value),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: active ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: active ? Colors.black : AppColors.textMuted,
            ),
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          chip('EN', ConsentLang.en),
          chip('हिन्दी', ConsentLang.hi),
        ],
      ),
    );
  }
}

class _StepIndicator extends StatelessWidget {
  final int step;
  final ConsentStrings t;
  const _StepIndicator({required this.step, required this.t});
  @override
  Widget build(BuildContext context) {
    final labels = <String>[t.step1, t.step2, t.step3];
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List<Widget>.generate(3, (i) {
        final n = i + 1;
        final active = n == step;
        final done = n < step;
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 6),
          child: Row(
            children: <Widget>[
              Container(
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: done ? AppColors.primary : Colors.transparent,
                  border: Border.all(
                    color: (active || done)
                        ? AppColors.primary
                        : AppColors.border,
                  ),
                ),
                alignment: Alignment.center,
                child: Text(
                  done ? '✓' : '$n',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: done ? Colors.black : AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                labels[i].toUpperCase(),
                style: GoogleFonts.inter(
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: (active || done)
                      ? AppColors.text
                      : AppColors.textMuted,
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}

class _StepReview extends StatelessWidget {
  final ConsentStrings t;
  final ConsentContext ctx;
  const _StepReview({required this.t, required this.ctx});
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(t.reviewHeading,
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text(t.reviewHint,
              style: GoogleFonts.inter(
                  color: AppColors.textMuted, fontSize: 14)),
          const SizedBox(height: 20),
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black,
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(16),
                image: ctx.thumbnailUrl != null
                    ? DecorationImage(
                        image: NetworkImage(ctx.thumbnailUrl!),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              alignment: Alignment.center,
              child: ctx.thumbnailUrl == null
                  ? const Icon(Icons.play_circle_outline,
                      size: 64, color: AppColors.primary)
                  : null,
            ),
          ),
          const SizedBox(height: 20),
          _InfoRow(label: 'TITLE', value: ctx.assetTitle),
          _InfoRow(label: 'STUDENT', value: ctx.studentName),
          if (ctx.batchName != null)
            _InfoRow(label: 'BATCH', value: ctx.batchName!),
          _InfoRow(
            label: 'DATE',
            value:
                '${ctx.createdAt.day}/${ctx.createdAt.month}/${ctx.createdAt.year}',
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(label,
              style: GoogleFonts.inter(
                  fontSize: 10,
                  letterSpacing: 3,
                  color: AppColors.textMuted)),
          const SizedBox(height: 2),
          Text(value, style: Theme.of(context).textTheme.titleLarge),
        ],
      ),
    );
  }
}

class _StepScope extends ConsumerWidget {
  final String token;
  final ConsentStrings t;
  final ConsentFormState state;
  const _StepScope(
      {required this.token, required this.t, required this.state});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = ref.read(consentFormProvider(token).notifier);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(t.scopeHeading,
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text(t.scopeSub,
              style: GoogleFonts.inter(
                  color: AppColors.textMuted, fontSize: 14)),
          const SizedBox(height: 16),
          _ScopeRow(
            title: t.channelTitle,
            hint: t.channelHint,
            value: state.scope.channel,
            onChange: c.setChannel,
          ),
          _ScopeRow(
            title: t.socialTitle,
            hint: t.socialHint,
            value: state.scope.social,
            onChange: c.setSocial,
          ),
          _ScopeRow(
            title: t.printTitle,
            hint: t.printHint,
            value: state.scope.print,
            onChange: c.setPrint,
          ),
          const SizedBox(height: 12),
          Text(t.validityTitle,
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 4),
          Text(t.validityHint,
              style: GoogleFonts.inter(
                  color: AppColors.textMuted, fontSize: 13)),
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              Expanded(
                  child: _MonthChip(
                      label: t.months6,
                      active: state.scope.validMonths == 6,
                      onTap: () => c.setValidMonths(6))),
              const SizedBox(width: 8),
              Expanded(
                  child: _MonthChip(
                      label: t.months12,
                      active: state.scope.validMonths == 12,
                      onTap: () => c.setValidMonths(12))),
              const SizedBox(width: 8),
              Expanded(
                  child: _MonthChip(
                      label: t.months24,
                      active: state.scope.validMonths == 24,
                      onTap: () => c.setValidMonths(24))),
            ],
          ),
        ],
      ),
    );
  }
}

class _ScopeRow extends StatelessWidget {
  final String title;
  final String hint;
  final bool value;
  final ValueChanged<bool> onChange;
  const _ScopeRow({
    required this.title,
    required this.hint,
    required this.value,
    required this.onChange,
  });
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(title, style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 4),
                Text(hint,
                    style: GoogleFonts.inter(
                        fontSize: 13, color: AppColors.textMuted)),
              ],
            ),
          ),
          Semantics(
            toggled: value,
            label: title,
            child: Switch(
              value: value,
              onChanged: onChange,
              activeColor: Colors.black,
              activeTrackColor: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _MonthChip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _MonthChip(
      {required this.label, required this.active, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          border: Border.all(
              color: active ? AppColors.primary : AppColors.border),
          borderRadius: BorderRadius.circular(10),
          color: active ? AppColors.primary.withValues(alpha: 0.1) : null,
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w600,
            color: active ? AppColors.primary : AppColors.text,
          ),
        ),
      ),
    );
  }
}

class _StepSign extends StatelessWidget {
  final String token;
  final ConsentStrings t;
  final ConsentFormState state;
  final List<TextEditingController> otpControllers;
  final List<FocusNode> otpFocus;
  final TextEditingController nameController;
  const _StepSign({
    required this.token,
    required this.t,
    required this.state,
    required this.otpControllers,
    required this.otpFocus,
    required this.nameController,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(t.verifyHeading,
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 20),
          Text(t.otpLabel,
              style: GoogleFonts.inter(
                  fontSize: 13, color: AppColors.textMuted)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List<Widget>.generate(6, (i) {
              return SizedBox(
                width: 44,
                height: 56,
                child: TextField(
                  controller: otpControllers[i],
                  focusNode: otpFocus[i],
                  textAlign: TextAlign.center,
                  keyboardType: TextInputType.number,
                  maxLength: 1,
                  style: GoogleFonts.fraunces(
                      fontSize: 22, fontWeight: FontWeight.w600),
                  decoration: const InputDecoration(counterText: ''),
                  inputFormatters: <TextInputFormatter>[
                    FilteringTextInputFormatter.digitsOnly,
                  ],
                  onChanged: (v) {
                    if (v.length > 1) {
                      // Paste handling
                      final chars = v.replaceAll(RegExp(r'\D'), '').split('');
                      for (var j = 0;
                          j < chars.length && i + j < 6;
                          j++) {
                        otpControllers[i + j].text = chars[j];
                      }
                      final last = (i + chars.length - 1).clamp(0, 5);
                      otpFocus[last].requestFocus();
                      return;
                    }
                    if (v.isNotEmpty && i < 5) {
                      otpFocus[i + 1].requestFocus();
                    } else if (v.isEmpty && i > 0) {
                      otpFocus[i - 1].requestFocus();
                    }
                  },
                ),
              );
            }),
          ),
          const SizedBox(height: 24),
          Text(t.nameLabel,
              style: GoogleFonts.inter(
                  fontSize: 13, color: AppColors.textMuted)),
          const SizedBox(height: 8),
          TextField(
            controller: nameController,
            textInputAction: TextInputAction.done,
            style: GoogleFonts.fraunces(
              fontSize: 18,
              fontStyle: FontStyle.italic,
              color: AppColors.primary,
            ),
            decoration: InputDecoration(hintText: t.namePlaceholder),
          ),
          const SizedBox(height: 8),
          Text(t.nameHint,
              style: GoogleFonts.inter(
                  fontSize: 12, color: AppColors.textMuted)),
        ],
      ),
    );
  }
}

class _Invalid extends StatelessWidget {
  final ConsentStrings t;
  const _Invalid({required this.t});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            const Icon(Icons.lock_outline,
                size: 48, color: AppColors.textMuted),
            const SizedBox(height: 16),
            Text(t.invalidTitle,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(t.invalidBody,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }
}

class _Success extends StatelessWidget {
  final ConsentStrings t;
  const _Success({required this.t});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.primary.withValues(alpha: 0.15),
                  ),
                  child: const Icon(Icons.check,
                      size: 42, color: AppColors.primary),
                ),
                const SizedBox(height: 20),
                Text(t.successTitle,
                    style: Theme.of(context).textTheme.displayMedium),
                const SizedBox(height: 8),
                Text(t.successBody,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(color: AppColors.textMuted)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
