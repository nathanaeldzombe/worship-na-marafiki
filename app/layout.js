import './globals.css';

export const metadata = {
  title: 'Worship na Marafiki — African Praise, Every Language',
  description:
    'A community song library of African worship music with lyrics, ChordBora chords, transposition, and translations across the continent. Romans 12:1.',
  metadataBase: new URL('https://worshipnamarafiki.africa'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
