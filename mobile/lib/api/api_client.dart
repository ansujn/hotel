import 'package:dio/dio.dart';

import '../features/auth/token_storage.dart';
import '../models/token_pair.dart';

const String kApiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:8080',
);

class ApiClient {
  final Dio dio;
  final TokenStorage tokenStorage;

  ApiClient({Dio? dio, TokenStorage? tokenStorage})
      : dio = dio ??
            Dio(BaseOptions(
              baseUrl: kApiBaseUrl,
              connectTimeout: const Duration(seconds: 15),
              receiveTimeout: const Duration(seconds: 20),
              contentType: 'application/json',
            )),
        tokenStorage = tokenStorage ?? TokenStorage() {
    _installInterceptors();
  }

  void _installInterceptors() {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await tokenStorage.readAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401 &&
            error.requestOptions.extra['retried'] != true) {
          final refreshed = await _tryRefresh();
          if (refreshed) {
            final req = error.requestOptions;
            req.extra['retried'] = true;
            final newToken = await tokenStorage.readAccessToken();
            if (newToken != null) {
              req.headers['Authorization'] = 'Bearer $newToken';
            }
            try {
              final response = await dio.fetch<dynamic>(req);
              return handler.resolve(response);
            } catch (e) {
              return handler.next(error);
            }
          }
        }
        handler.next(error);
      },
    ));
  }

  Future<bool> _tryRefresh() async {
    final refresh = await tokenStorage.readRefreshToken();
    if (refresh == null || refresh.isEmpty) return false;
    try {
      final response = await Dio(BaseOptions(baseUrl: kApiBaseUrl)).post(
        '/auth/refresh',
        data: <String, String>{'refresh_token': refresh},
      );
      final data = response.data as Map<String, dynamic>;
      final pair = TokenPair.fromJson(data);
      await tokenStorage.save(pair);
      return true;
    } catch (_) {
      await tokenStorage.clear();
      return false;
    }
  }
}
