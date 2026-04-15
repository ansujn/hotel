import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../theme/app_theme.dart';
import 'auth_providers.dart';

enum _Step { phone, otp }

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  final List<TextEditingController> _otpControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocus = List.generate(6, (_) => FocusNode());

  _Step _step = _Step.phone;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _phoneController.dispose();
    for (final c in _otpControllers) {
      c.dispose();
    }
    for (final f in _otpFocus) {
      f.dispose();
    }
    super.dispose();
  }

  Future<void> _sendOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length < 10) {
      setState(() => _error = 'Enter a valid phone number');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(authStateProvider.notifier).sendOtp(phone);
      if (!mounted) return;
      setState(() => _step = _Step.otp);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _verifyOtp() async {
    final code = _otpControllers.map((c) => c.text).join();
    if (code.length != 6) {
      setState(() => _error = 'Enter the 6-digit code');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref
          .read(authStateProvider.notifier)
          .verifyOtp(_phoneController.text.trim(), code);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: <Widget>[
              _CinematicHeader(),
              Padding(
                padding: const EdgeInsets.all(24),
                child: _step == _Step.phone ? _buildPhone() : _buildOtp(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPhone() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text('Welcome back', style: Theme.of(context).textTheme.headlineLarge),
        const SizedBox(height: 8),
        Text(
          'Sign in to continue your theatre journey.',
          style: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 15),
        ),
        const SizedBox(height: 32),
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          inputFormatters: <TextInputFormatter>[
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(10),
          ],
          decoration: const InputDecoration(
            hintText: 'Phone number',
            prefixText: '+91  ',
          ),
        ),
        if (_error != null) ...<Widget>[
          const SizedBox(height: 12),
          Text(_error!, style: const TextStyle(color: Colors.redAccent)),
        ],
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _loading ? null : _sendOtp,
          child: _loading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Send OTP'),
        ),
      ],
    );
  }

  Widget _buildOtp() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text('Enter the code', style: Theme.of(context).textTheme.headlineLarge),
        const SizedBox(height: 8),
        Text(
          'We sent a 6-digit code to +91 ${_phoneController.text}',
          style: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 15),
        ),
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List<Widget>.generate(6, (i) => _otpBox(i)),
        ),
        if (_error != null) ...<Widget>[
          const SizedBox(height: 12),
          Text(_error!, style: const TextStyle(color: Colors.redAccent)),
        ],
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _loading ? null : _verifyOtp,
          child: _loading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Verify'),
        ),
        TextButton(
          onPressed: _loading
              ? null
              : () => setState(() {
                    _step = _Step.phone;
                    _error = null;
                  }),
          child: const Text('Change number'),
        ),
      ],
    );
  }

  Widget _otpBox(int i) {
    return SizedBox(
      width: 48,
      height: 56,
      child: TextField(
        controller: _otpControllers[i],
        focusNode: _otpFocus[i],
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        style: GoogleFonts.fraunces(fontSize: 22, fontWeight: FontWeight.w600),
        decoration: const InputDecoration(counterText: ''),
        inputFormatters: <TextInputFormatter>[
          FilteringTextInputFormatter.digitsOnly,
        ],
        onChanged: (value) {
          if (value.isNotEmpty && i < 5) {
            _otpFocus[i + 1].requestFocus();
          } else if (value.isEmpty && i > 0) {
            _otpFocus[i - 1].requestFocus();
          }
        },
      ),
    );
  }
}

class _CinematicHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 220,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[
            Color(0xFF1A1030),
            Color(0xFF0B0B0F),
            Color(0xFF2A1A0A),
          ],
        ),
      ),
      child: Stack(
        children: <Widget>[
          Positioned(
            left: 24,
            bottom: 24,
            right: 24,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'VIK',
                  style: GoogleFonts.fraunces(
                    fontSize: 42,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                    letterSpacing: 4,
                  ),
                ),
                Text(
                  'Theatre. Craft. Stage.',
                  style: GoogleFonts.inter(
                    color: AppColors.textMuted,
                    fontSize: 13,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
