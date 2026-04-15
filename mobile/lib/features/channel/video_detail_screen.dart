import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:video_player/video_player.dart';

import '../../models/asset.dart';
import '../../theme/app_theme.dart';
import '../../widgets/asset_card.dart';
import '../../widgets/privacy_badge.dart';
import '../auth/auth_providers.dart';
import 'channel_providers.dart';

class VideoDetailScreen extends ConsumerStatefulWidget {
  final String studentId;
  final String assetId;
  final String? token;

  const VideoDetailScreen({
    super.key,
    required this.studentId,
    required this.assetId,
    this.token,
  });

  @override
  ConsumerState<VideoDetailScreen> createState() => _VideoDetailScreenState();
}

class _VideoDetailScreenState extends ConsumerState<VideoDetailScreen> {
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  String? _initializedPlaybackId;
  bool _initializing = false;
  String? _initError;

  @override
  void dispose() {
    _chewieController?.dispose();
    _videoController?.dispose();
    super.dispose();
  }

  Future<void> _initPlayer(Asset asset) async {
    if (_initializing) return;
    if (asset.muxPlaybackId.startsWith('stub_') ||
        asset.muxPlaybackId.isEmpty) {
      return;
    }
    if (_initializedPlaybackId == asset.muxPlaybackId) return;
    _initializing = true;
    final tokenQuery =
        widget.token != null && widget.token!.isNotEmpty ? '?token=${widget.token}' : '';
    final url =
        'https://stream.mux.com/${asset.muxPlaybackId}.m3u8$tokenQuery';
    try {
      final controller = VideoPlayerController.networkUrl(Uri.parse(url));
      await controller.initialize();
      final chewie = ChewieController(
        videoPlayerController: controller,
        aspectRatio: 16 / 9,
        autoPlay: false,
        looping: false,
        materialProgressColors: ChewieProgressColors(
          playedColor: AppColors.primary,
          handleColor: AppColors.primary,
          backgroundColor: AppColors.border,
          bufferedColor: AppColors.textMuted,
        ),
      );
      if (!mounted) {
        controller.dispose();
        chewie.dispose();
        return;
      }
      setState(() {
        _videoController?.dispose();
        _chewieController?.dispose();
        _videoController = controller;
        _chewieController = chewie;
        _initializedPlaybackId = asset.muxPlaybackId;
        _initError = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _initError = e.toString());
    } finally {
      _initializing = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final asyncAsset = ref.watch(
      assetProvider(
        AssetArgs(studentId: widget.studentId, assetId: widget.assetId),
      ),
    );
    final asyncChannel = ref.watch(channelProvider(widget.studentId));
    final role = ref.watch(authStateProvider).valueOrNull?.role;
    final canSeeNotes =
        role == 'instructor' || role == 'admin' || role == 'student';

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.bg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: asyncAsset.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _NotFoundView(message: e.toString()),
        data: (asset) {
          // Kick off init after frame, safely.
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _initPlayer(asset);
          });
          return ListView(
            padding: EdgeInsets.zero,
            children: <Widget>[
              _PlayerArea(
                asset: asset,
                chewieController: _chewieController,
                initError: _initError,
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      asset.title,
                      style: GoogleFonts.fraunces(
                        color: AppColors.text,
                        fontSize: 22,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _MetaRow(asset: asset),
                    const SizedBox(height: 20),
                    _RubricBars(),
                    if (canSeeNotes) ...<Widget>[
                      const SizedBox(height: 20),
                      _InstructorNotesCard(),
                    ],
                    const SizedBox(height: 24),
                    Text(
                      'More from this student',
                      style: GoogleFonts.fraunces(
                        color: AppColors.text,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    asyncChannel.when(
                      loading: () => const SizedBox(
                        height: 40,
                        child: Center(child: CircularProgressIndicator()),
                      ),
                      error: (_, __) => const SizedBox.shrink(),
                      data: (channel) {
                        final others = channel.assets
                            .where((a) => a.id != asset.id)
                            .take(6)
                            .toList();
                        if (others.isEmpty) {
                          return Text('No other videos yet.',
                              style: GoogleFonts.inter(
                                  color: AppColors.textMuted));
                        }
                        return SizedBox(
                          height: 210,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: others.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(width: 12),
                            itemBuilder: (_, i) => SizedBox(
                              width: 220,
                              child: AssetCard(
                                asset: others[i],
                                compact: true,
                                onTap: () => context.pushReplacement(
                                  '/channel/${widget.studentId}/v/${others[i].id}',
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _PlayerArea extends StatelessWidget {
  final Asset asset;
  final ChewieController? chewieController;
  final String? initError;

  const _PlayerArea({
    required this.asset,
    required this.chewieController,
    required this.initError,
  });

  @override
  Widget build(BuildContext context) {
    final isStub = asset.muxPlaybackId.startsWith('stub_') ||
        asset.muxPlaybackId.isEmpty;
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        color: Colors.black,
        child: Builder(builder: (_) {
          if (isStub) {
            return _PlaceholderMessage(
              icon: Icons.movie_outlined,
              title: 'Preview unavailable',
              subtitle: 'Preview unavailable in local/dev mode.',
            );
          }
          if (initError != null) {
            return _PlaceholderMessage(
              icon: Icons.error_outline,
              title: 'Playback error',
              subtitle: initError!,
            );
          }
          if (chewieController == null) {
            return const Center(child: CircularProgressIndicator());
          }
          return Chewie(controller: chewieController!);
        }),
      ),
    );
  }
}

class _PlaceholderMessage extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  const _PlaceholderMessage({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(icon, color: AppColors.textMuted, size: 48),
            const SizedBox(height: 8),
            Text(title,
                style: GoogleFonts.fraunces(
                    color: AppColors.text,
                    fontSize: 18,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            Text(subtitle,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }
}

class _MetaRow extends StatelessWidget {
  final Asset asset;
  const _MetaRow({required this.asset});

  @override
  Widget build(BuildContext context) {
    final dateLabel = asset.createdAt.millisecondsSinceEpoch == 0
        ? ''
        : DateFormat('MMM d, yyyy').format(asset.createdAt);
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 8,
      runSpacing: 8,
      children: <Widget>[
        if (dateLabel.isNotEmpty)
          Text(dateLabel,
              style: GoogleFonts.inter(color: AppColors.textMuted)),
        if (dateLabel.isNotEmpty)
          Text('·', style: GoogleFonts.inter(color: AppColors.textMuted)),
        Text('Instructor: Victor Sir',
            style: GoogleFonts.inter(color: AppColors.textMuted)),
        Text('·', style: GoogleFonts.inter(color: AppColors.textMuted)),
        PrivacyBadge(privacy: asset.privacy),
      ],
    );
  }
}

class _RubricBars extends StatelessWidget {
  static const List<MapEntry<String, double>> _dims = <MapEntry<String, double>>[
    MapEntry('Voice', 0.78),
    MapEntry('Diction', 0.64),
    MapEntry('Emotion', 0.82),
    MapEntry('Physicality', 0.58),
    MapEntry('Presence', 0.72),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text('Rubric',
              style: GoogleFonts.fraunces(
                  color: AppColors.text,
                  fontSize: 16,
                  fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          for (final entry in _dims) ...<Widget>[
            Row(
              children: <Widget>[
                SizedBox(
                  width: 92,
                  child: Text(entry.key,
                      style: GoogleFonts.inter(
                          color: AppColors.textMuted, fontSize: 12)),
                ),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: entry.value,
                      minHeight: 8,
                      backgroundColor: AppColors.border,
                      valueColor: const AlwaysStoppedAnimation<Color>(
                          AppColors.primary),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text('${(entry.value * 100).round()}',
                    style: GoogleFonts.inter(
                        color: AppColors.text,
                        fontSize: 12,
                        fontWeight: FontWeight.w600)),
              ],
            ),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

class _InstructorNotesCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              const Icon(Icons.edit_note, color: AppColors.primary),
              const SizedBox(width: 8),
              Text('Instructor notes',
                  style: GoogleFonts.fraunces(
                      color: AppColors.text,
                      fontSize: 16,
                      fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Strong emotional anchor. Work on breath support through longer '
            'lines; keep the body open when landing the final beat.',
            style: GoogleFonts.inter(
                color: AppColors.textMuted, height: 1.5),
          ),
        ],
      ),
    );
  }
}

class _NotFoundView extends StatelessWidget {
  final String message;
  const _NotFoundView({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            const Icon(Icons.visibility_off,
                color: AppColors.textMuted, size: 48),
            const SizedBox(height: 12),
            Text('Video unavailable',
                style: GoogleFonts.fraunces(
                    color: AppColors.text,
                    fontSize: 20,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Text(
              'This video may be private or pending consent.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(color: AppColors.textMuted),
            ),
            const SizedBox(height: 8),
            Text(message,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                    color: AppColors.textMuted, fontSize: 11)),
          ],
        ),
      ),
    );
  }
}
