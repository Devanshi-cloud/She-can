# Next.js Migration Guide - She Can Foundation

## Overview
This guide documents the complete migration from HTML/CSS/JS to Next.js 16+ with React JSX.

## Project Structure

```
app/
├── layout.tsx                 # Root layout with metadata
├── page.tsx                   # Homepage
├── page.css                   # Styles
├── about/
│   └── page.tsx              # About page
├── donate/
│   └── page.tsx              # Donation page
├── volunteer/
│   └── page.tsx              # Volunteer form page
├── certificates/
│   └── page.tsx              # Certificates page
├── admin/
│   ├── layout.tsx            # Admin layout with sidebar
│   ├── login/
│   │   └── page.tsx          # Admin login
│   ├── dashboard/
│   │   └── page.tsx          # Admin dashboard
│   ├── volunteers/
│   │   └── page.tsx          # Volunteer management
│   └── team/
│       └── page.tsx          # Team management
├── api/
│   ├── auth/                 # Auth endpoints
│   ├── donate/               # Donation endpoints
│   ├── donations/            # Donations tracking
│   ├── referral/             # Referral endpoints
│   ├── admin/                # Admin endpoints
│   └── ...                   # Other API routes
├── components/
│   ├── Navbar.tsx            # Navigation
│   ├── Footer.tsx            # Footer
│   ├── HeroSection.tsx       # Hero banner
│   ├── AboutSection.tsx      # About content
│   ├── JoinTeamSection.tsx   # Join team CTA
│   ├── QuoteSection.tsx      # Testimonial
│   ├── ContactSection.tsx    # Contact info
│   ├── DonationHero.tsx      # Donation page hero
│   ├── DonationNarrative.tsx # Donation story
│   ├── DonationTiers.tsx     # Tier cards
│   ├── DonationGateway.tsx   # Payment section
│   ├── AdminSidebar.tsx      # Admin sidebar
│   ├── AdminTopbar.tsx       # Admin topbar
│   ├── AdminDashboard.tsx    # Dashboard content
│   ├── VolunteerTable.tsx    # Volunteer list
│   ├── TeamManagement.tsx    # Team section
│   └── ...                   # Other components
├── lib/
│   ├── utils.ts              # Utility functions
│   ├── api-client.ts         # API helper
│   ├── auth.ts               # Auth utilities
│   └── config.ts             # Configuration
└── globals.css               # Global styles

public/
├── assets/
│   └── public/               # Images and logos
└── ...
```

## Key Components to Convert

### 1. **Pages**
- `index.html` → `app/page.tsx`
- `about.html` → `app/about/page.tsx`
- `donate.html` → `app/donate/page.tsx`
- `volunteer.html` → `app/volunteer/page.tsx`
- `certificates.html` → `app/certificates/page.tsx`
- `admin-login.html` → `app/admin/login/page.tsx`
- `admin-dashboard.html` → `app/admin/dashboard/page.tsx`

### 2. **Components**
- Navigation → `Navbar.tsx`
- Footer → `Footer.tsx`
- Hero Section → `HeroSection.tsx`
- Forms → `VolunteerForm.tsx`, `DonateForm.tsx`
- Dashboard sections → `AdminDashboard.tsx`, etc.

### 3. **Styling**
- `css/*.css` → Tailwind CSS or CSS Modules
- CSS Variables → Maintained in `globals.css`
- Responsive design → Tailwind breakpoints

### 4. **JavaScript Logic**
- Event handlers → React hooks (useState, useEffect)
- Form handling → React controlled components
- API calls → fetch/axios within server/client components
- Appwrite SDK → Integrated in API routes

## CSS Variables (Preserved in Next.js)

```css
:root {
  --red: #ed0707;
  --black: #0d0705;
  --white: #ffffff;
  --gray-text: #6b7280;
  --font-head: 'Poppins', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --transition: all 0.3s ease;
  --shadow: 0 4px 16px rgba(0,0,0,0.1);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
  --radius: 8px;
}
```

## Font Setup

Using Next.js built-in font optimization:

```typescript
// app/layout.tsx
import { Poppins, DM_Sans } from 'next/font/google';

const poppins = Poppins({
  variable: '--font-head',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500'],
});
```

## Converting HTML to JSX

