import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../theme/app_theme.dart';
import '../auth/auth_providers.dart';

// TODO(backend): replace stub with GET /v1/parent/consents/pending.
class _PendingConsent {
  final String token;
  final String assetTitle;
  final String studentName;
  final DateTime uploadedAt;
  const _PendingConsent({
    required this.token,
    required this.assetTitle,
    required this.studentName,
    required this.uploadedAt,
  });
}

final _pendingConsentsProvider =
    FutureProvider.autoDispose<List<_PendingConsent>>((ref) async {
  await Future<void>.delayed(const Duration(milliseconds: 200));
  return <_PendingConsent>[
    _PendingConsent(
      token: 'demo-token-1',
      assetTitle: 'Monologue — The Glass Menagerie',
      studentName: 'Aarav',
      uploadedAt: DateTime.now(),
    ),
    _PendingConsent(
      token: 'demo-token-2',
      assetTitle: 'Scene — Andha Yug Act II',
      studentName: 'Aarav',
      uploadedAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
  ];
});

class ParentHomeScreen extends ConsumerWidget {
  const ParentHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;
    final firstName = (user?.name ?? 'Parent').split(' ').first;
    // TODO: load first linked child from backend.
    const childName = 'Aarav';
    final pendingAsync = ref.watch(_pendingConsentsProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.bg,
        elevation: 0,
        title: Text(
          'Vik Theatre',
          style: GoogleFonts.fraunces(
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
            letterSpacing: 2,
          ),
        ),
        actions: <Widget>[
          IconButton(
            tooltip: 'Log out',
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authStateProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: <Widget>[
            Text(
              'WELCOME',
              style: GoogleFonts.inter(
                fontSize: 11,
                letterSpacing: 3,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text('Hello, $firstName.',
                style: Theme.of(context).textTheme.displayMedium),
            const SizedBox(height: 6),
            Text(
              "Here's how $childName is doing this week.",
              style: GoogleFonts.inter(color: AppColors.textMuted),
            ),
            const SizedBox(height: 20),
            pendingAsync.maybeWhen(
              data: (items) => items.isEmpty
                  ? const SizedBox.shrink()
                  : _PendingBanner(
                      count: items.length,
                      childName: childName,
                      onReview: () => context.go('/parent/consent'),
                    ),
              orElse: () => const SizedBox.shrink(),
            ),
            const SizedBox(height: 12),
            _HeroCard(childName: childName),
            const SizedBox(height: 16),
            Row(
              children: <Widget>[
                Expanded(
                    child: _StatCard(title: 'Uploads', value: '3')),
                const SizedBox(width: 12),
                Expanded(
                    child: _StatCard(title: 'Attendance', value: '92%')),
              ],
            ),
            const SizedBox(height: 12),
            _StatCard(
              title: 'Fees',
              value: 'Paid',
              subtitle: 'Next due Jun 5',
            ),
            const SizedBox(height: 24),
            Text('Consent Center',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            pendingAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) =>
                  const Text('Could not load consents right now.'),
              data: (items) => Column(
                children: items
                    .map((c) => _ConsentListTile(
                          title: c.assetTitle,
                          subtitle:
                              '${c.studentName} · ${c.uploadedAt.day}/${c.uploadedAt.month}',
                          onTap: () => context.go('/consent/${c.token}'),
                        ))
                    .toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PendingBanner extends StatelessWidget {
  final int count;
  final String childName;
  final VoidCallback onReview;
  const _PendingBanner({
    required this.count,
    required this.childName,
    required this.onReview,
  });
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.5)),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: <Widget>[
          const Text('⚠️', style: TextStyle(fontSize: 22)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  '$count new item${count > 1 ? 's' : ''} need your consent',
                  style: GoogleFonts.fraunces(
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                    fontSize: 17,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  "Please review so $childName's work can be shared safely.",
                  style: GoogleFonts.inter(
                      fontSize: 13, color: AppColors.text),
                ),
              ],
            ),
          ),
          TextButton(onPressed: onReview, child: const Text('Review')),
        ],
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  final String childName;
  const _HeroCard({required this.childName});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[AppColors.surface, Color(0xFF1A1030)],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            "${childName.toUpperCase()}'S JOURNEY",
            style: GoogleFonts.inter(
              fontSize: 10,
              letterSpacing: 3,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 10),
          Text('3 new recordings · 8 classes attended',
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(
            'Scene work has deepened — diction +5, stage presence +3 since the last showcase.',
            style: GoogleFonts.inter(color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String? subtitle;
  const _StatCard({required this.title, required this.value, this.subtitle});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(title,
              style: GoogleFonts.inter(
                  color: AppColors.text, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text(value,
              style: GoogleFonts.fraunces(
                fontSize: 30,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              )),
          if (subtitle != null) ...<Widget>[
            const SizedBox(height: 4),
            Text(subtitle!,
                style: GoogleFonts.inter(
                    fontSize: 12, color: AppColors.textMuted)),
          ],
        ],
      ),
    );
  }
}

class _ConsentListTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  const _ConsentListTile({
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: ListTile(
        onTap: onTap,
        title: Text(title,
            style: GoogleFonts.fraunces(
                fontWeight: FontWeight.w700, fontSize: 16)),
        subtitle: Text(subtitle,
            style: GoogleFonts.inter(
                color: AppColors.textMuted, fontSize: 12)),
        trailing:
            const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.primary),
      ),
    );
  }
}
