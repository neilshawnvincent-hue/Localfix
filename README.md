<<<<<<< HEAD
# LocalFix

Home services, sorted. A responsive home-services demo built with Expo, React and TypeScript, with customer and professional workspaces.

> **Demo only:** no real services are booked, professionals dispatched, identities verified, SMS messages sent or payments collected. Do not enter sensitive personal, identity or payment information.

## Quick Start

Use Node.js **22.13 or newer** and npm. Consult the [Expo SDK 57 documentation](https://docs.expo.dev/versions/v57.0.0/) for platform requirements.

```bash
npm install
npm run web -- --port 3000
```

Open [http://localhost:3000](http://localhost:3000). No Supabase credentials are required for the redesigned web demo. The VS Code task **Start Expo Web on port 3000** runs the same command.

## Customer Flow

1. Search, filter or sort the six home-service categories.
2. Choose a service and open a customer demo workspace using a display name.
3. Describe the job, enter a service address and choose a future appointment within 30 days.
4. Review the appointment and separate INR 60 visit fee, then confirm.
5. Follow the booking timeline. Labeled demo controls simulate assignment, travel, arrival and assessment.
6. Approve the work quote before work begins. After completion, make a demo payment, rate the service and download a text receipt.

Drafts and bookings survive refreshes. Cancel an appointment before work begins or review completed bookings from **My bookings**. The demo visit fee remains recorded after cancellation; no actual charge or refund occurs.

## Professional Flow

1. Switch workspace from the profile control in the header and choose **I am a professional**.
2. Enter a display name and acknowledge the demo verification notice. No identity documents are requested.
3. Go online, open a customer request and accept it.
4. Mark departure and arrival, send a work quote, then complete the approved job.
5. Review earnings calculated from completed jobs with recorded demo payments. Visit fees are excluded from professional earnings.

Both roles share the same local bookings so one browser can demonstrate the full workflow. Separately labeled controls can simulate customer approval and payment while viewing the professional workspace. They are demo controls, not production authorization.

## Features

- Responsive desktop sidebar and mobile bottom navigation.
- Searchable service catalog with local photography, category filters and price sorting.
- Persisted booking drafts, history, saved addresses and ratings.
- Validated appointment times and guarded job-status transitions.
- Quote approval, cancellation confirmation and simulated receipts.
- Professional availability, job management and derived earnings.
- Accessible form labels, keyboard focus, status announcements and reduced-motion support.
- Profile editing, workspace switching, local data reset and support FAQs.

The redesigned web interface is English-only. Existing native screens retain their separate UI and English/Hindi translation resources.

## Development

| Command | Purpose |
| --- | --- |
| `npm run web -- --port 3000` | Start the web development server |
| `npm start` | Start the Expo development server |
| `npm run ios` | Start for an installed iOS simulator |
| `npm run android` | Start for an Android emulator/device |
| `npm test` | Run booking-domain tests with Node's built-in test runner |
| `npm run typecheck` | Typecheck all web and native source files |
| `npm run build:web` | Export the static web application to `dist/` |
| `npm run build` | Export all configured platforms |

`npm test` covers appointment validation, the full job lifecycle, invalid transitions, decimal quotes, duplicate payments, ratings and cancellation. Node may emit a module-type warning when loading the TypeScript domain file; the tests do not require a separate test framework.

The repository currently has five pre-existing native TypeScript errors: missing `TranslationKey` types in booking/checkout, `NodeJS.Timeout` types in two worker screens, and a missing `quote_provided` status configuration. `npm run typecheck` reports these independently of the web export. The existing `npm run lint` command launches Expo's ESLint setup if no configuration is installed.

## Project Structure

```text
src/
   app/                   Expo Router routes
      _layout.web.tsx       Shared web shell
      (auth)/              Demo role selection and sign-in
      (customer)/          Booking, tracking, account and history
      (worker)/            Professional jobs and earnings
      (kyc)/               Demo onboarding acknowledgment
      (services)/          Catalog and tracking entry points
      (modals)/            Support
   components/web/        Responsive web pages, controls and styles
   components/ui/         Existing native UI components
   constants/             Service definitions and native mock data
   lib/bookingFlow.ts     Web appointment validation and state transitions
   lib/supabase.ts        Existing native Supabase client
   store/webStore.ts      Persisted web booking workspace
   store/authStore.ts     Shared mock identity store
   locales/               Existing native translation resources
public/images/           Local service photographs
tests/                   Booking-domain regression tests
supabase/                Existing database configuration and migrations
postman/                 API workspace assets
```

Web-specific `.web.tsx` route files have matching native route files. Expo selects the platform implementation; the web redesign does not replace the native screens. The web booking store is separate from the existing native mock job store.

## State and Configuration

The web demo uses Zustand with AsyncStorage (browser local storage on web):

| Storage key | Contents |
| --- | --- |
| `localfix-auth-mock` | Demo identity, role and onboarding state |
| `localfix-web-workspace-v1` | Draft, bookings, availability and saved address |

Signing out preserves bookings. **My account > Reset demo data** clears both roles' booking data, ratings, earnings and saved address. Browser storage is not an account database, is not encrypted, and does not provide access control or cross-device sync.

The existing native integration reads the following public environment variables from a local `.env` file:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

Only use a public client key here, never a Supabase service-role key. `EXPO_PUBLIC_*` values are bundled into the client. Keep credentials out of Git. The Supabase migrations do not make the redesigned web demo a live service; it intentionally uses local state.

## Production Readiness

Before using LocalFix with real customers, implement server-backed authentication and authorization, booking ownership and professional assignment, Supabase RLS policies, server-side validation and scheduling, real identity verification, payments/refunds with verified webhooks, notifications, location services, support escalation, privacy controls and auditing. Add integration and end-to-end coverage for those services. Client-side route guards and state transitions alone are not security boundaries.

The static export includes assets from `public/`. Deploy `dist/` with route handling appropriate for Expo Router; verify direct links and refreshes as well as in-app navigation. Native builds and live backend integrations require separate validation.

## Visual Assets

Service photos are stored locally under `public/images/` and sourced from Unsplash:

- [Plumbing](https://images.unsplash.com/photo-1585704032915-c3400ca199e7)
- [Electrical](https://images.unsplash.com/photo-1621905251189-08b45d6a269e)
- [Carpentry](https://images.unsplash.com/photo-1504148455328-c376907d081c)
- [Painting](https://images.unsplash.com/photo-1562259949-e8e7689d7828)
- [Cleaning](https://images.unsplash.com/photo-1581578731548-c64695cc6952)
- [AC and appliance repair](https://images.unsplash.com/photo-1581092918056-0c4c3acd3789)

Typography uses DM Sans and Space Grotesk from Google Fonts, with local fallback fonts when unavailable. Icons use the existing Ionicons package. Review the applicable asset licenses before redistribution.

## License

See [LICENSE](LICENSE) for the repository's existing MIT license.
=======
# localfix
A cross-platform (React Native/Supabase) hyperlocal gig services app for SIH 2026. LocalFix matches users with local laborers using 5km geofencing, dual identity verification, and a secure OTP-driven escrow payment loop.
>>>>>>> origin/main
