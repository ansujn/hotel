import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/asset.dart';
import '../../models/channel.dart';
import '../auth/auth_providers.dart';
import 'channel_repository.dart';

final channelRepositoryProvider = Provider<ChannelRepository>((ref) {
  return ChannelRepository(client: ref.watch(apiClientProvider));
});

final channelProvider =
    FutureProvider.family<Channel, String>((ref, studentId) async {
  return ref.watch(channelRepositoryProvider).getChannel(studentId);
});

class AssetArgs {
  final String studentId;
  final String assetId;
  const AssetArgs({required this.studentId, required this.assetId});

  @override
  bool operator ==(Object other) =>
      other is AssetArgs &&
      other.studentId == studentId &&
      other.assetId == assetId;

  @override
  int get hashCode => Object.hash(studentId, assetId);
}

final assetProvider =
    FutureProvider.family<Asset, AssetArgs>((ref, args) async {
  final channel = await ref.watch(channelProvider(args.studentId).future);
  return channel.assets.firstWhere(
    (Asset a) => a.id == args.assetId,
    orElse: () => throw StateError('Asset ${args.assetId} not found'),
  );
});
