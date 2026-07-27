/**
 * Region Taxonomy and Country Mapping Utility for CarcBlog Directories.
 */

export const REGION_OPTIONS = [
  'All Regions',
  'North America',
  'South America',
  'Europe',
  'Asia',
  'Southeast Asia',
  'Middle East',
  'Africa',
  'Oceania',
] as const;

export type RegionType = typeof REGION_OPTIONS[number];

const COUNTRY_TO_REGION_MAP: Record<string, string> = {
  // North America
  US: 'North America',
  USA: 'North America',
  'United States': 'North America',
  CA: 'North America',
  Canada: 'North America',
  MX: 'North America',
  Mexico: 'North America',
  PA: 'North America',
  Panama: 'North America',
  CR: 'North America',
  'Costa Rica': 'North America',

  // South America
  BR: 'South America',
  Brazil: 'South America',
  CL: 'South America',
  Chile: 'South America',
  CO: 'South America',
  Colombia: 'South America',
  AR: 'South America',
  Argentina: 'South America',
  PE: 'South America',
  Peru: 'South America',
  UY: 'South America',
  Uruguay: 'South America',

  // Europe
  GB: 'Europe',
  UK: 'Europe',
  'United Kingdom': 'Europe',
  DE: 'Europe',
  Germany: 'Europe',
  FR: 'Europe',
  France: 'Europe',
  IT: 'Europe',
  Italy: 'Europe',
  ES: 'Europe',
  Spain: 'Europe',
  PT: 'Europe',
  Portugal: 'Europe',
  NL: 'Europe',
  Netherlands: 'Europe',
  BE: 'Europe',
  Belgium: 'Europe',
  SE: 'Europe',
  Sweden: 'Europe',
  NO: 'Europe',
  Norway: 'Europe',
  FI: 'Europe',
  Finland: 'Europe',
  DK: 'Europe',
  Denmark: 'Europe',
  IE: 'Europe',
  Ireland: 'Europe',
  PL: 'Europe',
  Poland: 'Europe',
  CH: 'Europe',
  Switzerland: 'Europe',
  AT: 'Europe',
  Austria: 'Europe',
  CZ: 'Europe',
  'Czech Republic': 'Europe',
  EE: 'Europe',
  Estonia: 'Europe',
  BG: 'Europe',
  Bulgaria: 'Europe',
  HR: 'Europe',
  Croatia: 'Europe',
  UA: 'Europe',
  Ukraine: 'Europe',
  RO: 'Europe',
  Romania: 'Europe',
  GR: 'Europe',
  Greece: 'Europe',
  HU: 'Europe',
  Hungary: 'Europe',
  IS: 'Europe',
  Iceland: 'Europe',
  AL: 'Europe',
  Albania: 'Europe',
  BY: 'Europe',
  Belarus: 'Europe',

  // Asia
  IN: 'Asia',
  India: 'Asia',
  CN: 'Asia',
  China: 'Asia',
  JP: 'Asia',
  Japan: 'Asia',
  KR: 'Asia',
  'South Korea': 'Asia',
  Korea: 'Asia',
  PK: 'Asia',
  Pakistan: 'Asia',
  BD: 'Asia',
  Bangladesh: 'Asia',
  LK: 'Asia',
  'Sri Lanka': 'Asia',
  TW: 'Asia',
  Taiwan: 'Asia',

  // Southeast Asia
  SG: 'Southeast Asia',
  Singapore: 'Southeast Asia',
  ID: 'Southeast Asia',
  Indonesia: 'Southeast Asia',
  MY: 'Southeast Asia',
  Malaysia: 'Southeast Asia',
  TH: 'Southeast Asia',
  Thailand: 'Southeast Asia',
  VN: 'Southeast Asia',
  Vietnam: 'Southeast Asia',
  PH: 'Southeast Asia',
  Philippines: 'Southeast Asia',

  // Middle East
  AE: 'Middle East',
  UAE: 'Middle East',
  'United Arab Emirates': 'Middle East',
  SA: 'Middle East',
  'Saudi Arabia': 'Middle East',
  EG: 'Middle East',
  Egypt: 'Middle East',
  IL: 'Middle East',
  Israel: 'Middle East',
  QA: 'Middle East',
  Qatar: 'Middle East',
  TR: 'Middle East',
  Turkey: 'Middle East',

  // Africa
  ZA: 'Africa',
  'South Africa': 'Africa',
  NG: 'Africa',
  Nigeria: 'Africa',
  KE: 'Africa',
  Kenya: 'Africa',
  GH: 'Africa',
  Ghana: 'Africa',
  MA: 'Africa',
  Morocco: 'Africa',
  RW: 'Africa',
  Rwanda: 'Africa',

  // Oceania
  AU: 'Oceania',
  Australia: 'Oceania',
  NZ: 'Oceania',
  'New Zealand': 'Oceania',
};

/**
 * Returns the region for a given country code or name.
 */
export function getRegionForCountry(country?: string | null): string {
  if (!country || !country.trim()) return 'Other / Unknown';
  const c = country.trim();
  return COUNTRY_TO_REGION_MAP[c] || COUNTRY_TO_REGION_MAP[c.toUpperCase()] || 'Other / Unknown';
}

/**
 * Returns all matching country codes and names for a given region.
 */
export function getCountriesForRegion(region: string): string[] {
  if (!region || region === 'All' || region === 'All Regions') return [];

  const matched: string[] = [];
  Object.entries(COUNTRY_TO_REGION_MAP).forEach(([country, reg]) => {
    if (reg.toLowerCase() === region.toLowerCase()) {
      matched.push(country);
    }
  });

  return matched;
}
