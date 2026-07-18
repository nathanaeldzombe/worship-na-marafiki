// All languages covered by Worship na Marafiki, with a representative
// country flag and region. Languages cross borders — the flag is a
// best-fit representative, not an exclusive claim.

export const LANGUAGE_REGIONS = [
  {
    region: 'East Africa',
    languages: [
      { name: 'Swahili', country: 'Tanzania', flag: '🇹🇿' },
      { name: 'Kikuyu', country: 'Kenya', flag: '🇰🇪' },
      { name: 'Luo', country: 'Kenya', flag: '🇰🇪' },
      { name: 'Luhya', country: 'Kenya', flag: '🇰🇪' },
      { name: 'Kinyarwanda', country: 'Rwanda', flag: '🇷🇼' },
      { name: 'Kirundi', country: 'Burundi', flag: '🇧🇮' },
      { name: 'Luganda', country: 'Uganda', flag: '🇺🇬' },
    ],
  },
  {
    region: 'Central Africa',
    languages: [
      { name: 'Lingala', country: 'DR Congo', flag: '🇨🇩' },
    ],
  },
  {
    region: 'Horn & North Africa',
    languages: [
      { name: 'Amharic', country: 'Ethiopia', flag: '🇪🇹' },
      { name: 'Oromo', country: 'Ethiopia', flag: '🇪🇹' },
      { name: 'Tigrinya', country: 'Eritrea', flag: '🇪🇷' },
      { name: 'Somali', country: 'Somalia', flag: '🇸🇴' },
      { name: 'Arabic', country: 'North Africa', flag: '🇪🇬' },
    ],
  },
  {
    region: 'West Africa',
    languages: [
      { name: 'Yoruba', country: 'Nigeria', flag: '🇳🇬' },
      { name: 'Igbo', country: 'Nigeria', flag: '🇳🇬' },
      { name: 'Twi', country: 'Ghana', flag: '🇬🇭' },
      { name: 'Akan', country: 'Ghana', flag: '🇬🇭' },
      { name: 'Ewe', country: 'Ghana', flag: '🇬🇭' },
      { name: 'Fula', country: 'West Africa', flag: '🇸🇳' },
      { name: 'Wolof', country: 'Senegal', flag: '🇸🇳' },
    ],
  },
  {
    region: 'Southern Africa',
    languages: [
      { name: 'Zulu', country: 'South Africa', flag: '🇿🇦' },
      { name: 'Xhosa', country: 'South Africa', flag: '🇿🇦' },
      { name: 'Sotho', country: 'South Africa', flag: '🇿🇦' },
      { name: 'Tswana', country: 'Botswana', flag: '🇧🇼' },
      { name: 'Afrikaans', country: 'South Africa', flag: '🇿🇦' },
      { name: 'Ndebele', country: 'Zimbabwe', flag: '🇿🇼' },
      { name: 'Shona', country: 'Zimbabwe', flag: '🇿🇼' },
      { name: 'Chichewa', country: 'Malawi', flag: '🇲🇼' },
      { name: 'Nyanja', country: 'Zambia', flag: '🇿🇲' },
      { name: 'Bemba', country: 'Zambia', flag: '🇿🇲' },
      { name: 'Tonga', country: 'Zambia', flag: '🇿🇲' },
      { name: 'Tumbuka', country: 'Malawi', flag: '🇲🇼' },
    ],
  },
];

// Flat, alphabetical list of language names — for dropdowns and filters.
export const ALL_LANGUAGES = LANGUAGE_REGIONS
  .flatMap((r) => r.languages.map((l) => l.name))
  .sort((a, b) => a.localeCompare(b));

// name -> flag lookup
export const LANGUAGE_FLAG = Object.fromEntries(
  LANGUAGE_REGIONS.flatMap((r) => r.languages.map((l) => [l.name, l.flag]))
);
