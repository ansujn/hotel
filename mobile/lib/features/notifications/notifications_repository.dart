import '../../api/api_client.dart';

enum NotifTier { gold, green, purple, blue, red }

class AppNotification {
  final String id;
  final NotifTier tier;
  final String icon;
  final String title;
  final String body;
  final String time;
  final bool read;

  AppNotification({
    required this.id,
    required this.tier,
    required this.icon,
    required this.title,
    required this.body,
    required this.time,
    required this.read,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      tier: _tierFromString(json['tier'] as String? ?? 'blue'),
      icon: json['icon'] as String? ?? '🔔',
      title: json['title'] as String,
      body: json['body'] as String? ?? '',
      time: json['time'] as String? ?? '',
      read: json['read'] as bool? ?? false,
    );
  }

  static NotifTier _tierFromString(String s) {
    switch (s) {
      case 'gold':
        return NotifTier.gold;
      case 'green':
        return NotifTier.green;
      case 'purple':
        return NotifTier.purple;
      case 'red':
        return NotifTier.red;
      case 'blue':
      default:
        return NotifTier.blue;
    }
  }
}

class NotificationsRepository {
  final ApiClient _api;
  NotificationsRepository(this._api);

  // TODO: wire to `GET /v1/notifications` once the endpoint is available.
  // For now this returns a hardcoded list to match the Screen 12 mockup.
  Future<List<AppNotification>> list() async {
    try {
      final res = await _api.dio.get<List<dynamic>>('/v1/notifications');
      final data = res.data ?? <dynamic>[];
      return data
          .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return _stub();
    }
  }

  List<AppNotification> _stub() => <AppNotification>[
        AppNotification(
          id: 'n1',
          tier: NotifTier.gold,
          icon: '✉️',
          title: 'Consent pending: Diction Drill #4',
          body: "Your parent hasn't approved this for public sharing yet.",
          time: '2h',
          read: false,
        ),
        AppNotification(
          id: 'n2',
          tier: NotifTier.green,
          icon: '🎬',
          title: 'New upload on your channel',
          body: '"Hamlet · Act III, Scene I" is now live.',
          time: '5h',
          read: false,
        ),
        AppNotification(
          id: 'n3',
          tier: NotifTier.purple,
          icon: '💬',
          title: 'Vik left feedback on "Intro Piece"',
          body: 'Watch pacing at line 47 — beat-work exercise before next take.',
          time: '1d',
          read: false,
        ),
        AppNotification(
          id: 'n4',
          tier: NotifTier.blue,
          icon: '📅',
          title: 'Class reminder: Thursday 6:30 PM',
          body: 'Showcase rehearsal for Act III.',
          time: '1d',
          read: true,
        ),
        AppNotification(
          id: 'n5',
          tier: NotifTier.red,
          icon: '💳',
          title: 'Fees due on 1 May',
          body: 'Invoice ₹4,500 will be generated for May term.',
          time: '3d',
          read: true,
        ),
      ];
}
