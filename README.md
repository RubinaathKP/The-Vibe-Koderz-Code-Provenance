# Remix IET CONNECT Member Portal

## 1. Project Overview & Architecture
**Remix IET CONNECT** is an enterprise-grade full-stack portal designed for the *Institution of Engineering and Technology (IET)* Student Chapters. It serves as a unified directory, events manager, opportunities board, and project catalog.

The system is architected as a lightweight, single-container Node.js deployment:
* **Client Interface (SPA)**: Built using React (v19), Vite (v6), and Tailwind CSS (v4) with modern responsive design principles.
* **Server Infrastructure**: Express.js REST API providing secure routes and in-memory fallback JSON database persistence.
* **Production Packaging**: Bundled via `esbuild` into CommonJS format, with Vite static assets served directly through Express.

---

## 2. Setup & Installation Manual

### Prerequisites
* Node.js (LTS version recommended, v18+)
* Git

### Local Development Setup
1. Clone the repository and navigate to the project directory:
   ```bash
   cd Code-Provenance
   ```
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Initialize the environment variables file. Create a file named `.env` in the root directory:
   ```env
   PORT=3000
   ```
4. Start the Express development server (which embeds Vite's hot module reloading middleware):
   ```bash
   npm run dev
   ```
5. Open your web browser and navigate to `http://localhost:3000`.

### Production Build & Execution
To validate production builds or run a local performance audit:
1. Compile and bundle the frontend client and backend code:
   ```bash
   npm run build
   ```
2. Start the optimized, compiled production server:
   ```bash
   npm start
   ```

---

## 3. Project Structure
```text
Code-Provenance/
├── api/                   # Vercel Serverless Function entrypoints
│   └── index.ts           # Serverless Express wrapper
├── data/                  # Persistent data directory
│   └── db.json            # JSON Database storage file
├── server-store/          # Server database managers
│   └── store.ts           # initDb / saveDb filesystem controller
├── src/
│   ├── components/        # Frontend UI views
│   │   ├── AuthView.tsx   # Login/Signup forms (with phone code dropdowns)
│   │   ├── Navbar.tsx     # Desktop Header and Mobile Drawer component
│   │   ├── Sidebar.tsx    # Desktop Sidebar navigation panel
│   │   └── countries.json # 101 country emojis, dial codes, and lengths
│   ├── utils/
│   │   └── crypto.ts      # XOR Base64 cookie cryptography helpers
│   ├── App.tsx            # Root Client State Router
│   ├── api.ts             # Client API request wrapper (fetch client)
│   └── types.ts           # Core TypeScript Interface definitions
├── server.ts              # Express App Server router & middleware config
├── vercel.json            # Vercel Serverless function rewrites configuration
└── package.json           # Scripts & Dependencies configuration registry
```

---

## 4. Bug Investigation & Technical Analysis

During audits and deployment runs, several critical runtime errors and design defects were isolated and resolved:

### 4.1. Vercel Serverless Function Crash (Vite Native Loading)
* **Problem**: When deployed to Vercel, the function crashed with status code `500`. The server console showed module compilation errors trying to load the `vite` package.
* **Investigation**: `server.ts` imported Vite at the top level statically. Because `vite` is a development dependency, it is excluded in Vercel's production function containers.
* **Resolution**: Replaced the top-level static `vite` import with a dynamic ESModule import (`await import('vite')`) nested strictly inside the development mode conditional check. This prevents Vercel from ever attempting to locate or load Vite packages.

### 4.2. Vercel Read-Only Filesystem Errors (HTTP 500)
* **Problem**: Attempting to initialize the directory (`fs.mkdirSync`) or write JSON logs (`fs.writeFileSync`) thrown EROFS (Read-Only Filesystem) exceptions.
* **Investigation**: Serverless host environments enforce write bans across general execution paths.
* **Resolution**: Wrapped all directory creations and file writes in `store.ts` within `try-catch` scopes. If a write fail is caught, it prints a console warning and transparently falls back to runtime memory replication, ensuring the portal continues to serve data correctly.

### 4.3. ESModule Directory Import Collision
* **Problem**: Runtime crash throwing `ERR_UNSUPPORTED_DIR_IMPORT`.
* **Investigation**: In ESModules (`"type": "module"`), Node does not allow importing folders without explicit files. When importing `../server` from `api/index.ts`, it matched the `server/` directory instead of the `server.ts` script.
* **Resolution**: Renamed the `server` directory to `server-store` to clear name space collisions and used explicit `.js` extensions for ESM file resolutions.

### 4.4. Mobile View Hamburger Lockup & Navigation Hijacking
* **Problem**: The hamburger button locked up, close icons triggered forced authentication redirects, and sidebar tabs linked to incorrect panels.
* **Investigation**: Traced to conditional event overrides, nested overlays, and random index lock simulations.
* **Resolution**: Restructured the mobile drawer component as separate sibling elements in the layout, styled the slide-out menu with solid background structures, and aligned navigation onClick hooks to update `activeTab` directly.

### 4.5. Search Query Overflow & Card Exclusion
* **Problem**: Searching for an entry on one tab (e.g. opportunities) and switching tabs (e.g. learning resources) caused cards on the new tab to be filtered out completely.
* **Investigation**: The search query string state was shared globally but never reset on tab swaps.
* **Resolution**: Added a `useEffect` hook in `App.tsx` listening to `activeTab` mutations to clear `searchQuery` back to an empty string.

---

## 5. Testing & Validation Matrix

### 5.1. Authentication Cookie Security
* **Target**: Validate credential isolation from localStorage/sessionStorage.
* **Steps**:
  1. Open Developer tools -> Application tab -> Cookies.
  2. Log into the chapter portal.
  3. Verify a cookie `iet_token` is present, flagged `Secure`, and the value contains a base64 XOR cipher rather than a plaintext user ID.
  4. Verify `localStorage` and `sessionStorage` are completely empty.

### 5.2. Country-Coded Phone Validator
* **Target**: Validate international dial prefixes and lengths.
* **Steps**:
  1. Go to the Sign Up form.
  2. Select `India (+91)` from the country dropdown. Input `987654321` (9 digits).
  3. Verify the validator throws an error: `Phone number must be exactly 10 digits for India`.
  4. Input `9876543210` (10 digits) and verify validation succeeds.

### 5.3. Multi-Device Layout Fluidity
* **Target**: Mobile responsive layout verification.
* **Steps**:
  1. Shrink viewport width to `< 768px` (mobile profile).
  2. Click the Hamburger menu; verify it opens smoothly and covers the viewport without text overlapping or layout shifting.
  3. Verify the close `[X]` button closes the drawer without forcing an authentication route switch.
