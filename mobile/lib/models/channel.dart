import 'asset.dart';
import 'user.dart';

class Channel {
  final User student;
  final List<Asset> assets;

  const Channel({required this.student, required this.assets});

  factory Channel.fromJson(Map<String, dynamic> json) {
    final studentJson = (json['student'] as Map<String, dynamic>?) ??
        <String, dynamic>{'id': '', 'phone': '', 'role': 'student'};
    final rawAssets = (json['assets'] as List<dynamic>?) ?? <dynamic>[];
    return Channel(
      student: User.fromJson(studentJson),
      assets: rawAssets
          .whereType<Map<String, dynamic>>()
          .map(Asset.fromJson)
          .toList(growable: false),
    );
  }
}
