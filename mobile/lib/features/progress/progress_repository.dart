import '../../api/api_client.dart';

class DimScore {
  final String dimension;
  final int score;
  DimScore({required this.dimension, required this.score});

  factory DimScore.fromJson(Map<String, dynamic> json) => DimScore(
        dimension: json['dimension'] as String,
        score: (json['score'] as num).toInt(),
      );
}

class Assessment {
  final DateTime date;
  final String assetId;
  final String assetTitle;
  final List<DimScore> scores;
  final String? note;

  Assessment({
    required this.date,
    required this.assetId,
    required this.assetTitle,
    required this.scores,
    this.note,
  });

  factory Assessment.fromJson(Map<String, dynamic> json) => Assessment(
        date: DateTime.parse(json['date'] as String),
        assetId: json['asset_id'] as String,
        assetTitle: json['asset_title'] as String,
        scores: (json['scores'] as List)
            .map((e) => DimScore.fromJson(e as Map<String, dynamic>))
            .toList(),
        note: json['note'] as String?,
      );
}

class ProgressReport {
  final List<DimScore> averages;
  final List<Assessment> timeline;

  ProgressReport({required this.averages, required this.timeline});

  factory ProgressReport.fromJson(Map<String, dynamic> json) => ProgressReport(
        averages: (json['averages'] as List)
            .map((e) => DimScore.fromJson(e as Map<String, dynamic>))
            .toList(),
        timeline: (json['timeline'] as List)
            .map((e) => Assessment.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class ProgressRepository {
  final ApiClient _api;
  ProgressRepository(this._api);

  Future<ProgressReport> getProgress(String studentId) async {
    final res = await _api.dio.get<Map<String, dynamic>>(
      '/v1/students/$studentId/progress',
    );
    return ProgressReport.fromJson(res.data!);
  }
}
