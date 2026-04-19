import 'package:dio/dio.dart';

import '../../api/api_client.dart';
import '../../models/consent.dart';

class ConsentException implements Exception {
  final String message;
  ConsentException(this.message);
  @override
  String toString() => 'ConsentException: $message';
}

class ConsentRepository {
  final ApiClient _client;
  ConsentRepository({ApiClient? client}) : _client = client ?? ApiClient();

  Dio get _dio => _client.dio;

  /// Fetch the public context for a token (asset preview, student, batch).
  /// Returns `null` when the backend returns 404/410 (invalid or expired).
  /// NOTE: The backend `GET /v1/consent/{token}` is not yet in openapi.yaml
  /// — Agent A will expose it. Until then, we treat any non-2xx as "no context"
  /// and let the parent still attempt to sign.
  Future<ConsentContext?> getContext(String token) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/v1/consent/$token');
      final data = response.data;
      if (data == null) return null;
      return ConsentContext.fromJson(data);
    } on DioException catch (e) {
      final code = e.response?.statusCode;
      if (code == 404 || code == 410) return null;
      return null;
    }
  }

  Future<void> submit(String token, ConsentSignReq req) async {
    try {
      await _dio.post<dynamic>('/v1/consent/$token', data: req.toJson());
    } on DioException catch (e) {
      final data = e.response?.data;
      final msg = (data is Map && data['message'] is String)
          ? data['message'] as String
          : 'Failed to submit consent';
      throw ConsentException(msg);
    }
  }
}
