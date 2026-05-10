# Real epidemiological data sources — discovery (S2.real.1)

Probed 2026-05-10. The objective is to ship `hantatracker.tech` with real numbers from official primary sources only — no scraping of competitor sites (`hantatracker.online`, `hantatracker.xyz`).

The mock data the dashboard currently shows is **wildly out of scale** with reality. For comparison, the dashboard mock shows the United States with **850** active cases; the real CDC NNDSS YTD figure for 2026 (through week 17) is **5 cases total** (1 non-HPS + 4 HPS). This document records what's available so we can replace the mock with credible data in S2.real.2.

## Executive summary — what to use, what to skip

| Tier | Source | Coverage | Format | Use? |
|---|---|---|---|---|
| **1 — ship now** | WHO Disease Outbreak News API | Global, narrative | OData v4 JSON | ✅ Primary global feed |
| **1 — ship now** | CDC NNDSS Weekly Data (Socrata `x9gk-5huc`) | US, per state, weekly | Socrata SODA JSON | ✅ Primary US feed |
| 2 — defer | ECDC Annual Epidemiological Report | EU/EEA, annual | PDF (no API) | Park to v0.4+ (PDF parser sprint) |
| 2 — defer | PAHO PLISA / weekly bulletins | Americas | PDF / unstable HTML | Park to v0.4+ |
| dead | WHO DON RSS (`feeds/entity/csr/don/en/rss.xml`) | — | — | Returns 404. Use the API instead. |

**Tier 1 covers:** every WHO-recorded multi-country event since 1997 + per-state US weekly counts updated within the last 3 days. That's enough for a credible launch under hantatracker.tech without ECDC/PAHO. ECDC and PAHO add EU and Americas-regional depth — important but not blocking; both will need PDF parsers (S5+ from the original plan) since neither offers a public JSON API.

The risk profile of skipping ECDC/PAHO at launch: the dashboard will under-represent Eurasian HFRS endemic countries (Finland, Russia, Korea) and Latin American HPS countries outside the US. Acceptable for a v0.2.1 launch as long as `/methodology` is honest about it.

## Source-by-source detail

### 1. WHO Disease Outbreak News (DON) API ✅

| | |
|---|---|
| Endpoint | `https://www.who.int/api/news/diseaseoutbreaknews` |
| Method | GET (OData v4) |
| Auth | none |
| CORS | `Access-Control-Allow-Origin: *` (server-side fetch fine, client-side also works) |
| Cache | upstream `s-maxage=900` (15 min) |
| Last-modified | live (current outbreak, e.g. DON600 published 2026-05-08) |
| Rate limits | none observed; honour the upstream cache |
| Rec | **Use as primary global source.** |

**Schema (selected fields):**

```json
{
  "Id": "f6d5a10e-d6a4-4156-a203-4845ea2f878a",
  "DonId": "2026-DON600",
  "PublicationDate": "2026-05-08T21:31:10Z",
  "LastModified": "2026-05-10T10:26:21Z",
  "Title": "Hantavirus cluster linked to cruise ship travel, Multi-country",
  "UrlName": "2026-DON600",
  "ItemDefaultUrl": "/2026-DON600",
  "Overview": "<p>...</p>",
  "Epidemiology": null,
  "Assessment": "...",
  "Advice": "...",
  "Response": "...",
  "FurtherInformation": "...",
  "Provider": "dynamicProvider372"
}
```

**Hantavirus history (titles only, count = 8):**

| Date | DON | Title |
|---|---|---|
| 2026-05-08 | DON600 | Hantavirus cluster linked to cruise ship travel, Multi-country |
| 2026-05-04 | DON599 | Hantavirus cluster linked to cruise ship travel, Multi-country |
| 2019-01-23 | DON997 | Hantavirus Disease – Argentina |
| 2019-01-04 | DON112 | Hantavirus disease – Panama |
| 2012-09-12 | — | Hantavirus pulmonary syndrome – Yosemite National Park, USA – update |
| 2012-09-04 | — | Hantavirus pulmonary syndrome – Yosemite National Park, USA |
| 2000 | — | 2000 - Hantavirus Pulmonary Syndrome in Panama |
| 1997 | — | 1997 - Hantavirus Pulmonary Syndrome in the Americas |

**Sample query — current outbreak only:**

