# HantaTracker Audit Report — 2026-05-10

## Executive Summary

HantaTracker v0.1.0 prezentuje wizualnie spójny dashboard, ale **rdzeń produktu — dane epidemiologiczne — jest w 100% hardcoded mock'iem statycznie wpisanym w jeden plik** ([server/data/mockGlobe.js:1-17](server/data/mockGlobe.js#L1-L17)). Realnie integrujemy się tylko z dwoma źródłami: Alpha Vantage (stocks, REAL) i NewsAPI.org (news, REAL z lokalnym keyword‑sentymentem). **Werdykt: 🔴 Nie sprzedawać B2B w obecnym stanie.**

**Krytyczne flagi:**

- **Mock prezentowany jako real.** `totals.mortalityRate = 12.82%` ([server/services/globeService.js:22](server/services/globeService.js#L22)) — klinicznie nieprawdopodobne dla hantawirusa (HFRS ~1‑15% wg subtypu, HCPS 30‑50%). Liczba jest matematycznie poprawnym ilorazem 2295/17895, ale obie sumy pochodzą z fikcyjnych intów.
- **Bug w demographics.** `buildDemographics(country)` ignoruje parametr i zwraca tę samą strukturę dla każdego kraju ([server/data/mockGlobe.js:36-54](server/data/mockGlobe.js#L36-L54)) — Polska, Argentyna, USA mają identyczne 62%/38% M/F i identyczny rozkład wieku. Klient farmaceutyczny rozpozna to w jednym przeglądzie.
- **Timeline generowane losowo przy każdym fetch.** `Math.random()` w [server/data/mockGlobe.js:27](server/data/mockGlobe.js#L27) — historia 30 dni nie jest stała, zmienia się między requestami.
- **Brak DB, brak CI, brak testów, brak deployu.** `package.json` ma `"test": "node --test"` ale nie ma żadnych plików testowych. Nie ma Dockerfile, railway.toml, vercel.json. Nic nie jest deployowane.
- **Brak Telegram bota, brak report‑generatora.** Grep dla `telegram|HantaVrius|webhook` zwraca 0 wyników. Nie ma `report-generator/` ani `.zip`.
- **Repo gitowe nie jest dedykowane projektowi.** `git rev-parse --show-toplevel` w `HantaVirus_App` zwraca `C:/Users/bibac` — cały katalog domowy użytkownika jest jednym repo, a HantaTracker nie ma własnego. Dwa istniejące commity (`75aa3a1`, `8391bf9`) pochodzą z innego projektu (Football Intelligence). **Żaden plik HantaTracker nie jest scommitowany do gita.** `.env` jest jednak poprawnie ignorowany przez [`.gitignore:4`](.gitignore#L4) — secrets nie wyciekły.
- **„alltoc.com" nie istnieje w naszym kodzie** (grep zwraca 0). To prawdopodobnie nazwa źródła w wyniku z NewsAPI.org — nie nasza integracja.

Rekomendacja: minimum **3‑4 tygodnie pełnoetatowej pracy** żeby wymienić mock pipeline na realny, dodać uwierzytelnianie/billing i mieć cokolwiek do sprzedania klientowi z branży YMYL bez ryzyka chargebacku i odpowiedzialności reputacyjnej/prawnej.

---

## Phase 1: Data Sources Audit

### A. Źródła danych epidemiologicznych

**1. Pochodzenie liczb 17895 / 2295 / 12.82%**

Hardcoded w [server/data/mockGlobe.js:1-17](server/data/mockGlobe.js#L1-L17). Suma `cases` z 15 obiektów = 17895; suma `deaths` = 2295; iloraz wyliczony w [server/services/globeService.js:22](server/services/globeService.js#L22):

```js
// server/data/mockGlobe.js:1-17  (skrót)
export const MOCK_COUNTRIES = [
  { name: 'United States', code: 'US', cases: 850, deaths: 312, ... },
  { name: 'Argentina',     code: 'AR', cases: 2340, deaths: 410, ... },
  ...
  { name: 'Paraguay',      code: 'PY', cases: 210, deaths: 42, ... },
];

// server/services/globeService.js:11-22
const countries = MOCK_COUNTRIES.map((c) => ({ ...c, lastUpdate: new Date().toISOString() }));
const totals = countries.reduce((acc, c) => {
  acc.cases += c.cases; acc.deaths += c.deaths; ...
}, { cases: 0, deaths: 0, ... });
totals.mortalityRate = totals.cases ? Number(((totals.deaths / totals.cases) * 100).toFixed(2)) : 0;
// 2295 / 17895 = 0.12824... → 12.82
```

**2. Klasyfikacja: (a) hardcoded mock/seed.** Nie API, nie cache czegoś innego, nie losowane. Tablica intów wpisanych ręcznie. Payload nawet sygnalizuje to wprost w [server/services/globeService.js:25](server/services/globeService.js#L25): `source: 'mock'` — pole obecne w API response, ale UI go nie wyświetla.

**3. API epidemiologiczne — żadnego.** Brak integracji z WHO, CDC, ECDC, PAHO, Argentina BEN, Chile MINSAL, Finland THL ani jakimkolwiek surveillance feedem. Brak zmiennej środowiskowej dla danych medycznych. Klucze w `.env` ([server/.env](server/.env), gitignored): wyłącznie `ALPHA_VANTAGE_KEY`, `NEWSAPI_ORG_KEY`, `NEWSAPI_AI_KEY` (nieużywany). `.env` jest w [`.gitignore:4`](.gitignore#L4) ✓.

**4. Per‑country (Brazil 670/1620, Chile 380/1180, Poland 3/145, Panama 65/380).** Wszystkie cztery są hardcoded intami w [server/data/mockGlobe.js:5,4,12,14](server/data/mockGlobe.js#L4):

```js
{ name: 'Chile',    code: 'CL', cases: 1180, deaths: 380, ... },  // CFR 32.2%
{ name: 'Brazil',   code: 'BR', cases: 1620, deaths: 670, ... },  // CFR 41.4%
{ name: 'Poland',   code: 'PL', cases: 145,  deaths: 3,   ... },  // CFR 2.1%
{ name: 'Panama',   code: 'PA', cases: 380,  deaths: 65,  ... },  // CFR 17.1%
```

CFR (case fatality rate) jest niespójny między krajami nawet w obrębie samego mocka — sugeruje że liczby były wpisywane z wyczucia, nie wg modelu epidemiologicznego.

**5. Wszystkie wystąpienia mock/seed/fixture/dummy/sample/fake** (grep `-i`, ignoruję `node_modules/`):

| Plik | Linia | Treść |
|---|---|---|
| [server/data/mockGlobe.js](server/data/mockGlobe.js) | 1 | `export const MOCK_COUNTRIES = [` |
| [server/services/globeService.js](server/services/globeService.js) | 2 | `import { MOCK_COUNTRIES, ... } from '../data/mockGlobe.js';` |
| [server/services/globeService.js](server/services/globeService.js) | 11 | `const countries = MOCK_COUNTRIES.map(...)` |
| [server/services/globeService.js](server/services/globeService.js) | 25 | `const payload = { ..., source: 'mock' };` |
| [server/services/globeService.js](server/services/globeService.js) | 32 | `const country = MOCK_COUNTRIES.find(...)` |
| [README.md](README.md) | 32-33 | Tabela endpointów otwarcie podpisuje `/api/globe` jako "Mock (15 countries)" |

Brak `seed/fixture/dummy/sample/fake` jako oddzielnych identyfikatorów. Wszystko skonsolidowane pod `MOCK_*`.

**6. Wszystkie wywołania HTTP w kodzie** (grep `axios|fetch`, ignoruję node_modules):

| Plik:linia | Endpoint | Cel | Real/Mock |
|---|---|---|---|
| [server/services/stockService.js:1,25-28](server/services/stockService.js#L25) | `https://www.alphavantage.co/query` (`GLOBAL_QUOTE`) | Ceny biotech tickerów | **REAL** |
| [server/services/newsService.js:1,31-40](server/services/newsService.js#L31) | `https://newsapi.org/v2/everything` | Wiadomości o hantawirusie | **REAL** |
| [client/src/api.js:1,5-32](client/src/api.js#L5) | `http://localhost:3001/api/*` | Frontend → backend (axios.create + fetchGlobe/fetchStocks/fetchNews/fetchCountry/fetchHealth) | wewn. |

**Brak jakichkolwiek wywołań HTTP do źródeł epidemiologicznych.** WHO, CDC, ECDC, PAHO — żadnego.

---

### B. News API

**1. Realne źródło news cards.** [server/services/newsService.js:6,31-40](server/services/newsService.js#L6) — endpoint `https://newsapi.org/v2/everything`, query: `'hantavirus OR "hemorrhagic fever" OR "viral outbreak"'` (linia 28). REAL, klucz `NEWSAPI_ORG_KEY` z `.env`.

**2. „alltoc.com".** Nie ma w naszym kodzie ani w jakimkolwiek pliku w repo (grep 0 wyników). Najpewniej była to nazwa źródła zwróconego przez NewsAPI.org w pojedynczym artykule. NewsAPI agreguje setki publisherów; nasz kod tylko maps `a.source?.name` ([newsService.js:46](server/services/newsService.js#L46)) i wyświetla w UI ([SentimentPanel.jsx](client/src/components/panels/SentimentPanel.jsx)). Nie filtrujemy źródeł, więc spam‑farm domeny mogą się tam pojawić.

**3. Inne źródła newsów.** Brak GDELT, MediaStack, Webz.io ani RSS WHO/CDC/ECDC. `NEWSAPI_AI_KEY` jest w `.env` ale nigdy nie używany w kodzie (grep `NEWSAPI_AI_KEY` zwraca tylko `.env` i `.env.example`).

**4. Sentiment scoring.** Lokalna heurystyka keyword‑matching — [server/services/newsService.js:8-17](server/services/newsService.js#L8-L17):

```js
const POSITIVE_WORDS = ['vaccine', 'cure', 'breakthrough', 'recovery', ...];
const NEGATIVE_WORDS = ['outbreak', 'death', 'fatal', 'spread', ...];
function scoreSentiment(text) {
  const pos = POSITIVE_WORDS.reduce(..., (text.includes(w) ? 1 : 0), 0);
  const neg = NEGATIVE_WORDS.reduce(..., (text.includes(w) ? 1 : 0), 0);
  return pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';
}
```

To **nie jest** OpenAI / Anthropic / VADER / dedykowany serwis. To match listy 10+10 słów. Każdy artykuł zawierający słowo „outbreak" zostanie oznaczony negatywnie, nawet jeśli mówi „outbreak controlled and resolved". Dla B2B sentiment intelligence — nieadekwatne.

---

### C. Stocks API

**1. Real Alpha Vantage.** Tak. [server/services/stockService.js:6,22-28](server/services/stockService.js#L22):

```js
const ALPHA_BASE = 'https://www.alphavantage.co/query';
async function fetchQuote(ticker) {
  const key = process.env.ALPHA_VANTAGE_KEY;
  if (!key) throw new Error('ALPHA_VANTAGE_KEY missing');
  const { data } = await axios.get(ALPHA_BASE, {
    params: { function: 'GLOBAL_QUOTE', symbol: ticker, apikey: key },
    timeout: 10000,
  });
  ...
}
```

Klucz `ALPHA_VANTAGE_KEY` jest w [server/.env](server/.env) (gitignored). Cache TTL 14400s = 4h ([stockService.js:4](server/services/stockService.js#L4)). Sequential fetch z 1.5s delay między tickerami ([stockService.js:7,69](server/services/stockService.js#L7)) — fix po wcześniejszym uderzeniu w 1 req/sec rate limit.

**2. Lista tickerów.** Hardcoded fallback w [server/services/stockService.js:58](server/services/stockService.js#L58): `'MRNA,INO,GRFS,REGN,XBI'`. W aktualnym `.env` jest `STOCK_TICKERS=MRNA,INO,GRFS,REGN` (4, nie 5 — XBI pominięte żeby zmieścić się w Alpha Vantage daily cap 25 req/day przy refresh co 4h × 4 tickery = 24/24h). Override przez query param `?tickers=...` jest też wspierany ([stockService.js:56-58](server/services/stockService.js#L56)).

**3. Czy ceny są real.** Tak — zweryfikowane wcześniej w transkrypcji (MRNA $54.35 z `lastUpdate: "2026-05-08"`). Pozostałe 3 tickery podczas pierwszego fetch zwróciły rate‑limit error ("Thank you for using Alpha Vantage! Please consider spreading out your free API requests..."), ale po fix sequential delay (już wgrany do kodu) kolejne odświeżenia powinny zwracać wszystkie 4. **Cena 1 tickera (MRNA) jest zweryfikowana real.** Ceny `$1.46 / $8.10 / $714.89` które pojawiły się w UI po refresh — **needs live test**, nie mam cachowanego potwierdzenia, czy to real Alpha Vantage czy może wcześniejsze błędne wartości z null‑error response. Aby zweryfikować: `curl http://localhost:3001/api/stocks` po dłuższym uptime.

**Caveat: Alpha Vantage GLOBAL_QUOTE nie jest „real time"** — to ostatni close + zmiana dzienna. Dla B2B to byłoby do zaakceptowania w tier basic, ale klient enterprise/trader będzie oczekiwał intraday lub realtime feed (Polygon, IEX Cloud, Refinitiv).

---

### D. Telegram Bot

**1. Brak integracji.** Grep `telegram|HantaVrius|webhook|TELEGRAM` w całym repo (z wyłączeniem `node_modules/`) zwraca **0 wyników**. Nie ma:

- Biblioteki telegram bot w `package.json` (ani w server, ani w client)
- Tokenu `TELEGRAM_BOT_TOKEN` lub podobnego env var
- Pliku z handlerami komend
- Webhook endpointu w Express ([server/index.js](server/index.js) ma tylko `/api/globe`, `/api/stocks`, `/api/news`, `/api/health`)

**2. Storage subskrybentów.** Brak. Nie ma SQLite, Postgres, JSON file ani niczego do persystencji.

**3. `@HantaVrius_bot`.** Jeśli istnieje na Telegramie — istnieje poza tym repo. Kod nie wie nic o nim.

---

### E. Stack & Infrastruktura

**1. `package.json` (server, client).**

[server/package.json:1-29](server/package.json#L1-L29):
```json
{
  "name": "hantatracker-server", "version": "0.1.0", "type": "module",
  "scripts": { "dev": "nodemon index.js", "start": "node index.js", "test": "node --test" },
  "engines": { "node": ">=18" },
  "dependencies": {
    "axios": "^1.7.7", "cors": "^2.8.5", "dotenv": "^16.4.5",
    "express": "^4.21.1", "helmet": "^8.0.0", "morgan": "^1.10.0",
    "node-cache": "^5.1.2", "node-schedule": "^2.1.1", "zod": "^3.23.8"
  },
  "devDependencies": { "nodemon": "^3.1.7" }
}
```

[client/package.json:1-34](client/package.json#L1-L34) (z `world-atlas` + `topojson-client` dodane w trakcie):
```json
{
  "name": "hantatracker-client", "private": true, "version": "0.1.0", "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": {
    "@react-three/drei": "^9.114.0", "@react-three/fiber": "^8.17.10",
    "@tanstack/react-query": "^5.59.16", "axios": "^1.7.7",
    "framer-motion": "^11.11.9", "lucide-react": "^0.453.0",
    "react": "^18.3.1", "react-dom": "^18.3.1",
    "recharts": "^2.13.0", "three": "^0.169.0",
    "topojson-client": "^3.1.0", "world-atlas": "^2.0.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.11", "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.2", "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47", "tailwindcss": "^3.4.13", "vite": "^5.4.9"
  }
}
```

**2. Tree (3 poziomy, bez node_modules / .git).**

```
HantaVirus_App/
├── .gitignore
├── README.md
├── AUDIT_REPORT.md  (this file)
├── server/
│   ├── .env                         (gitignored)
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── index.js
│   ├── data/
│   │   └── mockGlobe.js
│   ├── lib/
│   │   ├── cache.js
│   │   └── scheduler.js
│   ├── routes/
│   │   ├── globe.js
│   │   ├── health.js
│   │   ├── news.js
│   │   └── stocks.js
│   └── services/
│       ├── globeService.js
│       ├── newsService.js
│       └── stockService.js
└── client/
    ├── .env
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    ├── public/
    │   └── favicon.svg
    └── src/
        ├── App.jsx
        ├── api.js
        ├── index.css
        ├── main.jsx
        ├── components/
        │   ├── AnalyticsTabs.jsx
        │   ├── Globe.jsx
        │   ├── Header.jsx
        │   ├── OverviewMetrics.jsx
        │   └── panels/
        │       ├── DemographicsPanel.jsx
        │       ├── EpidemiologyPanel.jsx
        │       ├── SentimentPanel.jsx
        │       └── StocksPanel.jsx
        └── utils/
            └── format.js
```

**3. Framework.** Backend: **Express.js (ESM, Node 18+)**, brak Next.js. Frontend: **React 18 + Vite (SPA)**, nie Next, nie Astro. Nie ma App Router/Pages — to czysty Vite SPA.

**4. Hosting.** Brak deployu. Brak Dockerfile, brak `railway.toml`, brak `vercel.json`, brak `.github/workflows/`. Plan w README mówił Vercel (FE) + Railway (BE), ale nic nie jest skonfigurowane.

**5. Database.** Brak. Nie ma `prisma/`, `migrations/`, `db.js`, klienta SQLite/PG/Mongo. Cały state jest w pamięci procesu (`node-cache`, [server/lib/cache.js](server/lib/cache.js)) — restart serwera = utrata cache, zero historii, zero subscribers.

**6. CI/CD, testy, error tracking.** 
- **CI/CD**: brak (`.github/workflows/` nie istnieje, grep dla `gitlab-ci|circle|travis` = 0).
- **Testy**: skrypt `"test": "node --test"` w server/package.json, ale **0 plików testowych** w repo (Glob `**/*.test.js` = 0).
- **Sentry / error tracking**: brak (grep `sentry|@sentry|errorTracking` = 0). Errors logowane wyłącznie do `console.error` w [server/index.js:40](server/index.js#L40).

---

### F. Mapowanie sekcji UI → realność danych

| Sekcja UI | Real / Mock / Mixed | Źródło danych | Komentarz |
|---|---|---|---|
| **Header** (Cases / Deaths / New 24h, Updated X ago) | **Mock** | `globeQ.data?.totals` ← [server/services/globeService.js:12-22](server/services/globeService.js#L12) ← [mockGlobe.js:2-16](server/data/mockGlobe.js#L2) | `generatedAt` to `new Date().toISOString()` — pokazuje czas wygenerowania mocka, nie czas obserwacji. Wprowadza w błąd. |
| **Overview cards** — Total Cases | **Mock** | `totals.cases` (= 17895) | Suma 15 hardcoded intów. |
| Overview — Total Deaths | **Mock** | `totals.deaths` (= 2295) | jw. |
| Overview — Most Affected | **Mock** | `[...].sort(b.cases - a.cases)[0]` ([globeService.js:23](server/services/globeService.js#L23)) → "Russia" | Russia wybrana bo ma cases: 4220 wpisane ręcznie. |
| Overview — Biotech Trend (avg %) | **REAL** | Alpha Vantage GLOBAL_QUOTE × N ([stockService.js:25-28](server/services/stockService.js#L25)) | Avg z `changePercent` żywych tickerów. |
| Overview — News Sentiment | **Mixed** | NewsAPI.org REAL → keyword‑heuristic local | Artykuły real, ale klasyfikacja sentymentu jest słownikiem 10+10 słów ([newsService.js:8-9](server/services/newsService.js#L8)). |
| Overview — Tracked Markets (count) | **REAL** | `stocks.stocks.length` | Liczba zwróconych z Alpha Vantage. |
| **Live Spread Map** — sphere + graticule | **n/a (geom.)** | Three.js + world-atlas/land-110m | Tylko geometria. |
| Live Spread Map — outbreak markers (kropki + cząsteczki) | **Mock** | `countries[].lat/lng/spreadRate/controlIndex` ← [mockGlobe.js:2-16](server/data/mockGlobe.js#L2) | Pozycje, kolor i animacja particles wyliczane z mock'owych `spreadRate`/`controlIndex`. |
| **Top 10 by Total Cases** | **Mock** | `countries.sort(b.cases - a.cases).slice(0,10)` ([EpidemiologyPanel.jsx:12](client/src/components/panels/EpidemiologyPanel.jsx#L12)) | Sort z mocka, kolory barów wyliczane z mock `trend7day`. |
| **Top 10 by Cases per 100k** | **Mock** | `countries.sort(b.casesPer100k - a.casesPer100k).slice(0,10)` ([EpidemiologyPanel.jsx:13](client/src/components/panels/EpidemiologyPanel.jsx#L13)) | jw. Finland 23.10/100k (najwyższy w mocku) jest dokładnie wpisany ręcznie w [mockGlobe.js:10](server/data/mockGlobe.js#L10). |
| **Mortality Rate by Country** | **Mock** | `(c.deaths / c.cases) * 100` ([EpidemiologyPanel.jsx:71-72](client/src/components/panels/EpidemiologyPanel.jsx)) | Brazil 41.4%, Chile 32.2%, Polska 2.1% — niespójność CFR między krajami w obrębie samego mocka. |
| **Demographics — Age Groups** | **Mock + BUG** | [`buildDemographics`](server/data/mockGlobe.js#L36) zwraca **identyczny** obiekt dla każdego kraju | Polska, Argentyna, USA: 8/22/41/24/5 % age split — wszystkie kraje. Funkcja nie używa parametru `country`. |
| Demographics — Gender Split | **Mock + BUG** | jw. | Wszystkie kraje: 62% M / 38% F. |
| Demographics — Occupation Risk | **Mock + BUG** | jw. | Wszystkie kraje: agriculture 38%, construction 14%, military 9%, ... |
| Demographics — 30‑Day Timeline | **Mock + Random** | `buildTimeline` używa `Math.random()` ([mockGlobe.js:27](server/data/mockGlobe.js#L27)) | Każdy fetch zwraca inną historię. Niedeterministycznie. |
| **Stocks tab** | **REAL** | Alpha Vantage GLOBAL_QUOTE | Cache 4h. Single point of failure: brak fallback'u na inny provider. |
| **News & Sentiment tab** | **Mixed** | NewsAPI.org real → local keyword sentiment | Real publikacje, niedoskonała klasyfikacja, brak filtrowania jakości źródeł (spam farms mogą trafić do feeda). |
| **Global Summary** (footer/EpidemiologyPanel) | **Mock** | `totals` (wyżej) | Suma mocka. |

**Podsumowanie tabeli:**
- **Mock**: 12 sekcji
- **REAL**: 3 sekcje (Stocks tab, Biotech Trend, Tracked Markets count)
- **Mixed**: 2 sekcje (News tab, News Sentiment KPI)
- **Mock + BUG**: 3 sekcje (Demographics — wszystkie kraje identyczne)
- **Mock + Random**: 1 sekcja (Demographics timeline)

---

### G. Report generator

Glob dla `report-generator*` i `*.zip` w roocie zwraca **0 wyników**. Plik `report-generator.zip` nie został wypakowany / nie został dodany do projektu. **Sekcja pominięta zgodnie z instrukcją.**

---

## Phase 2: Honest Assessment

### 1. Procent danych realnych vs demo w obecnym UI

**~15% real, ~85% demo.**

Ważone wagą biznesową w produkcie B2B sprzedającym „global hantavirus intelligence":

- **Real (15%)**: ceny biotech (1 KPI + 1 zakładka), feed wiadomości NewsAPI (1 zakładka), licznik tickerów (1 KPI).
- **Demo (85%)**: cała epidemiologia — globalne sumy, per‑country cases/deaths, mortality rates, cases per 100k, top 10 charts, mortality grid, demographics (age/gender/occupation), 30‑day timeline, outbreak markers na globusie, particle spread animation, Most Affected, generatedAt timestamp, lastUpdate per country.

Epidemiologia jest **rdzeniem produktu**. Brak realnych danych epidemiologicznych = brak produktu, niezależnie od tego jak ładnie wygląda UI i jak realne są ceny biotechu.

### 2. Co trzeba dorobić, żeby było 100% real

| Komponent | Estimat (h) | Trudność (1-5) | Komentarz |
|---|---|---|---|
| WHO Disease Outbreak News (RSS + structured parser) | 8-12 | 3 | RSS jest, ale ustrukturyzowane case counts wymagają NLP / regex na HTML/PDF treści. |
| CDC Open Data via Socrata API (data.cdc.gov) | 6-10 | 2 | Dataset HFRS dla USA, free key. |
| ECDC Surveillance Atlas | 6-12 | 3 | Sprawdzić czy mają public API; jeśli nie — scraper raportów PDF (TESSy). **Needs live verification, ask user.** |
| PAHO PLISA (Americas) | 8-14 | 3-4 | Krytyczne dla Andes virus. API może wymagać auth i ma niedostępne fragmenty. |
| Argentina BEN (Boletín Epidemiológico Nacional) — PDF parsing | 16-24 | 5 | Najtrudniejsze, ale highest value w 2026 (aktywny outbreak). PDF każdy tydzień, niespójny layout. |
| Chile MINSAL + Brazil SIVEP | 12-18 | 4 | Każdy kraj ma własny portal, formaty CSV/PDF, regionalna struktura. |
| Finland THL (HFRS Puumala) | 6-10 | 3 | API publiczne. |
| News: GDELT + RSS WHO/CDC/ECDC + filtrowanie spam‑farm | 10-16 | 3 | Aktualnie tylko NewsAPI bez whitelisty źródeł. |
| Sentiment scoring upgrade (LLM lub VADER + finetune) | 8-14 | 3 | Aktualnie 10+10 keyword match, niewystarczające dla B2B. |
| Demographics — fix bugu i podpięcie realnych źródeł (per-kraj registry data) | 16-30 | 4 | Najpierw fix funkcji żeby nie zwracała tej samej struktury, potem gdzie wziąć dane (US: CDC, AR: ANLIS, FI: THL). |
| Stock data fallback (Polygon/IEX) na wypadek Alpha Vantage outage | 4-8 | 2 | Aktualnie SPOF. |
| Database (Postgres lub SQLite) + schema + migracje | 12-20 | 3 | Niezbędne do trzymania historii, audytu, billingu, subskrybentów. |
| Pipeline orchestrator (replace `node-schedule` na BullMQ + Redis) | 8-14 | 3 | Skala ponad 1 worker. |
| Walidacja danych (Zod schemas już wciągnięty ale nieużywany) | 6-10 | 2 | `zod` jest w deps, brak schematów. |
| Data freshness/staleness flags w API response | 4-6 | 2 | Klient B2B musi widzieć kiedy ostatnio każdy kraj był odświeżony. |

**Suma Phase 1 (Demo → Real):** ~130-218 godzin = **3-5 tygodni full‑time** dla 1 dewelopera. **3 tygodnie minimum**, bardziej realnie 4-5.

### 3. Werdykt B2B

**🔴 NIE. Dane są w przeważającej części demo. Trzeba 3-5 tygodni pracy nad pipelinem zanim cokolwiek monetyzujemy.**

Sprzedaż obecnego stanu jako „real‑time global hantavirus intelligence" w cenniku $499-5000/mies do branży farmaceutycznej / ubezpieczeniowej / biotech to:

1. **Nieuczciwość komercyjna** — produkt nie dostarcza obiecanej wartości.
2. **Ryzyko prawne YMYL** — dane medyczne sprzedawane jako podstawa decyzji w pharma/insurance podlegają w niektórych jurysdykcjach (US: pre‑market scrutiny FDA jeśli claim diagnostyczny; EU: AI Act + regulacje Health Data Spaces) wyższym standardom niż „best‑effort web scraping". Mock prezentowany jako real to klasyfikacja `false advertising`.
3. **Reputacyjny one‑shot** — branża pharma/biotech jest mała. Jeden zwrot z chargebackiem od kupca z due diligence + screen na LinkedIn = koniec sprzedaży w tym vertical na wiele lat.

Jest jednak ścieżka **🟡 częściowa** jeśli chcesz cokolwiek monetyzować przed dokończeniem pipeline:

- **Tier 0 (Free / Educational)**: cały dashboard z BANEREM „DEMO DATA — NOT FOR DECISIONS" na każdej sekcji epidemiologicznej, real news + stocks bez baneru. Buduje awareness, lead gen, brak płatności.
- **Tier 1 (Paid)**: wyłącznie news intelligence + biotech tracker, bez epi. Cena $99-199/mies. Wartość dostarczona = real, oczekiwania = real.
- **Tier 2/3 (Pharma/Enterprise)**: dopiero po dokończeniu Phase 1.

To moja **strong recommendation** zamiast czystego 🔴: nie blokuje cashflow, nie sprzedaje mocka jako real, daje czas na zbudowanie pipeline z istniejącego cashflow.

### 4. Top 3 ryzyka jeśli wystartujemy B2B z obecnymi danymi

**Ryzyko #1 — Klinicznie nieprawdopodobne liczby zostaną wykryte w pierwszym przeglądzie u klienta pharma.**
12.82% globalnej mortality dla hantawirusa nie pasuje do żadnego subtypu wirusa. HFRS (Eurazja, dominujący globalnie) ma CFR 1-15% zależnie od subtypu (Hantaan ~5-15%, Puumala <1%, Seoul ~1%). HCPS (Ameryki, Andes/Sin Nombre) ma CFR 30-50%. Średnia ważona globalnie powinna wyjść w okolicach 3-7%, nie 12.82%. CFR Brazil 41.4% / Chile 32.2% jest *przypadkowo* w pasie HCPS, ale Polska 2.1% i Russia 2.9% też powinny być spójne (HFRS w Eurazji), a u nas są niezgodne między sobą (Russia 124/4220 = 2.9% OK, Finland 19/1280 = 1.5% OK, ale potem nagle Bolivia 78/290 = 26.9% i Canada 78/220 = 35.5%). Każdy epidemiolog w pierwszych 5 minutach zorientuje się że dane są zmyślone. Konsekwencja: **chargeback + zwrot za miesiąc + screen na LinkedIn**.

**Ryzyko #2 — Demographics bug (wszystkie kraje identyczne) przy pierwszym side‑by‑side.**
Klient farmaceutyczny robiący strategy targeting kupi dane „demographic risk by country" konkretnie po to żeby zobaczyć różnice. W obecnej wersji [server/data/mockGlobe.js:36-54](server/data/mockGlobe.js#L36-L54) zwraca tę samą strukturę dla każdego `country` (parametr ignorowany). Kiedy klient otworzy obok siebie Argentyna i Polska — zobaczy dokładnie te same liczby. To nie jest „mock z wytrenowanym przybliżeniem", to **bug**. Konsekwencja: chargeback **+ utrata zaufania** (mock z błędem jest gorszy niż mock bez błędu).

**Ryzyko #3 — Brak DB → restart serwera = strata całej historii subscriberów + billing state.**
Jeśli wystartujemy Stripe Subscriptions na obecnej infrastrukturze (cały state w `node-cache`, [server/lib/cache.js](server/lib/cache.js)), restart procesu (deploy, OOM, crash) zeruje wszystko. Nie wiemy kto ma aktywny plan, kto ma jaką subskrypcję, ile requestów zużył. Webhooki Stripe odbierane bez idempotency table = double charge / zero charge sytuacje. To jest **operational disaster waiting to happen**. Konsekwencja: chargebacki, support tickets, emergency hotfixes w środku nocy w piątek po deploy'u.

---

## Phase 3: Proposed Roadmap

Każdy item: **estymat (h)** | **trudność (1-5)** | **priorytet (P0/P1/P2)** | **zależności**

### Branch 1: Demo → Real Data Pipeline

| # | Item | h | trudność | priorytet | zależności |
|---|---|---|---|---|---|
| 1.1 | Add Postgres (Railway/Supabase) + schema (`countries`, `cases`, `deaths`, `regions`, `subscribers`, `usage`) + Prisma/Drizzle | 14 | 3 | P0 | — |
| 1.2 | WHO Disease Outbreak News — RSS + parser na ustrukturyzowane case counts | 12 | 3 | P0 | 1.1 |
| 1.3 | CDC Open Data (Socrata `cdc.gov` HFRS dataset) | 8 | 2 | P0 | 1.1 |
| 1.4 | PAHO PLISA scraper / API integration (Americas, Andes virus) | 12 | 4 | P0 | 1.1 |
| 1.5 | Argentina BEN — PDF tygodniowy parsing (Tabula / pdfplumber) | 22 | 5 | P0 | 1.1, 1.4 |
| 1.6 | Chile MINSAL — CSV/PDF | 14 | 4 | P1 | 1.1 |
| 1.7 | Finland THL Puumala HFRS API | 8 | 3 | P1 | 1.1 |
| 1.8 | ECDC TESSy / Surveillance Atlas — sprawdź public API. **Needs live verification, ask user.** | 10 | 3 | P1 | 1.1 |
| 1.9 | Brazil SIVEP/SINAN | 16 | 4 | P2 | 1.1 |
| 1.10 | Russia Rospotrebnadzor | 14 | 4 | P2 | 1.1 |
| 1.11 | Replace mockGlobe.js — usunąć całkowicie | 4 | 1 | P0 | 1.2-1.10 |
| 1.12 | Fix `buildDemographics` bug + podpiąć real demographic registry data per‑country | 24 | 4 | P1 | 1.1 |
| 1.13 | News: dodać GDELT + RSS WHO/CDC/ECDC równolegle do NewsAPI; whitelist domen | 12 | 3 | P1 | — |
| 1.14 | Sentiment scoring v2: VADER lub Anthropic API z prompt'em | 10 | 3 | P1 | 1.13 |
| 1.15 | Stocks: dodać Polygon.io fallback gdy Alpha Vantage 429 | 6 | 2 | P2 | — |
| 1.16 | Data freshness flags w API response (`source`, `lastFetched`, `confidence`) | 6 | 2 | P0 | 1.1 |
| 1.17 | Walidacja Zod schemas dla każdego API response — fail loud | 8 | 2 | P0 | 1.1 |
| 1.18 | Replace `node-schedule` → BullMQ + Redis (obsługa retry, dead letter queue) | 12 | 3 | P1 | 1.1 |
| 1.19 | Sentry / error tracking | 4 | 1 | P1 | — |

**Branch 1 total: 216h = ~5.4 tygodni @ 6h/dzień = ~1.5 miesiąca solo dev.**

### Branch 2: B2B API Infrastructure

| # | Item | h | trudność | priorytet | zależności |
|---|---|---|---|---|---|
| 2.1 | API keys + auth — własne (Hono+Lucia) **lub** Unkey (gotowe SaaS) | 14 | 3 | P0 | 1.1 |
| 2.2 | Rate limiting (per‑key, per‑tier) — Upstash Redis lub Redis self‑host | 8 | 3 | P0 | 2.1 |
| 2.3 | Usage tracking + metering (event log per request) | 10 | 3 | P0 | 2.1, 1.1 |
| 2.4 | Tiers (Free/Pro/Enterprise) — definicja limitów, header X‑RateLimit‑* | 6 | 2 | P0 | 2.2 |
| 2.5 | Stripe Subscriptions + webhook + idempotency table | 14 | 4 | P0 | 2.1, 1.1 |
| 2.6 | Customer portal (manage sub, invoices, API keys) | 16 | 3 | P1 | 2.5 |
| 2.7 | API docs (Mintlify lub Scalar; OpenAPI 3.1 spec) | 12 | 2 | P0 | 2.1 |
| 2.8 | Status page (Better Uptime / Statuspage / własny) | 4 | 1 | P1 | — |
| 2.9 | Audit log (kto zapytał o jakie dane kiedy — pharma compliance) | 8 | 3 | P1 | 2.3, 1.1 |
| 2.10 | Rate‑limit + auth middleware tests (vitest/supertest) | 8 | 3 | P1 | 2.1, 2.2 |
| 2.11 | CORS / API origin allowlist konfigurowalny per‑key | 4 | 2 | P2 | 2.1 |
| 2.12 | OAuth dla SSO (enterprise tier) — Auth0 / Clerk / WorkOS | 14 | 4 | P2 | 2.1 |

**Branch 2 total: 118h = ~3 tygodnie @ 6h/dzień.**

### Branch 3: Reports & Exports

| # | Item | h | trudność | priorytet | zależności |
|---|---|---|---|---|---|
| 3.1 | Decyzja: użyć `report-generator.zip` jako baza czy pisać od zera. **User musi wypakować zip do oceny.** Domyślnie zakładam pisanie od zera. | 2 | 1 | P0 | — |
| 3.2 | PDF stack: react-pdf vs Puppeteer (HTML→PDF) — POC obu | 8 | 3 | P0 | 1.* |
| 3.3 | Template: Weekly Digest (PDF, 4-8 stron) | 12 | 3 | P0 | 3.2, 1.* |
| 3.4 | Template: Monthly Outlook (PDF, 12-20 stron) | 14 | 3 | P1 | 3.2, 1.* |
| 3.5 | Template: Country Deep‑Dive (PDF, 6-10 stron) | 10 | 3 | P1 | 3.2, 1.* |
| 3.6 | Template: Biotech Intelligence Brief (PDF, 4-6 stron) | 8 | 3 | P1 | 3.2 |
| 3.7 | XLSX export (ExcelJS) — multi‑sheet z cases / deaths / regions / sources | 10 | 3 | P0 | 1.* |
| 3.8 | CSV streaming (Express stream + cursor pagination) dla bulk exportu | 6 | 2 | P0 | 1.1 |
| 3.9 | S3/R2 storage + signed URLs (1h expiry) | 6 | 2 | P0 | 2.1 |
| 3.10 | On‑demand report job (queue + status polling endpoint) | 10 | 3 | P0 | 1.18 |
| 3.11 | Subscription cron (weekly/monthly trigger) + email/Telegram delivery | 12 | 3 | P1 | 3.10, 2.5 |
| 3.12 | Email integration (Resend / Postmark) | 4 | 1 | P1 | 3.11 |
| 3.13 | Sponsored research reports — frontmatter z disclaimerami, audit trail | 6 | 2 | P2 | 3.4 |

**Branch 3 total: 108h = ~2.7 tygodni @ 6h/dzień.**

---

## Total Estimated Effort

| Branch | Hours | Days @ 6h/day | Calendar weeks (1 dev, 5 days/week) |
|---|---|---|---|
| Branch 1 (Real data) | 216 | 36 | ~7 |
| Branch 2 (B2B infra) | 118 | 20 | ~4 |
| Branch 3 (Reports) | 108 | 18 | ~3.5 |
| **Total** | **442** | **74** | **~14.5 weeks (3.5 miesiąca)** |

**Realistyczny harmonogram dla 1 solo dewelopera, 5d/tydz × 6h = 30h/tydz: ~3.5 miesiąca.** Z buforem na refactor, wpadki i nieznane: **4-5 miesięcy**.

Jeśli chcemy szybciej:

- **Minimal Viable Real (Branch 1 only, P0 items)**: ~110h = 4 tygodnie → wystarczy żeby wymienić mock na real WHO+CDC+PAHO+Argentina+demographics fix. Tier 1 sales mogą startować po tym.
- **Tier 1 only (News + Stocks, no epi)**: można dziś, koszt ~30h na Phase 2 P0 + cleanup; baner DEMO na epi, sprzedaż wyłącznie news/stocks intelligence za $99-199/mies.

---

## Recommended Next Step

**Wypakuj `report-generator.zip` do `c:\Users\bibac\OneDrive\HantaVirus_App\report-generator\` (jeśli istnieje na dysku) i daj znać.** Zanim zaczniemy cokolwiek implementować w Branch 1/2/3, muszę zobaczyć czy ten zip ma użyteczne templates/stack żeby zaoszczędzić 30-50h pracy w Branch 3, czy lepiej pisać od zera. To jednorazowy delta‑decision na początku — zwleczenie kilku godzin teraz oszczędza tygodnie później.

Jeśli zip nie istnieje / nie zawiera nic użytecznego: **zacznij od Branch 1 item 1.1 (Postgres + schema)** — to fundament pod wszystko inne i blokuje 80% pozostałych itemów.

**Stop. Czekam na review tego raportu zanim cokolwiek dalej.**
