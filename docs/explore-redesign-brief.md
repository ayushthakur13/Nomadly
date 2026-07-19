# Explore Module Redesign Brief

Status: Reference document, locked before implementation
Read alongside: docs/DESIGN.md, docs/PRODUCT.md, docs/ARCHITECTURE.md

This document exists so that neither Impeccable nor AntiGravity improvises page structure or business logic while working on the Explore module. Treat it as the source of truth for scope. If a decision isn't covered here, stop and ask rather than inventing one.

## 1. Purpose and Register

Explore is Nomadly's discovery surface: a browsable feed of public trip itineraries other users have created, not a search engine over structured inventory. Treat it as browse-first, filters and search are refinement tools, not the primary interaction.

Explore is the one surface allowed to lean into the "wanderlust, rich imagery" brand language from docs/PRODUCT.md, more visual than Home or My Trips because it is a browsing experience, not a management one. Richness means larger photography and more generous spacing, not a different rulebook. Every hard rule in docs/DESIGN.md still applies here exactly as it applies everywhere else in the app: no text gradients, no glassmorphic treatment on core content, no thick side-stripe borders, no arbitrary or invented color shades.

## 2. Page Anatomy (Explore list page)

Top to bottom, in this order:

1. **Intro band.** Shorter than the current full-bleed hero. Real trip cover photography as a background treatment (a muted photo or soft collage), one line of value-prop copy, no radial gradient overlays. If a search input lives in this band, it is a solid card sitting on top of the band background, not a translucent or backdrop-blurred surface.
2. **Filter bar.** Category pills for all 10 real categories (see Section 4), plus the two real sort modes (Recent, Popular). Compact, quiet treatment, no colored glow shadows, no emoji-heavy pill styling. This is a utility bar, not a visual centerpiece.
3. **Grid of trip cards.** The main content, see Section 3 for card anatomy.
4. **Empty / zero-results state.** Required whenever a filtered search returns nothing. Must include supportive copy naming what happened (not generic "no results") and a clear action: clear filters, or browse all trips.
5. **Pagination.** Cursor-based, matching the existing compound index on the backend. Infinite scroll or a Load More button that requests the next cursor. Do not implement page-number based pagination, the backend does not support random-access paging.

## 3. Card Anatomy

Explore cards share the same underlying primitives as TripCard (used in Home / My Trips), and must NOT reimplement any of the following independently:

- Date range formatting: import the shared `formatDateRange` utility. Do not hand-roll `toLocaleDateString` calls.
- Corner radius, overlay badge treatment, and circular icon button treatment: follow whatever is documented in ARCHITECTURE.md's card conventions section (this needs a decision, see Section 6, then update accordingly).

What is allowed to differ from TripCard, intentionally, because the content is genuinely different, not because of inconsistent styling:

- Taller image proportion, since photography is the point of a discovery card.
- A one-line description/hook beneath the title. TripCard does not have this and should not gain one, own-trip cards don't need a pitch.
- Footer content: creator avatar, name, handle, and like count, instead of TripCard's own-trip stats (days / members / visibility). This is legitimately different information, not a styling inconsistency to fix.

Overlay actions on the card image: like (heart) and save (bookmark) as circular icon buttons, using whatever shared overlay-icon-button style gets documented (see Section 6).

## 4. Real Categories and Sort Modes (do not invent or trim)

Categories (exact values, from the current filter implementation):
adventure, leisure, business, family, solo, couple, friends, backpacking, luxury, budget

Sort modes: `recent`, `most-liked` (displayed as "Recent" and "Popular")

Neither tool should add, remove, or rename these without an explicit decision logged here first.

## 5. Guardrails (business logic that must not change)

- Only trips with `isPublic: true` are ever rendered on this surface.
- Card actions map to real, existing service calls only: `likeTripAPI`, `unlikeTripAPI`, `saveTripAPI`, `unsaveTripAPI`, `cloneTripAPI`, `fetchTripSocialStatusAPI`. No new interactions get invented at the design layer.
- Creator information shown on a card or detail page comes only from the existing `publicProfileUser()` serializer fields. Never surface fields that serializer deliberately excludes.
- Pagination requests must use the cursor parameter the backend already returns, not an offset/skip parameter.

## 6. Open Decisions (resolve before or during implementation, not silently)

- **Card corner radius conflict**: docs/DESIGN.md specifies `rounded-2xl`. Current shipped code (TripCard.tsx, ExploreGrid.tsx) and ARCHITECTURE.md's card conventions use `rounded-xl`. Recommendation: DESIGN.md wins, since it's the newer, deliberately produced system doc. If accepted, TripCard.tsx and SavedTripCard.tsx must be updated to match, not just Explore, and ARCHITECTURE.md's card conventions section should be edited to reference DESIGN.md rather than duplicate values.
- **Overlay icon button treatment**: currently documented in ARCHITECTURE.md (from a previous pass). Confirm this still applies as-is, or update it in the same pass as the corner-radius decision, so there is one place these values live, not two documents describing the same thing differently.

## 7. Known Bug to Fix While in This Code

`ExploreHero.tsx` currently uses `text-emerald-250` on the hero search icon. This is not a valid Tailwind shade in the default palette or in `tailwind.config.js`'s custom extension, it silently generates no CSS. Replace with a real documented shade.

## 8. Out of Scope for This Pass

- The Explore trip detail page (`ExploreTrip.tsx`, `ExploreTripHero.tsx`, `ExploreTripPanels.tsx`). Separate, later task.
- Any backend Explore/Social Layer logic. Already built and verified, this is frontend-only.
- Adding new filter dimensions, new sort modes, or new card actions beyond what's listed in Section 4 and Section 5.