# banners

**Purpose:** the rotating hero banners on the home page, managed by admins.

**Structure**

- `banner.repository.ts` - `listActive(now)` returns banners that are active and inside their optional schedule window, in `sort_order`.
- `components/hero-carousel.tsx` - the carousel (client component).

**Funnel**

- User flow: visitors see the banners rotate on the home page, can pause, step back and forward, or click the call-to-action.
- Technical flow: home page -> `bannerRepository.listActive` -> `HeroCarousel`.

**Non-obvious rationale**

- Banners use a solid "tone" (umber, clay, ink, taupe) from the design system instead of an image or gradient. Admin-uploaded images can be added later as a new optional column without changing the carousel contract.
- The carousel stops rotating while hovered or focused, when paused by the user, and for people who prefer reduced motion. A pause button is always present when there is more than one slide.
- Admin management screens for banners are not built yet (the `banner.manage` permission already exists). Until then banners are created through the seed script or the database.
