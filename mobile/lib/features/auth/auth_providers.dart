import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/api_client.dart';
import '../../models/user.dart';
import 'auth_repository.dart';
import 'token_storage.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(tokenStorage: ref.watch(tokenStorageProvider));
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    client: ref.watch(apiClientProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});

class AuthController extends AsyncNotifier<User?> {
  @override
  Future<User?> build() async {
    final storage = ref.watch(tokenStorageProvider);
    final token = await storage.readAccessToken();
    if (token == null || token.isEmpty) return null;
    try {
      return await ref.read(authRepositoryProvider).me();
    } catch (_) {
      await storage.clear();
      return null;
    }
  }

  Future<void> sendOtp(String phone) async {
    await ref.read(authRepositoryProvider).sendOtp(phone);
  }

  Future<void> verifyOtp(String phone, String code) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(authRepositoryProvider);
      await repo.verifyOtp(phone, code);
      return repo.me();
    });
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncValue.data(null);
  }
}

final authStateProvider =
    AsyncNotifierProvider<AuthController, User?>(AuthController.new);
