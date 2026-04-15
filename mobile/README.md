# Vik Theatre — Mobile (Flutter)

Single Flutter app for students and parents (role-based routing).

## Prerequisites

- Flutter 3.22+ (Dart 3.4+)
- Xcode 15+ for iOS, Android Studio / SDK 34+ for Android

## First-time setup

The app source (`lib/`, `test/`, `pubspec.yaml`, `analysis_options.yaml`) is
already committed. The native platform folders (`ios/`, `android/`) are **not**
checked in — run `flutter create` once to generate them:

```bash
cd mobile
flutter create --org in.viktheatre --project-name vik_theatre \
  --platforms=ios,android --empty .
flutter pub get
```

`flutter create` will leave our existing `lib/`, `test/`, and `pubspec.yaml`
alone (it only fills in missing files).

## Running against a local Go API

The API base URL is read from the `API_BASE_URL` dart-define at build time.

```bash
# Android emulator (localhost of the host machine = 10.0.2.2)
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080

# iOS simulator
flutter run --dart-define=API_BASE_URL=http://localhost:8080
```

Default (no define) is `http://10.0.2.2:8080`.

## Dev OTP

The Go API accepts the bypass code `000000` in development for any phone
number. Use it to skip SMS provider setup.

## Architecture

- **State**: Riverpod providers (`lib/features/*/‹feature›_providers.dart`)
- **Routing**: go_router (`lib/routes/app_router.dart`)
- **API client**: centralized Dio in `lib/api/api_client.dart` with bearer +
  refresh-on-401 interceptors
- **Auth**: JWT in `flutter_secure_storage` via `TokenStorage`
- **Theme**: `lib/theme/app_theme.dart` — dark, Fraunces + Inter via
  `google_fonts` (no bundled TTFs)
- **Models**: plain Dart classes in `lib/models/` (no `freezed`/build_runner)

## Screens

1. `/login` — phone → OTP (Screen 01)
2. `/home` — dashboard (Screen 02)
3. `/channel` — placeholder (my channel)
4. `/consent/:token` — parent consent (public)

## Tests

```bash
flutter test
```

## Release build (later)

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://api.viktheatre.in
flutter build ipa --release --dart-define=API_BASE_URL=https://api.viktheatre.in
```
