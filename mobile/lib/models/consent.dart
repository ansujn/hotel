class ConsentScope {
  final bool channel;
  final bool social;
  final bool print;
  final int validMonths; // 6 | 12 | 24

  const ConsentScope({
    required this.channel,
    required this.social,
    required this.print,
    required this.validMonths,
  });

  ConsentScope copyWith({
    bool? channel,
    bool? social,
    bool? print,
    int? validMonths,
  }) {
    return ConsentScope(
      channel: channel ?? this.channel,
      social: social ?? this.social,
      print: print ?? this.print,
      validMonths: validMonths ?? this.validMonths,
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'channel': channel,
        'social': social,
        'print': print,
        'valid_months': validMonths,
      };
}

class ConsentSignReq {
  final String otp;
  final String signedName;
  final ConsentScope scope;

  const ConsentSignReq({
    required this.otp,
    required this.signedName,
    required this.scope,
  });

  Map<String, dynamic> toJson() => <String, dynamic>{
        'otp': otp,
        'signed_name': signedName,
        'scope': scope.toJson(),
      };
}

class ConsentContext {
  final String assetId;
  final String assetTitle;
  final String? muxPlaybackId;
  final String? thumbnailUrl;
  final String studentName;
  final String? batchName;
  final DateTime createdAt;

  const ConsentContext({
    required this.assetId,
    required this.assetTitle,
    required this.studentName,
    required this.createdAt,
    this.muxPlaybackId,
    this.thumbnailUrl,
    this.batchName,
  });

  factory ConsentContext.fromJson(Map<String, dynamic> json) {
    final asset = (json['asset'] as Map?) ?? <String, dynamic>{};
    final student = (json['student'] as Map?) ?? <String, dynamic>{};
    final batch = json['batch'] as Map?;
    return ConsentContext(
      assetId: asset['id'] as String? ?? '',
      assetTitle: asset['title'] as String? ?? '',
      muxPlaybackId: asset['mux_playback_id'] as String?,
      thumbnailUrl: asset['thumbnail_url'] as String?,
      studentName: student['name'] as String? ?? '',
      batchName: batch?['name'] as String?,
      createdAt: DateTime.tryParse(asset['created_at'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}
