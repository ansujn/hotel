import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vik_theatre/features/channel/channel_providers.dart';
import 'package:vik_theatre/features/channel/channel_repository.dart';
import 'package:vik_theatre/features/channel/channel_screen.dart';
import 'package:vik_theatre/models/asset.dart';
import 'package:vik_theatre/models/channel.dart';
import 'package:vik_theatre/models/user.dart';
import 'package:vik_theatre/theme/app_theme.dart';

class _FakeRepoLoading extends ChannelRepository {
  _FakeRepoLoading() : super(client: _never());

  @override
  Future<Channel> getChannel(String studentId) {
    return Future<Channel>.delayed(const Duration(seconds: 30), () {
      return const Channel(
        student: User(id: 's', phone: '+91', role: 'student'),
        assets: <Asset>[],
      );
    });
  }
}

class _FakeRepoError extends ChannelRepository {
  _FakeRepoError() : super(client: _never());

  @override
  Future<Channel> getChannel(String studentId) async {
    throw ChannelException('boom');
  }
}

// ignore: prefer_function_declarations_over_variables
dynamic _never() => throw UnimplementedError('api client not needed in test');

Widget _wrap(Widget child, ProviderContainer container) {
  return UncontrolledProviderScope(
    container: container,
    child: MaterialApp(theme: AppTheme.dark(), home: child),
  );
}

void main() {
  testWidgets('ChannelScreen shows loading indicator', (tester) async {
    final container = ProviderContainer(overrides: <Override>[
      channelRepositoryProvider.overrideWithValue(_FakeRepoLoading()),
    ]);
    addTearDown(container.dispose);

    await tester.pumpWidget(
      _wrap(const ChannelScreen(studentId: 'abc'), container),
    );
    await tester.pump();

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('ChannelScreen shows error state with retry', (tester) async {
    final container = ProviderContainer(overrides: <Override>[
      channelRepositoryProvider.overrideWithValue(_FakeRepoError()),
    ]);
    addTearDown(container.dispose);

    await tester.pumpWidget(
      _wrap(const ChannelScreen(studentId: 'abc'), container),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.text('Could not load channel'), findsOneWidget);
    expect(find.text('Retry'), findsOneWidget);
  });
}
