import './globals.css';

export const metadata = {
  title: {
    default: 'Worship na Marafiki — African Worship Songs, Lyrics & Chords',
    template: '%s | Worship na Marafiki',
  },
  description:
    'A free library of African worship songs with lyrics, ChordBora chords, key transposition, and translations across 30+ languages including Swahili, Zulu, Yoruba, Lingala and more. Romans 12:1.',
  keywords: [
    'African worship songs', 'African praise songs', 'worship lyrics and chords',
    'Swahili worship songs', 'Zulu worship songs', 'Yoruba worship', 'Lingala worship',
    'Kinyarwanda hymns', 'Shona worship', 'African hymns', 'worship chords transpose',
  ],
  metadataBase: new URL('https://worshipnamarafiki.org'),
  alternates: { canonical: '/' },
  verification: {
    google: 'cNpsNjsf2zIxCK0pflYdrptNEwAdv9EK9DFi27EOeYM',
  },
  openGraph: {
    title: 'Worship na Marafiki — African Worship Songs, Lyrics & Chords',
    description:
      'A free library of African worship songs — lyrics, chords, transposition, and translations across the continent.',
    url: 'https://worshipnamarafiki.org',
    siteName: 'Worship na Marafiki',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
