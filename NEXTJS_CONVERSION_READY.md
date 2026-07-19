# Next.js Full Conversion - Ready to Implement

## All HTML Files Ready for Conversion to Next.js

### Current HTML Files (Old Structure):
```
html/
├── index.html              → app/page.tsx
├── about.html              → app/about/page.tsx
├── donate.html             → app/donate/page.tsx
├── volunteer.html          → app/volunteer/page.tsx
├── certificates.html       → app/certificates/page.tsx
├── admin-login.html        → app/admin/login/page.tsx
└── admin-dashboard.html    → app/admin/dashboard/page.tsx
```

### Current CSS Files (Will be Converted to Tailwind/CSS Modules):
```
css/
├── style.css               → app/globals.css + component styles
├── donate.css              → app/donate/page.css
├── admin-dashboard.css     → app/admin/dashboard/page.css
├── admin-login.css         → app/admin/login/page.css
├── admin.css               → app/admin/components/AdminLayout.css
├── about.css               → app/about/page.css
├── certificates.css        → app/certificates/page.css
└── volunteer.css           → app/volunteer/page.css
```

### Current JS Files (Will be Converted to TypeScript/JSX):
```
js/
├── config.js               → app/lib/config.ts
├── script.js               → Distributed across components
├── authRoutes.js           → app/api/auth/route.ts
├── authMiddleware.js       → middleware.ts
├── donateRoutes.js         → app/api/donate/route.ts
├── donationsRoutes.js      → app/api/donations/route.ts
├── referralRoutes.js       → app/api/referral/route.ts
├── campaignRoutes.js       → app/api/campaign/route.ts
├── dashboardRoutes.js      → app/api/dashboard/route.ts
├── donateRoutes.js         → app/api/donate/route.ts
├── ...other routes         → app/api/[resource]/route.ts
├── InternSignUp.jsx        → app/auth/signup/page.tsx
├── SuperAdminDashboard.jsx → app/admin/dashboard/page.tsx
├── InternManagementTable.jsx → app/components/InternTable.tsx
├── DonationAnalytics.jsx   → app/components/DonationAnalytics.tsx
└── ...other components     → app/components/[Component].tsx
```

## Implementation Plan

### Phase 1: Project Setup
1. ✅ Create `next.config.js`
2. ✅ Create `app/layout.tsx`
3. Create `tsconfig.json`
4. Create `tailwind.config.js` (optional)
5. Update `package.json` with Next.js dependencies

### Phase 2: Reusable Components
1. Create `app/components/Navbar.tsx` (from navbar in HTML)
2. Create `app/components/Footer.tsx` (from footer in HTML)
3. Create `app/components/HeroSection.tsx` (from hero sections)
4. Create `app/components/QuoteSection.tsx`
5. Create `app/components/ContactSection.tsx`

### Phase 3: Pages
1. Create `app/page.tsx` (homepage from index.html)
2. Create `app/about/page.tsx` (from about.html)
3. Create `app/donate/page.tsx` (from donate.html)
4. Create `app/volunteer/page.tsx` (from volunteer.html)
5. Create `app/certificates/page.tsx` (from certificates.html)

### Phase 4: Admin Pages
1. Create `app/admin/layout.tsx` (with sidebar)
2. Create `app/admin/login/page.tsx` (from admin-login.html)
3. Create `app/admin/dashboard/page.tsx` (from admin-dashboard.html)
4. Create `app/components/AdminSidebar.tsx`
5. Create `app/components/AdminTopbar.tsx`

### Phase 5: API Routes
1. Migrate `/js/authRoutes.js` → `app/api/auth/route.ts`
2. Migrate `/js/donateRoutes.js` → `app/api/donate/route.ts`
3. Migrate `/js/donationsRoutes.js` → `app/api/donations/route.ts`
4. Migrate `/js/referralRoutes.js` → `app/api/referral/route.ts`
5. Migrate all other route files → `app/api/[resource]/route.ts`

