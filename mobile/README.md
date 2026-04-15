# Vik Theatre — Mobile (Flutter)

Run this once to scaffold the Flutter project *inside* this folder:

```bash
cd mobile
flutter create --org in.viktheatre --project-name vik_theatre \
  --platforms=ios,android --empty .
```

Then add core deps to `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.1
  go_router: ^14.2.7
  dio: ^5.6.0
  flutter_secure_storage: ^9.2.2
  chewie: ^1.8.5
  video_player: ^2.9.1
  reactive_forms: ^17.0.1
  sentry_flutter: ^8.9.0
  posthog_flutter: ^4.8.0
  intl: ^0.19.0
```

Then:

```bash
flutter pub get
flutter run
```

## Architecture

- **State**: Riverpod providers (`lib/providers/`)
- **Routing**: go_router (`lib/routes/`)
- **API client**: generated from `../openapi.yaml`

  ```bash
  dart pub global activate openapi_generator_cli
  openapi-generator-cli generate \
    -i ../openapi.yaml \
    -g dart-dio \
    -o lib/api
  ```

- **Auth**: JWT in `flutter_secure_storage`
- **Video**: Mux HLS via `chewie`
- **Build**: Codemagic or `fastlane`

## Screens (match web)

1. Login (OTP)
2. Home / Dashboard
3. My Channel
4. Video player
5. Progress
6. Parent dashboard + consent
7. Notifications
