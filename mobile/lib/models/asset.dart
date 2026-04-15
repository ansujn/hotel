enum AssetPrivacy { private, pendingConsent, public }

AssetPrivacy _privacyFromString(String? raw) {
  switch (raw) {
    case 'public':
      return AssetPrivacy.public;
    case 'pending_consent':
      return AssetPrivacy.pendingConsent;
    case 'private':
    default:
      return AssetPrivacy.private;
  }
}

String privacyToString(AssetPrivacy p) {
  switch (p) {
    case AssetPrivacy.public:
      return 'public';
    case AssetPrivacy.pendingConsent:
      return 'pending_consent';
    case AssetPrivacy.private:
      return 'private';
  }
}

class Asset {
  final String id;
  final String title;
  final String type;
  final String muxPlaybackId;
  final int durationS;
  final AssetPrivacy privacy;
  final DateTime createdAt;

  const Asset({
    required this.id,
    required this.title,
    required this.type,
    required this.muxPlaybackId,
    required this.durationS,
    required this.privacy,
    required this.createdAt,
  });

  factory Asset.fromJson(Map<String, dynamic> json) {
    return Asset(
      id: (json['id'] as String?) ?? '',
      title: (json['title'] as String?) ?? 'Untitled',
      type: (json['type'] as String?) ?? 'monologue',
      muxPlaybackId: (json['mux_playback_id'] as String?) ?? '',
      durationS: (json['duration_s'] as int?) ?? 0,
      privacy: _privacyFromString(json['privacy'] as String?),
      createdAt: DateTime.tryParse((json['created_at'] as String?) ?? '') ??
          DateTime.fromMillisecondsSinceEpoch(0),
    );
  }
}