### Before (HTML)
```html
<nav id="navbar" role="navigation" aria-label="Main navigation">
  <div class="container">
    <div class="nav-inner">
      <a href="#hero" class="nav-logo">
        <img src="../assets/public/logo.jpg" alt="Logo" />
      </a>
      <ul class="nav-links" id="navLinks">
        <li><a href="#hero" class="active">Home</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
    </div>
  </div>
</nav>
```

### After (React JSX)
```typescript
// components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container">
        <div className="nav-inner">
          <Link href="/" className="nav-logo" aria-label="She Can Foundation – Home">
            <Image 
              src="/assets/public/logo.jpg" 
              alt="She Can Foundation" 
              width={40}
              height={40}
              className="logo-img"
            />
          </Link>
          
          <ul className="nav-links">
            <li><Link href="/" className="active">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/donate">Donate</Link></li>
            <li><Link href="/volunteer">Volunteer</Link></li>
            <li><Link href="/admin/login" className="btn-admin">Admin</Link></li>
          </ul>

          <button 
            className="hamburger"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link href="/" className="mobile-link">Home</Link>
          <Link href="/about" className="mobile-link">About</Link>
          <Link href="/donate" className="mobile-link">Donate</Link>
          <Link href="/volunteer" className="mobile-link">Volunteer</Link>
          <Link href="/admin/login" className="mobile-link">Admin</Link>
        </nav>
      )}
    </nav>
  );
}
```

## API Routes Migration

### Before (Express.js in `/js`)
```javascript
app.post('/api/donate', (req, res) => {
  // Handle donation
});
```

### After (Next.js API Routes)
```typescript
// app/api/donate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Handle donation
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## Environment Variables

Update `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_KEY=...
SUPABASE_SECRET_KEY=...
RAZORPAY_TEST_KEY_ID=...
RAZORPAY_TEST_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_API_KEY=...
```

## Image Optimization

Replace `<img>` tags with Next.js `Image`:

```typescript
import Image from 'next/image';

// Before: <img src="../assets/public/hero.png" alt="Hero" />
// After:
<Image 
  src="/assets/public/hero.png" 
  alt="Hero image"
  width={1200}
  height={600}
  priority
  className="hero-image"
/>
```

## Link Routing

Replace `<a>` tags with Next.js `Link`:

```typescript
import Link from 'next/link';

// Before: <a href="about.html">About</a>
// After:
<Link href="/about" className="link-class">About</Link>
```

## Form Handling

Convert vanilla JS forms to React controlled components:

```typescript
'use client';

import { useState } from 'react';

export default function VolunteerForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit to API
    const res = await fetch('/api/volunteer', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    // Handle response
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Migration Checklist

- [ ] Set up Next.js 16+ project
- [ ] Configure `next.config.js`
- [ ] Create `app/layout.tsx` with metadata
- [ ] Add global CSS with CSS variables
- [ ] Create Navbar component
- [ ] Create Footer component
- [ ] Create page components for each HTML file
- [ ] Convert all forms to React controlled components
- [ ] Migrate API endpoints to `/api` routes
- [ ] Update all image references to use Next.js `Image`
- [ ] Update all links to use Next.js `Link`
- [ ] Test responsive design
- [ ] Optimize for SEO (metadata, OG tags)
- [ ] Deploy to Vercel
- [ ] Test admin dashboard functionality
- [ ] Test donation flow
- [ ] Test volunteer form
- [ ] Test volunteer list/table component
- [ ] Fix any remaining bugs

## Performance Tips

1. **Use `next/image` for images** - Automatic optimization
2. **Use `next/font` for fonts** - No layout shift
3. **Server Components by default** - Use `'use client'` only when needed
4. **Optimize bundle** - Code splitting automatic
5. **Use ISR** - `revalidate` for static pages
6. **Environment variables** - Use `NEXT_PUBLIC_` prefix for client-side

## Testing

```bash
npm run dev      # Development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Lint code
```

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Auto-deploy on push
4. Configure environment variables in Vercel dashboard
5. Done!

## Troubleshooting

**Issue**: Images not loading
- **Solution**: Ensure images are in `public/` directory

**Issue**: Styles not applying
- **Solution**: Check CSS imports and class names match

**Issue**: Hydration errors
- **Solution**: Remove inline styles, use CSS modules

**Issue**: Routes not found
- **Solution**: Check file naming matches route structure

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)

## Next Steps

1. Review this guide
2. Start with homepage conversion
3. Move to subpages
4. Convert forms and components
5. Migrate API routes
6. Test thoroughly
7. Deploy!
