import 'package:dio/dio.dart';

import '../../api/api_client.dart';
import '../../models/asset.dart';
import '../../models/channel.dart';

class ChannelException implements Exception {
  final String message;
  ChannelException(this.message);
  @override
  String toString() => 'ChannelException: $message';
}

class ChannelRepository {
  final ApiClient _client;

  ChannelRepository({required ApiClient client}) : _client = client;

  Future<Channel> getChannel(String studentId) async {
    try {
      final response = await _client.dio.get<Map<String, dynamic>>(
        '/v1/students/$studentId/channel',
      );
      final data = response.data;
      if (data == null) {
        throw ChannelException('Empty channel response');
      }
      return Channel.fromJson(data);
    } on DioException catch (e) {
      final msg = e.response?.data is Map &&
              (e.response?.data as Map)['message'] is String
          ? (e.response?.data as Map)['message'] as String
          : 'Failed to load channel';
      throw ChannelException(msg);
    }
  }

  Future<Asset> getAsset(String studentId, String assetId) async {
    final channel = await getChannel(studentId);
    return channel.assets.firstWhere(
      (Asset a) => a.id == assetId,
      orElse: () => throw ChannelException('Asset not found or not visible'),
    );
  }
}
