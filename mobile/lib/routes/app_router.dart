import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/auth_providers.dart';
import '../features/auth/login_screen.dart';
import '../features/home/home_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: _AuthListenable(ref),
    redirect: (context, state) {
      final auth = ref.read(authStateProvider);
      final loggedIn = auth.valueOrNull != null;
      final loggingIn = state.matchedLocation == '/login';
      final isSplash = state.matchedLocation == '/';
      final isPublicConsent = state.matchedLocation.startsWith('/consent/');

      if (auth.isLoading) return null;
      if (isPublicConsent) return null;

      if (!loggedIn && !loggingIn && !isSplash) return '/login';
      if (loggedIn && (loggingIn || isSplash)) return '/home';
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
        path: '/channel',
        builder: (_, __) => const _Placeholder(title: 'Channel'),
      ),
      GoRoute(
        path: '/consent/:token',
        builder: (_, state) => _Placeholder(
          title: 'Consent ${state.pathParameters['token']}',
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
