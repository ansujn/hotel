import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../models/asset.dart';

class PrivacyBadge extends StatelessWidget {
  final AssetPrivacy privacy;
  final double fontSize;

  const PrivacyBadge({
    super.key,
    required this.privacy,
    this.fontSize = 10,
  });

  @override
  Widget build(BuildContext context) {
    late final Color bg;
    late final Color fg;
    late final String label;
    switch (privacy) {
      case AssetPrivacy.public:
        bg = const Color(0xFF1B3A2A);
        fg = const Color(0xFF6EE7A7);
        label = 'PUBLIC';
        break;
      case AssetPrivacy.private:
        bg = const Color(0xFF3A1B1B);
        fg = const Color(0xFFF87171);
        label = 'PRIVATE';
        break;
      case AssetPrivacy.pendingConsent:
        bg = const Color(0xFF3A2F1B);
        fg = const Color(0xFFE8C872);
        label = 'PENDING';
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: fg.withValues(alpha: 0.4)),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          color: fg,
          fontSize: fontSize,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}
