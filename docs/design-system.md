# Design system

Tokens live in `packages/ui/src/styles/theme.css`; components in `packages/ui/src/components`.

## Principles

- Warm, earthy and calm. The interface stays quiet so the products are the focus.
- **No gradients. No emoji.** Surfaces are solid colours; icons are Lucide. `pnpm check:design` enforces both.
- Borders over shadows. Generous whitespace. One clear call to action per view.

## Colour

| Token                               | Value                                   | Use                                                          |
| ----------------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| `primary`                           | `#473536`                               | Brand, primary buttons, navigation highlight (umber)         |
| `primary-hover`                     | `#362728`                               | Hover state                                                  |
| `primary-soft`                      | `#F1ECED`                               | Soft brand backgrounds                                       |
| `ink`                               | `#0A0708`                               | Headings, text on clay                                       |
| `taupe`                             | `#ABA79F`                               | Placeholders, soft neutral surfaces, decorative icons        |
| `accent`                            | `#D98F75`                               | Main call to action (buy, apply, approve); text on it is ink |
| `accent-hover`                      | `#C77A5F`                               | Hover state                                                  |
| `accent-soft`                       | `#FBF1EC`                               | Soft accent backgrounds                                      |
| `accent-strong`                     | `#9A5440`                               | Accent used as text on light backgrounds                     |
| `canvas`                            | `#FAF9F7`                               | Page background                                              |
| `surface`                           | `#FFFFFF`                               | Cards and inputs                                             |
| `surface-muted`                     | `#F3F1EE`                               | Subtle panels, table headers                                 |
| `line` / `line-strong`              | `#E4E1DC` / `#CFCBC4`                   | Borders                                                      |
| `body` / `muted`                    | `#2B2325` / `#6E6862`                   | Body text and secondary text                                 |
| `success` `warning` `danger` `info` | `#2A7352` `#8A5C0E` `#B3382F` `#2F6690` | Status only, each with a `-soft` background                  |

The accent is a soft clay on purpose. It replaced a heavier brick red because a lighter warm tone feels friendlier and keeps attention on buying instead of feeling like a warning.

Contrast (WCAG): ink on clay 7.8:1, white on umber 11.5:1, muted text on white 5.5:1, accent-strong on white 5.6:1. White text is not used on the clay accent (2.6:1).

## Typography

| Use             | Font                          |
| --------------- | ----------------------------- |
| Headings        | Bitter (variable, slab serif) |
| Interface, body | Mukta (humanist sans)         |
| Nepali text     | Mukta (covers Devanagari)     |

Fonts are installed from Fontsource, so they are self-hosted and there are no runtime requests to Google. Bitter is a warm slab serif that feels like a price tag; Mukta is a friendly sans whose Latin and Devanagari letters come from the same family, so English and Nepali text match.

## Components (`@feri/ui`)

`Button` (variants: primary, accent, secondary, ghost, danger; sizes sm, md, lg; `asChild`, `isLoading`), `Input`, `Textarea`, `Select`, `FormField` (label, hint and error wiring with ARIA), `Badge` (tones), `Card` family, `Alert`, `EmptyState`, `Container`, `Skeleton`, `Spinner`.

Guidelines:

- Use `Button variant="accent"` for the single main action on a screen; everything else is primary, secondary or ghost.
- Every list needs an `EmptyState`.
- Use `FormField` for every form control so labels, hints and errors are connected for screen readers.
- Status colours are for status only (badges and alerts), never decoration.

## Accessibility checklist

- Semantic elements (`nav`, `main`, `header`, `footer`, lists, tables with `th scope`).
- Visible focus ring on every interactive element (set globally).
- The hero carousel pauses on hover, focus and on request, has previous and next controls, and respects reduced motion.
- Images have meaningful `alt` text; decorative icons use `aria-hidden`.
- Touch targets are at least 36px, most controls are 44px.
