// All languages covered by Worship na Marafiki, with a representative
// country flag and region. Languages cross borders — the flag is a
// best-fit representative, not an exclusive claim.

export const LANGUAGE_REGIONS = [
  {
    region: 'East Africa',
    languages: [
      { name: 'Swahili', country: 'Tanzania', flag: '🇹🇿', cc: 'tz' },
      { name: 'Kikuyu', country: 'Kenya', flag: '🇰🇪', cc: 'ke' },
      { name: 'Luo', country: 'Kenya', flag: '🇰🇪', cc: 'ke' },
      { name: 'Luhya', country: 'Kenya', flag: '🇰🇪', cc: 'ke' },
      { name: 'Kinyarwanda', country: 'Rwanda', flag: '🇷🇼', cc: 'rw' },
      { name: 'Kirundi', country: 'Burundi', flag: '🇧🇮', cc: 'bi' },
      { name: 'Luganda', country: 'Uganda', flag: '🇺🇬', cc: 'ug' },
    ],
  },
  {
    region: 'Central Africa',
    languages: [
      { name: 'Lingala', country: 'DR Congo', flag: '🇨🇩', cc: 'cd' },
    ],
  },
  {
    region: 'Horn & North Africa',
    languages: [
      { name: 'Amharic', country: 'Ethiopia', flag: '🇪🇹', cc: 'et' },
      { name: 'Oromo', country: 'Ethiopia', flag: '🇪🇹', cc: 'et' },
      { name: 'Tigrinya', country: 'Eritrea', flag: '🇪🇷', cc: 'er' },
      { name: 'Somali', country: 'Somalia', flag: '🇸🇴', cc: 'so' },
      { name: 'Arabic', country: 'North Africa', flag: '🇪🇬', cc: 'eg' },
    ],
  },
  {
    region: 'West Africa',
    languages: [
      { name: 'Yoruba', country: 'Nigeria', flag: '🇳🇬', cc: 'ng' },
      { name: 'Igbo', country: 'Nigeria', flag: '🇳🇬', cc: 'ng' },
      { name: 'Twi', country: 'Ghana', flag: '🇬🇭', cc: 'gh' },
      { name: 'Akan', country: 'Ghana', flag: '🇬🇭', cc: 'gh' },
      { name: 'Ewe', country: 'Ghana', flag: '🇬🇭', cc: 'gh' },
      { name: 'Fula', country: 'West Africa', flag: '🇸🇳', cc: 'sn' },
      { name: 'Wolof', country: 'Senegal', flag: '🇸🇳', cc: 'sn' },
    ],
  },
  {
    region: 'Southern Africa',
    languages: [
      { name: 'Zulu', country: 'South Africa', flag: '🇿🇦', cc: 'za' },
      { name: 'Xhosa', country: 'South Africa', flag: '🇿🇦', cc: 'za' },
      { name: 'Sotho', country: 'South Africa', flag: '🇿🇦', cc: 'za' },
      { name: 'Tswana', country: 'Botswana', flag: '🇧🇼', cc: 'bw' },
      { name: 'Afrikaans', country: 'South Africa', flag: '🇿🇦', cc: 'za' },
      { name: 'Ndebele', country: 'Zimbabwe', flag: '🇿🇼', cc: 'zw' },
      { name: 'Shona', country: 'Zimbabwe', flag: '🇿🇼', cc: 'zw' },
      { name: 'Chichewa', country: 'Malawi', flag: '🇲🇼', cc: 'mw' },
      { name: 'Nyanja', country: 'Zambia', flag: '🇿🇲', cc: 'zm' },
      { name: 'Bemba', country: 'Zambia', flag: '🇿🇲', cc: 'zm' },
      { name: 'Tonga', country: 'Zambia', flag: '🇿🇲', cc: 'zm' },
      { name: 'Tumbuka', country: 'Malawi', flag: '🇲🇼', cc: 'mw' },
    ],
  },
];

// Flat, alphabetical list of language names — for dropdowns and filters.
export const ALL_LANGUAGES = LANGUAGE_REGIONS
  .flatMap((r) => r.languages.map((l) => l.name))
  .sort((a, b) => a.localeCompare(b));

// name -> flag emoji lookup
export const LANGUAGE_FLAG = Object.fromEntries(
  LANGUAGE_REGIONS.flatMap((r) => r.languages.map((l) => [l.name, l.flag]))
);

// name -> ISO country code (for real flag images)
export const LANGUAGE_CC = Object.fromEntries(
  LANGUAGE_REGIONS.flatMap((r) => r.languages.map((l) => [l.name, l.cc]))
);
