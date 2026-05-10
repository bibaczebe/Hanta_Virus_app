# BACKLOG

Items deferred from earlier sprints. Pick up after the sprint indicated; do not pull forward without explicit user approval.

## Post-S2.real polish pass

After S2.real ships and real data flows through the dashboard, do a focused visual polish pass.

### Globe markers restyle
**Why:** Current particle/marker system reads as "yellow blobs" against the dark globe — fine for a demo but loses precision once we want viewers to read severity at a glance.
**Source:** S1.5 user review (2026-05-10).
**Scope:**
- Replace flat `meshBasicMaterial` markers with a radial gradient sphere (bright centre, transparent edges) so the marker reads like a heat-spot, not a dot.
- Subtle pulse animation (scale 1.0 → 1.15 over ~1.5s ease-in-out) for "Outbreak"-status countries; slower / no pulse for "Slowing" / "Controlled".
- Marker size proportional to **real** case count (post-S2.real) — log-scale so 100-case and 10,000-case countries are both legible.
- Glow / halo ring on "Outbreak" status (already partially implemented for selected; extend to status-driven).
- Continue muting `severity_color` palette — `#e63946` and `#ff8c00` are slightly clownish under the gold-on-navy theme; consider warm-coral / amber instead.

### Layout drift — section spacing audit
**Why:** S1.5.1 fixed the banner/header overlap, but the user reports the rest of the page still feels like it "rozjeżdża się" — gaps between sections aren't uniform.
**Source:** S1.5 user review (2026-05-10).
**Scope:**
- Audit gaps between Header → Overview → Live Spread Map → Analytics tabs → Footer. Pick one cadence (suggested `space-y-6` ≈ 24px or `space-y-8` ≈ 32px) on the Dashboard root and remove the per-section `pt-6` / `pt-8` adjustments that compound it.
- Verify the `pt-2` added to `<main>` in Layout.jsx after the audit — may become redundant.
- Mobile: same audit at 375 px / 768 px breakpoints.
