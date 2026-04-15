import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../models/asset.dart';
import '../../models/channel.dart';
import '../../theme/app_theme.dart';
import '../../widgets/asset_card.dart';
import '../../widgets/gradient_banner.dart';
import 'channel_providers.dart';

class ChannelScreen extends ConsumerStatefulWidget {
  final String studentId;
  const ChannelScreen({super.key, required this.studentId});

  @override
  ConsumerState<ChannelScreen> createState() => _ChannelScreenState();
}

class _ChannelScreenState extends ConsumerState<ChannelScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  static const List<String> _tabs = <String>[
    'Monologues',
    'Scenes',
    'Showcases',
    'About',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(channelProvider(widget.studentId));

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => _ErrorView(
          message: err.toString(),
          onRetry: () => ref.invalidate(channelProvider(widget.studentId)),
        ),
        data: (channel) => _ChannelBody(
          channel: channel,
          tabController: _tabController,
          tabs: _tabs,
          studentId: widget.studentId,
        ),
      ),
    );
  }
}

class _ChannelBody extends StatelessWidget {
  final Channel channel;
  final TabController tabController;
  final List<String> tabs;
  final String studentId;

  const _ChannelBody({
    required this.channel,
    required this.tabController,
    required this.tabs,
    required this.studentId,
  });

  List<Asset> _filter(String tab) {
    switch (tab) {
      case 'Monologues':
        return channel.assets.where((a) => a.type == 'monologue').toList();
      case 'Scenes':
        return channel.assets.where((a) => a.type == 'scene').toList();
      case 'Showcases':
        return channel.assets.where((a) => a.type == 'showcase').toList();
      default:
        return <Asset>[];
    }
  }

  @override
  Widget build(BuildContext context) {
    final student = channel.student;
    final name = student.name ?? 'Student';

    return NestedScrollView(
      headerSliverBuilder: (context, _) => <Widget>[
        SliverToBoxAdapter(
          child: Stack(
            clipBehavior: Clip.none,
            children: <Widget>[
              GradientBanner(
                height: 280,
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: <Widget>[
                        IconButton(
                          icon: const Icon(Icons.arrow_back,
                              color: Colors.white),
                          onPressed: () {
                            if (Navigator.of(context).canPop()) {
                              Navigator.of(context).pop();
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                left: 20,
                right: 20,
                bottom: -60,
                child: Row(
                  children: <Widget>[
                    Container(
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                      ),
                      padding: const EdgeInsets.all(3),
                      child: CircleAvatar(
                        radius: 60,
                        backgroundColor: AppColors.surfaceAlt,
                        child: Text(
                          name.isEmpty ? '?' : name[0].toUpperCase(),
                          style: GoogleFonts.fraunces(
                            fontSize: 44,
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const SizedBox(height: 60),
                          Text(
                            name,
                            style: GoogleFonts.fraunces(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 72, 20, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Batch 2026',
                  style: GoogleFonts.inter(color: AppColors.textMuted),
                ),
                const SizedBox(height: 12),
                Row(
                  children: <Widget>[
                    _StatPill(
                      label: 'Videos',
                      value: '${channel.assets.length}',
                    ),
                    const SizedBox(width: 12),
                    _StatPill(
                      label: 'Public',
                      value: channel.assets
                          .where((a) => a.privacy == AssetPrivacy.public)
                          .length
                          .toString(),
                    ),
                    const SizedBox(width: 12),
                    const _StatPill(label: 'Level', value: '2'),
                  ],
                ),
              ],
            ),
          ),
        ),
        SliverPersistentHeader(
          pinned: true,
          delegate: _TabBarDelegate(
            tabBar: TabBar(
              controller: tabController,
              isScrollable: true,
              indicatorColor: AppColors.primary,
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.textMuted,
              labelStyle:
                  GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
              tabs: tabs.map((t) => Tab(text: t)).toList(),
            ),
          ),
        ),
      ],
      body: TabBarView(
        controller: tabController,
        children: tabs.map((t) {
          if (t == 'About') {
            return _AboutTab(channel: channel);
          }
          final filtered = _filter(t);
          if (filtered.isEmpty) {
            return _EmptyState(label: 'No $t yet.');
          }
          return GridView.count(
            crossAxisCount: 2,
            padding: const EdgeInsets.all(16),
            childAspectRatio: 0.78,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            children: filtered
                .map(
                  (a) => AssetCard(
                    asset: a,
                    onTap: () => context
                        .push('/channel/$studentId/v/${a.id}'),
                  ),
                )
                .toList(),
          );
        }).toList(),
      ),
    );
  }
}

class _StatPill extends StatelessWidget {
  final String label;
  final String value;
  const _StatPill({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(value,
              style: GoogleFonts.fraunces(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
                fontSize: 16,
              )),
          const SizedBox(width: 6),
          Text(label,
              style: GoogleFonts.inter(
                color: AppColors.textMuted,
                fontSize: 12,
              )),
        ],
      ),
    );
  }
}

class _AboutTab extends StatelessWidget {
  final Channel channel;
  const _AboutTab({required this.channel});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: <Widget>[
        Text('About',
            style: GoogleFonts.fraunces(
                color: AppColors.text, fontSize: 20,
                fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Text(
          '${channel.student.name ?? "This student"} is pursuing their '
          'training at Vik Theatre. This channel showcases selected '
          'monologues, scenes and showcases.',
          style: GoogleFonts.inter(color: AppColors.textMuted, height: 1.5),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  final String label;
  const _EmptyState({required this.label});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        label,
        style: GoogleFonts.inter(color: AppColors.textMuted),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            const Icon(Icons.error_outline,
                color: AppColors.textMuted, size: 48),
            const SizedBox(height: 12),
            Text(
              'Could not load channel',
              style: GoogleFonts.fraunces(
                color: AppColors.text,
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 6),
            Text(message,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(color: AppColors.textMuted)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}

class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  _TabBarDelegate({required this.tabBar});

  @override
  double get minExtent => tabBar.preferredSize.height;

  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: AppColors.bg,
      child: tabBar,
    );
  }

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) =>
      false;
}
