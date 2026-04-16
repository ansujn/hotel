import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/auth_providers.dart';
import '../features/auth/login_screen.dart';
import '../features/channel/channel_screen.dart';
import '../features/channel/video_detail_screen.dart';
import '../features/consent/consent_screen.dart';
import '../features/home/home_screen.dart';
import '../features/notifications/notifications_screen.dart';
import '../features/parent/parent_home_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: _AuthListenable(ref),
    redirect: (context, state) {
      final auth = ref.read(authStateProvider);
      final user = auth.valueOrNull;
      final loggedIn = user != null;
      final loggingIn = state.matchedLocation == '/login';
      final isSplash = state.matchedLocation == '/';
      final isPublicConsent = state.matchedLocation.startsWith('/consent/');
      final isPublicChannel = state.matchedLocation.startsWith('/channel/');

      if (auth.isLoading) return null;
      if (isPublicConsent) return null;
      if (isPublicChannel) return null;

      if (!loggedIn && !loggingIn && !isSplash) return '/login';
      if (loggedIn && (loggingIn || isSplash)) {
        return user.role == 'parent' ? '/parent' : '/home';
      }
      if (loggedIn &&
          user.role != 'parent' &&
          state.matchedLocation.startsWith('/parent')) {
        return '/home';
      }
      return null;
    },
    routes: <RouteBase>[
      GoRoute(
        path: '/',
        builder: (_, __) => const _SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (_, __) => const HomeScreen(),
      ),
      GoRoute(
        path: '/channel/:studentId',
        builder: (_, state) => ChannelScreen(
          studentId: state.pathParameters['studentId']!,
        ),
      ),
      GoRoute(
        path: '/channel/:studentId/v/:assetId',
        builder: (_, state) => VideoDetailScreen(
          studentId: state.pathParameters['studentId']!,
          assetId: state.pathParameters['assetId']!,
          token: state.uri.queryParameters['token'],
        ),
      ),
      GoRoute(
        path: '/parent',
        builder: (_, __) => const ParentHomeScreen(),
        routes: <RouteBase>[
          GoRoute(
            path: 'consent',
            builder: (_, __) => const ParentHomeScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/notifications',
        builder: (_, __) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/consent/:token',
        builder: (_, state) => ConsentScreen(
          token: state.pathParameters['token']!,
        ),
      ),
    ],
  );
});

class _AuthListenable extends ChangeNotifier {
  _AuthListenable(Ref ref) {
    ref.listen(authStateProvider, (_, __) => notifyListeners());
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

class _Placeholder extends StatelessWidget {
  final String title;
  const _Placeholder({required this.title});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text(title)),
    );
  }
}
