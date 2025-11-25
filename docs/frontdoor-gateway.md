# Orb Front Door – Dimensional Gateway

## Concept

The Front Door experience is the calm airlock to Orb: a fullscreen black cosmos with a living starfield and a glass-like dimensional window that hosts login/welcome content. The goal is to provide a reusable shell for future missions (AI presence, onboarding rituals, etc.) while delivering an initial working slice for authentication today.

## Component Tree

```
src/frontdoor/FrontDoorPage.tsx
 ├─ <SpaceBackground />    // animated starfield + shooting stars
 └─ <DimensionalWindow />  // glass panel shell w/ framing copy
      ├─ <OrbPresence />        // AI presence & personalization layer
      └─ {content slot}
          ├─ <FrontDoorLogin />    // Supabase login form
          └─ <FrontDoorWelcome />  // Authenticated greeting + CTAs
```

- `FrontDoorPage` wires Supabase session detection and swaps the window content between login + welcome views.
- `SpaceBackground` renders CSS-driven stars/shooting stars and now accepts hue/density props so the cosmos can react to user metadata.
- `OrbPresence` projects an AI/personal companion into the portal. It listens for status changes and mirrors the color signature derived from the user.
- `DimensionalWindow` handles the portal chrome (label, title, body) and accepts arbitrary children.

## Routes & Layout

- `/frontdoor` renders `FrontDoorPage` outside the normal dashboard chrome (nav, providers).
- All other pages now render inside `AppChrome`, which houses the existing navigation + context providers.
- This keeps the Front Door immersive while preserving current routes unchanged.

## Customizing Window Content

- To swap content, pass new children into `DimensionalWindow` from within `FrontDoorPage`.
- Example pattern:

```tsx
<DimensionalWindow title="Orb Mission Briefing">
  <MissionBriefing />
</DimensionalWindow>
```

- `DimensionalWindow` props:
  - `label` – small uppercase framing copy (defaults to "ORB · DIMENSIONAL GATEWAY").
  - `title` / `subtitle` – hero text.
  - `size` – `"base"` or `"wide"` widths for different experiences.

## Background Tuning

`SpaceBackground` props:

- `starCount` – base density (default `140`).
- `shootingStarCount` – number of streak elements (default `2`).
- `starHue` / `starSaturation` / `starLightness` – tint & glow settings, passed down as CSS variables.
- `auroraAlpha` – strength of the radial aurora gradient.

Animation knobs live in `src/frontdoor/SpaceBackground.css`:

- `@keyframes star-twinkle` controls brightness and drift.
- `@keyframes shooting-star` controls trails. Adjust durations or transforms for different speeds.
- `@media (prefers-reduced-motion: reduce)` already pauses motion—extend here for additional accessibility needs.

### Personalization source

`FrontDoorPage` inspects `preferences.metadata.starfield` (JSONB stored with user preferences) or falls back to a hashed seed so every visitor gets a deterministic cosmos:

```json
{
  "signatureHue": 205,
  "starfield": {
    "hue": 198,
    "saturation": 70,
    "lightness": 84,
    "density": 190,
    "shootingStarCount": 3,
    "auroraAlpha": 0.32
  }
}
```

Any missing values are derived from the seed (Supabase user id, otherwise `"demo-user"`), so you can start with zero metadata and opt-in fields over time. Future embeddings can map directly into these slots before persisting to `metadata`.

## AI Presence Layer

- `OrbPresence` is a lightweight AI companion panel rendered above the login/welcome state.
- Props: `persona` (“Luna”, “Sol”, etc.), `status` (`'listening' | 'ready' | 'syncing'`), `message`, `signatureHue`, plus `streamText` / `isStreaming` for the live text feed.
- The component animates a subtle waveform, shows framing copy, and injects a lore quote. You can swap the quote or feed live mission copy by changing the props from `FrontDoorPage`.
- Hook it up to actual agent responses by streaming text into `message` or providing persona-specific statuses.

### Live text streaming

- `useOrbPresenceStream` (in `frontdoor/useOrbPresenceStream.ts`) simulates a real-time text feed by progressively revealing a persona-specific script derived from the user seed.
- Arguments:
  - `persona`, `displayName`, `seed`, `enabled`.
- Returns `{ text, isStreaming }`, which are passed directly to `OrbPresence`.
- To hook into a real backend stream later, replace `buildPresenceScript` with a bridge to your API/WebSocket and keep the same hook surface.

## Auth Integration

- `FrontDoorLogin` uses Supabase email/password auth. If Supabase env vars are missing it falls back to “demo mode” messaging with a direct link to the dashboard.
- `FrontDoorWelcome` greets the authenticated user (falling back to email) and offers Enter Orb + Sign Out CTAs.
- Session flow lives in `FrontDoorPage`: it calls `supabase.auth.getSession()`, subscribes to `onAuthStateChange`, and refreshes state after login/sign-out.

## Testing & QA

Recommended manual checklist:

1. Load `/frontdoor` on desktop + mobile viewport; confirm starfield covers entire screen.
2. Tab through inputs—focus rings should remain visible against the background.
3. Submit invalid credentials and verify inline error messaging.
4. Verify typing latency while shooting stars animate (should feel smooth).
5. Preferred reduced motion: set `prefers-reduced-motion` in OS and confirm stars stop animating.
6. Authenticate (if configured) and ensure welcome state appears with working Enter/Sign Out actions.

Suggested automated tests:

- Snapshot/Storybook story for `DimensionalWindow` with sample content.
- Visual regression / story for `OrbPresence` so tint + waveform states remain stable.
- React Testing Library test for `FrontDoorPage` mocking Supabase + preferences to ensure login vs welcome rendering swaps correctly and personalized props are forwarded to `SpaceBackground`.

## Future Hooks

- Use `SpaceBackground` + `DimensionalWindow` for onboarding, AI contact moments, or mission briefings by swapping the child content.
- Personalize star parameters (color, density) using user metadata.
- Introduce cursor-proximity micro-interactions on the window border or breathing glows when AI presence is active.

