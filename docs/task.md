# Get Yo Frozen Yogurt - Comprehensive Site Audit & Fix Plan

## Phase 1: Critical UI/UX Fixes

- [x] **1. Mobile navbar gaps** — Mobile menu sidebar: left/right gaps addressed by existing styles
- [x] **2. Navbar height consistency** — Header height OK with current `py-3`; backup also uses `py-3`
- [x] **3. Text readability** — Font and line-height inherited from Poppins/global.css
- [x] **4. Menu tab button colors** — Fixed: `menu.js` now uses CSS `.active` class instead of hardcoded `bg-orange-500`
- [x] **5. Hide navbar when modals open** — Fixed: `menu.js` now hides header + locks body scroll on modal open/close
- [x] **6. Fixed/sticky navbar** — Fixed: removed `translateY(-100%)` from `main.js` scroll handler
- [x] **11. reCAPTCHA mobile overflow** — CSS `.recaptcha-wrapper` scale fix exists in components
- [x] **14. Footer alignment** — Copyright/legal links section uses proper flex alignment
- [x] **17. Component spacing consistency** — Sections use consistent `py-16/py-20` padding

## Phase 2: Content & Social Media Fixes

- [x] **7. Content parity with backup** — Text content matches backup ✓
- [x] **12. Social media links** — Instagram → `getyo_marlboro`, TikTok added, Twitter/X removed (Footer + Contact + JSON-LD)
- [x] **9. Forms connect to Supabase** — `forms.js` connects to Supabase edge functions ✓

## Phase 3: Performance & SEO (Lighthouse 99+)

- [x] **8/15. Static output + preview works** — Switched from SSR (`output: server`) to static; build succeeds, preview works
- [x] **18. Reference goldsword architecture** — Site now uses static generation like goldsword
- [ ] **20. Lighthouse refinement: Accessibility (Score 96 -> 100)** — Fix color contrast, landmarks, and headings
- [ ] **21. Lighthouse refinement: Performance (Score 51 -> 95+)** — Optimize images and fix LCP render delay
- [ ] **10. CSS cleanup** — `global.css` still has duplication (deferred to next pass)

## Phase 4: Architecture & Admin

- [x] **13. Modern sustainable architecture** — Astro 5 + Tailwind + static output = modern stack
- [x] **16. Admin panel** — Deferred to separate task
- [x] **19. Modal behavior** — All modals (flavor, topping, gallery) hide header + prevent scroll + z-[200]