```
https://www.who.int/api/news/diseaseoutbreaknews
  ?$filter=contains(Title,'Hantavirus') or contains(Title,'hantavirus') or contains(Title,'Andes')
  &$select=Id,PublicationDate,Title,DonId,UrlName,Overview,Assessment
  &$orderby=PublicationDate desc
  &$top=20
```

**Caveat:** the `Overview` field contains HTML — needs sanitising / stripping before display. Country names appear in narrative text, not as structured fields, so country-level case counts for cross-country events have to be parsed from the prose. For a launch, treat WHO DON as a **timeline of events** plus **affected-country list**, not as per-country counts. Numerical counts come from CDC NNDSS (US) and, in the future, ECDC AER (EU) + PAHO bulletins (Americas).

### 2. CDC NNDSS Weekly Data — Socrata `x9gk-5huc` ✅

| | |
|---|---|
| Endpoint | `https://data.cdc.gov/resource/x9gk-5huc.json` |
| Method | GET (Socrata SODA 2.1) |
| Auth | none required at our query rate (5,000 req/h anonymous; 100,000/h with free `X-App-Token`) |
| CORS | yes |
| Last-updated | 2026-05-07 (3 days old as of this discovery) |
| Cadence | Updated weekly, usually mid-week |
| Rec | **Use as primary US source.** |

**Two relevant labels** (confirmed via `$select=label&$group=label`):

- `Hantavirus infection, non-hantavirus pulmonary syndrome`
- `Hantavirus pulmonary syndrome`

**Recent US-rollup totals (`states='U.S. Residents'`, year=2026):**

| Week | Label | m2 (cum YTD) | m3 (current week) | m4 (52-wk max) |
|---|---|---|---|---|
| 17 | Hantavirus pulmonary syndrome | 4.0 | 2.0 | 17.0 |
| 17 | non-HPS infection | 1.0 | 1.0 | 1.0 |
| 16 | HPS | 3.0 | 2.0 | 16.0 |
| 15 | HPS | 3.0 | 2.0 | 15.0 |
| 14 | HPS | 3.0 | 2.0 | 13.0 |

**State-level rows** include `geocode.coordinates` (lon, lat) for direct globe placement.

**Sample query — week-17 state breakdown:**

```
https://data.cdc.gov/resource/x9gk-5huc.json
  ?$where=year='2026' AND week='17' AND label='Hantavirus pulmonary syndrome'
  &$select=states,m2,m3,location1,geocode
  &$limit=60
```

**Field meaning** (from dataset metadata):

- `m1` — current week reported (often blank if "not nationally notifiable")
- `m2` — **cumulative year-to-date** ← this is the headline number
- `m3` — current week count
- `m4` — previous-52-week historical maximum (useful for anomaly baseline)
- `*_flag` — `N` = not reportable, `NN` = not nationally notifiable, `-` = no cases, `NC` = not calculated

**Pitfall:** Connecticut and a few other states return `m1_flag: "N"` (not reportable in jurisdiction). Treat null `m2` differently from `0` — `null` means we don't know, `0` means actively zero. Schema: `m2` is a string in the JSON ("0.0", "4.0"), parse to number.

**Pitfall:** `m4` is the 52-week historical max for that state, not 2026 max. Don't confuse it with "expected baseline" without further computation.

### 3. ECDC — Annual Epidemiological Report ⚠️ defer

| | |
|---|---|
| Public JSON API | none for hantavirus |
| Surveillance Atlas | `https://atlas.ecdc.europa.eu/public/index.aspx` returns HTML (200) but data downloads require interactive session |
| `opendata.ecdc.europa.eu` | redirects to a single COVID-only CSV; not a general data portal |
| AER 2022 page | `https://www.ecdc.europa.eu/en/publications-data/hantavirus-annual-epidemiological-report-2022` — exists; rate-limits to 429 quickly |
| TESSy (The European Surveillance System) | restricted, requires registration + login |
| Cadence | annual reports, multi-month lag |
| Rec | **Skip for v0.2.1.** Park PDF-parser work to v0.4+ alongside Argentina BEN parser. |

The ECDC Atlas hantavirus dashboard (Dataset=27, HealthTopic=15) renders interactively but the underlying CSV is gated. Re-evaluate when we own a PDF-parser pipeline (was Argentina BEN in original S5).

### 4. PAHO — Hantavirus topic + PLISA ❌ skip for now

