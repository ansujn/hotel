import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vik_theatre/features/auth/login_screen.dart';
import 'package:vik_theatre/theme/app_theme.dart';

void main() {
  testWidgets('Login screen renders phone entry field', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          theme: AppTheme.dark(),
          home: const LoginScreen(),
        ),
      ),
    );
    await tester.pump();

    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('Send OTP'), findsOneWidget);
    expect(find.widgetWithText(TextField, ''), findsWidgets);
  });
}