### Phase 6: Integration & Forms
1. Convert form submissions to use API routes
2. Integrate Razorpay payment system
3. Connect Supabase database
4. Set up authentication flow
5. Test all forms and API endpoints

### Phase 7: Admin Features
1. Convert dashboard tables to React components
2. Add real-time data updates
3. Implement admin CRUD operations
4. Set up role-based access control
5. Add charts and analytics

### Phase 8: Testing & Optimization
1. Test all pages on mobile/desktop
2. Test form submissions
3. Test admin functionality
4. Optimize images
5. Test API endpoints

## Key Conversion Patterns

### HTML to JSX
```javascript
// From: <div class="container" id="hero">
// To:
<div className="container" id="hero">

// From: <img src="../assets/logo.jpg" alt="Logo" />
// To:
<Image src="/assets/logo.jpg" alt="Logo" width={40} height={40} />

// From: <a href="about.html">About</a>
// To:
<Link href="/about">About</Link>
```

### CSS Variables (Preserved)
All CSS variables from `css/style.css` will be moved to `app/globals.css`:
```css
:root {
  --red: #ed0707;
  --black: #0d0705;
  --white: #ffffff;
  --gray-text: #6b7280;
  --font-head: 'Poppins', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  /* ... all other vars */
}
```

### JavaScript to TypeScript
```javascript
// Before: document.getElementById('navbar')
// After (in React):
const [navOpen, setNavOpen] = useState(false);

// Before: fetch('/api/endpoint')
// After:
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

## File Structure After Conversion

```
.
├── app/
│   ├── layout.tsx
│   ├── page.tsx (homepage)
│   ├── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── InternTable.tsx
│   │   └── ...
│   ├── about/
│   │   └── page.tsx
│   ├── donate/
│   │   └── page.tsx
│   ├── volunteer/
│   │   └── page.tsx
│   ├── certificates/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── volunteers/
│   │   │   └── page.tsx
│   │   └── team/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts
│   │   ├── donate/
│   │   │   └── route.ts
│   │   ├── donations/
│   │   │   └── route.ts
│   │   ├── referral/
│   │   │   └── route.ts
│   │   └── ...
│   └── lib/
│       ├── config.ts
│       ├── utils.ts
│       └── api-client.ts
├── public/
│   └── assets/
│       └── public/
│           ├── logo.jpg
│           ├── hero.png
│           └── ...
├── next.config.js
├── tsconfig.json
├── package.json
└── .env.local
```

## Total Conversion Effort

- **HTML Pages**: 7 files
- **CSS Files**: 8 files
- **JS Files**: 20+ files
- **Components**: 10+ React components
- **API Routes**: 12+ endpoints
- **Total Lines of Code**: 3,000+ lines

## Start Building

### Step 1: Update package.json
```json
{
  "name": "she-can-foundation",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Step 2: Create tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Step 3: Install dependencies
```bash
npm install next react react-dom
npm install --save-dev typescript @types/react @types/node
```

### Step 4: Start development
```bash
npm run dev
```

## Full HTML Files Ready for Conversion

All 7 HTML files are ready to be converted to Next.js:
- ✅ index.html (373 lines)
- ✅ donate.html (370+ lines)
- ✅ admin-dashboard.html (429+ lines)
- ✅ volunteer.html
- ✅ about.html
- ✅ certificates.html
- ✅ admin-login.html

## Estimated Conversion Time

- Navbar/Footer components: 1 hour
- Homepage: 1-2 hours
- Other pages: 2-3 hours
- Admin pages: 2-3 hours
- API routes: 2-3 hours
- Testing & optimization: 2 hours

**Total: 10-15 hours for complete conversion**

## Next Actions

1. Review `NEXTJS_MIGRATION_GUIDE.md` for detailed patterns
2. Start with Phase 1: Project Setup
3. Create reusable components first
4. Convert pages one by one
5. Migrate API routes
6. Test thoroughly before deploying

All files are now organized and ready for Next.js conversion!