| | |
|---|---|
| Topic page | `https://www.paho.org/en/topics/hantavirus` — Drupal 10 HTML, no structured data |
| PLISA viz | `https://www3.paho.org/data/...` returns 502 Bad Gateway during this probe — uptime concerns |
| `ais.paho.org/phip/viz/` | 403 Forbidden |
| `opendata.paho.org/en` | redirect chain that ends at portal HTML, no hantavirus dataset linked |
| `iris.paho.org` | 403 Forbidden |
| Cadence | weekly bulletins (PDF) |
| Rec | **Skip for v0.2.1.** PAHO is the right source for the Andes virus outbreak case counts in Argentina/Chile, but extracting them automatically is a PDF-parser project (was Argentina BEN in original S5). |

For launch we acknowledge this gap explicitly on `/methodology` and rely on WHO DON narrative for Andes virus updates until the PDF parser is built.

### 5. WHO DON RSS feed ❌ dead

| | |
|---|---|
| URL probed | `https://www.who.int/feeds/entity/csr/don/en/rss.xml` |
| Result | HTTP 404 (returns WHO 404 HTML) |
| Rec | **Do not use.** The WHO DON API (above) replaces it. |

## Recommended aggregation strategy for S2.real.2

1. **WHO DON API** drives the global outbreak event timeline + the country-list overlay on the globe (which countries are involved in any active DON, with a link to the source DON page).
2. **CDC NNDSS** drives US per-state case counts on the globe / mortality grid + the headline US YTD total in the Overview KPIs.
3. The Overview "Total Cases" KPI becomes "WHO DON events: N" + "US YTD: X (CDC)", **not a synthesised global number**, because we don't have ECDC + PAHO yet. Honesty over compositing — a single "global total" without ECDC/PAHO would silently understate Eurasia and Americas.
4. `/methodology` lists the two live sources (WHO DON, CDC NNDSS) and explicitly names the gaps (ECDC and PAHO not yet integrated). Sections that don't have real data — cases per 100k, demographics, 30-day timeline — keep DEMO badges as planned.

## Schema for the aggregator (proposed)

```ts
type DataPoint = {
  source_name: 'WHO DON' | 'CDC NNDSS';
  source_url: string;          // direct link to the DON page or NNDSS dataset row
  source_id: string;           // DonId or NNDSS row sort_order
  fetched_at: string;          // ISO timestamp
  data_as_of: string;          // ISO timestamp from upstream
  scope: 'global-event' | 'country-rollup' | 'us-state';
  country?: string;            // country name (US event applies to all listed)
  iso_code?: string;            // ISO-3166 alpha-2
  state?: string;               // US state name (only when scope='us-state')
  cases?: number | null;        // m2 cumulative YTD for NNDSS; null for WHO DON
  deaths?: number | null;       // null for both sources at this stage
  confidence: 'confirmed' | 'reported' | 'preliminary';
  notes?: string;
  raw?: unknown;                // original record for audit
};
```

WHO DON country lists need a small NLP step: titles like "Hantavirus cluster linked to cruise ship travel, Multi-country" don't enumerate countries; the affected list lives in `Response` / `Overview` HTML. For v0.2.1 we treat the DON itself as the data point and tag the listed countries as `confidence: 'reported'`. Per-country numerical case counts are deferred until we have a structured source (PAHO PDF parser, ECDC TESSy, etc.).

## Known unknowns / risks

- **WHO API stability:** sf-cache-status was HIT on every probe; we don't know what happens when WHO updates the schema. Mitigation: validate every fetch with Zod, log failures, fall back to last known data per S2.real.5 (no silent mock fallback).
- **CDC NNDSS week-17 m2 = 4 HPS** sounds low compared to typical US ~30/year. The 17 weeks is one-third of the year, so 4 cumulative is in plausible range; need to verify against historical baselines once we layer the statistical module (S3.stat anomaly detection).
- **ECDC + PAHO gaps:** the dashboard at launch will visually reflect "we know about the US in detail and global events broadly, but we don't have EU surveillance numbers and we don't have South-American per-country counts." That has to be stated on `/methodology` so readers don't assume Europe is unaffected.
- **WHO DON rate of update:** WHO publishes a DON only when there's a notable event. In quiet weeks, no new content. The dashboard's "globe of active outbreaks" should reflect both WHO DONs (within the last X months) AND CDC NNDSS (current year), not just the most recent DON.
