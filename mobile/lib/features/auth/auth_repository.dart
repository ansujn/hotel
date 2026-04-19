import 'package:dio/dio.dart';

import '../../api/api_client.dart';
import '../../models/token_pair.dart';
import '../../models/user.dart';
import 'token_storage.dart';

class AuthException implements Exception {
  final String message;
  AuthException(this.message);
  @override
  String toString() => 'AuthException: $message';
}

class AuthRepository {
  final ApiClient _client;
  final TokenStorage _tokenStorage;

  AuthRepository({ApiClient? client, TokenStorage? tokenStorage})
      : _client = client ?? ApiClient(),
        _tokenStorage = tokenStorage ?? TokenStorage();

  Dio get _dio => _client.dio;

  Future<void> sendOtp(String phone) async {
    try {
      await _dio.post<dynamic>(
        '/v1/auth/otp/send',
        data: <String, String>{'phone': phone},
      );
    } on DioException catch (e) {
      throw AuthException(_extractMessage(e, 'Failed to send OTP'));
    }
  }

  Future<TokenPair> verifyOtp(String phone, String code) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/v1/auth/otp/verify',
        data: <String, String>{'phone': phone, 'code': code},
      );
      final pair = TokenPair.fromJson(response.data!);
      await _tokenStorage.save(pair);
      return pair;
    } on DioException catch (e) {
      throw AuthException(_extractMessage(e, 'Invalid OTP'));
    }
  }

  Future<User> me() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/v1/me');
      return User.fromJson(response.data!);
    } on DioException catch (e) {
      throw AuthException(_extractMessage(e, 'Failed to fetch profile'));
    }
  }

  Future<void> logout() async {
    await _tokenStorage.clear();
  }

  String _extractMessage(DioException e, String fallback) {
    final data = e.response?.data;
    if (data is Map && data['message'] is String) {
      return data['message'] as String;
    }
    return fallback;
  }
}
