import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_providers.dart';
import 'progress_repository.dart';

final progressRepositoryProvider = Provider<ProgressRepository>((ref) {
  final api = ref.watch(apiClientProvider);
  return ProgressRepository(api);
});

final progressProvider =
    FutureProvider.autoDispose.family<ProgressReport, String>(
  (ref, studentId) async {
    final repo = ref.watch(progressRepositoryProvider);
    return repo.getProgress(studentId);
  },
);
