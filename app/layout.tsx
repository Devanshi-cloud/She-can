import type { Metadata } from 'next';
import { Poppins, DM_Sans } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'She Can Foundation | NGO Registered under Indian Society Act',
  description: 'Empowering women and transforming lives. Join us in making a difference through our registered NGO under the Indian Society Act.',
  keywords: 'She Can Foundation, NGO, volunteer, internship, women empowerment, social impact',
  openGraph: {
    title: 'She Can Foundation | NGO Registered under Indian Society Act',
    description: 'Empowering women and transforming lives. Join us as a volunteer or intern.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/public/logo.jpg" />
      </head>
      <body className={`${poppins.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
