/**
 * Industry Normalization Utility for CarcBlog Ecosystem.
 * Parses, cleans, maps, deduplicates, and counts industry categories into 47 canonical options.
 */

export const CANONICAL_CATEGORIES = [
  'AI',
  'SaaS',
  'Developer Tools',
  'Cybersecurity',
  'FinTech',
  'HealthTech',
  'EdTech',
  'E-commerce',
  'Marketplace',
  'Productivity',
  'Marketing',
  'MarTech',
  'AdTech',
  'SalesTech',
  'HRTech',
  'LegalTech',
  'PropTech',
  'Cloud Computing',
  'DevOps',
  'Data & Analytics',
  'Enterprise Software',
  'Consumer Apps',
  'Open Source',
  'Blockchain & Web3',
  'Robotics',
  'IoT',
  'Hardware',
  'Gaming',
  'Media',
  'Creator Economy',
  'Logistics',
  'Supply Chain',
  'Manufacturing',
  'FoodTech',
  'AgriTech',
  'ClimateTech',
  'CleanTech',
  'Energy',
  'BioTech',
  'Healthcare',
  'Finance',
  'Education',
  'Security',
  'Travel',
  'SpaceTech',
  'Social',
  'Other',
] as const;

export type CanonicalCategory = typeof CANONICAL_CATEGORIES[number];

/**
 * Rules mapping raw sub-terms / keywords (lowercase) to canonical categories.
 */
const RAW_KEYWORD_MAP: Array<{ keywords: string[]; canonical: CanonicalCategory }> = [
  { keywords: ['ai', 'artificial intelligence', 'ai assistant', 'conversational ai', 'ai-enhanced learning', 'generative ai', 'genai', 'llm', 'machine learning', 'deeptech', 'deep tech', 'neural'], canonical: 'AI' },
  { keywords: ['saas', 'software as a service', 'b2b saas', 'cloud saas'], canonical: 'SaaS' },
  { keywords: ['developer tools', 'developer platform', 'devtools', 'developer experience', 'api', 'apis', 'developer'], canonical: 'Developer Tools' },
  { keywords: ['cybersecurity', 'cyber security', 'information security', 'infosec'], canonical: 'Cybersecurity' },
  { keywords: ['fintech', 'financial technology', 'banking', 'payments', 'insurtech', 'wealthtech'], canonical: 'FinTech' },
  { keywords: ['healthtech', 'health tech', 'digital health', 'telehealth', 'medtech', 'medical tech'], canonical: 'HealthTech' },
  { keywords: ['edtech', 'ed tech', 'educational technology', 'online learning', 'e-learning', 'lms'], canonical: 'EdTech' },
  { keywords: ['e-commerce', 'ecommerce', 'retail', 'direct-to-consumer', 'dtc', 'shopping'], canonical: 'E-commerce' },
  { keywords: ['marketplace', 'marketplaces', 'peer-to-peer', 'p2p'], canonical: 'Marketplace' },
  { keywords: ['productivity', 'workflow', 'collaboration', 'project management', 'task management'], canonical: 'Productivity' },
  { keywords: ['martech', 'marketing automation'], canonical: 'MarTech' },
  { keywords: ['adtech', 'advertising tech', 'ad tech', 'advertising', 'location-based'], canonical: 'AdTech' },
  { keywords: ['salestech', 'sales tech', 'crm'], canonical: 'SalesTech' },
  { keywords: ['hrtech', 'hr tech', 'human resources', 'recruitment', 'talent', 'careers', 'hiring'], canonical: 'HRTech' },
  { keywords: ['legaltech', 'legal tech', 'legal'], canonical: 'LegalTech' },
  { keywords: ['proptech', 'prop tech', 'real estate tech', 'real estate'], canonical: 'PropTech' },
  { keywords: ['cloud computing', 'cloud infrastructure', 'cloud platform', 'cloud', 'paas', 'iaas'], canonical: 'Cloud Computing' },
  { keywords: ['devops', 'ci/cd', 'infrastructure as code', 'sysadmin'], canonical: 'DevOps' },
  { keywords: ['data & analytics', 'big data', 'analytics', 'data science', 'business intelligence', 'data'], canonical: 'Data & Analytics' },
  { keywords: ['enterprise software', 'enterprise', 'erp', 'b2b software'], canonical: 'Enterprise Software' },
  { keywords: ['consumer apps', 'consumer software', 'consumer', 'b2c'], canonical: 'Consumer Apps' },
  { keywords: ['open source', 'open-source', 'foss'], canonical: 'Open Source' },
  { keywords: ['blockchain & web3', 'blockchain', 'web3', 'crypto', 'cryptocurrency', 'defi', 'nft'], canonical: 'Blockchain & Web3' },
  { keywords: ['robotics', 'autonomous', 'drones', 'automation'], canonical: 'Robotics' },
  { keywords: ['iot', 'internet of things', 'connected devices', 'smart home'], canonical: 'IoT' },
  { keywords: ['hardware', 'semiconductors', 'chips', 'electronics', '3d printing', 'advanced materials'], canonical: 'Hardware' },
  { keywords: ['gaming', 'video games', 'esports', 'game dev'], canonical: 'Gaming' },
  { keywords: ['creator economy', 'creator tech', 'creators'], canonical: 'Creator Economy' },
  { keywords: ['media', 'music', 'entertainment', 'publishing', 'broadcasting', 'content'], canonical: 'Media' },
  { keywords: ['logistics', 'freight', 'trucking', 'shipping', 'delivery', 'last mile'], canonical: 'Logistics' },
  { keywords: ['supply chain', 'procurement', 'inventory management'], canonical: 'Supply Chain' },
  { keywords: ['foodtech', 'food tech', '3d printed foods', 'food & beverage', 'food', 'alt protein'], canonical: 'FoodTech' },
  { keywords: ['agritech', 'agtech', 'agriculture', 'farming'], canonical: 'AgriTech' },
  { keywords: ['climatetech', 'climate tech', 'sustainability', 'carbon', 'decarbonization'], canonical: 'ClimateTech' },
  { keywords: ['cleantech', 'clean tech', 'clean energy', 'waste management', 'recycling'], canonical: 'CleanTech' },
  { keywords: ['energy', 'renewables', 'solar', 'wind', 'battery', 'electric vehicles', 'ev'], canonical: 'Energy' },
  { keywords: ['biotech', 'biotechnology', 'genetic engineering', 'genomics', 'life sciences', 'therapeutics'], canonical: 'BioTech' },
  { keywords: ['healthcare', 'medical devices', 'pharma', 'clinical', 'hospitals'], canonical: 'Healthcare' },
  { keywords: ['manufacturing', 'industrial', 'factory automation', 'defense', 'automotive'], canonical: 'Manufacturing' },
  { keywords: ['finance', 'financial services', 'accounting', 'investing'], canonical: 'Finance' },
  { keywords: ['education', 'higher ed', 'k-12', 'tutoring'], canonical: 'Education' },
  { keywords: ['security', 'physical security', 'surveillance'], canonical: 'Security' },
  { keywords: ['travel', 'tourism', 'hospitality', 'traveltech'], canonical: 'Travel' },
  { keywords: ['spacetech', 'space tech', 'aerospace', 'space', 'satellites'], canonical: 'SpaceTech' },
  { keywords: ['social', 'social media', 'social network', 'community'], canonical: 'Social' },
  { keywords: ['marketing', 'digital marketing', 'content marketing', 'seo'], canonical: 'Marketing' },
];

/**
 * Normalizes a raw, potentially comma-separated industry string into deduplicated canonical categories.
 */
export function normalizeIndustryString(rawIndustry?: string | null): CanonicalCategory[] {
  if (!rawIndustry || !rawIndustry.trim()) return ['Other'];

  // Split comma-separated values and trim
  const rawParts = rawIndustry.split(',').map(p => p.trim()).filter(Boolean);
  const matchedCategories = new Set<CanonicalCategory>();

  rawParts.forEach(part => {
    const lowerPart = part.toLowerCase();
    let foundMatch = false;

    // Check mapping rules
    for (const rule of RAW_KEYWORD_MAP) {
      if (rule.keywords.some(kw => lowerPart === kw || lowerPart.includes(kw))) {
        matchedCategories.add(rule.canonical);
        foundMatch = true;
      }
    }

    // Direct match against canonical list if exact case match
    if (!foundMatch) {
      const directCanonical = CANONICAL_CATEGORIES.find(c => c.toLowerCase() === lowerPart);
      if (directCanonical) {
        matchedCategories.add(directCanonical);
        foundMatch = true;
      }
    }

    if (!foundMatch) {
      matchedCategories.add('Other');
    }
  });

  const result = Array.from(matchedCategories);
  return result.length > 0 ? result : ['Other'];
}

/**
 * Takes an array of raw industry strings from the database and returns normalized categories with counts, sorted descending by count.
 */
export function getNormalizedCategoryCounts(rawIndustries: (string | null)[]): Array<{ category: CanonicalCategory; count: number }> {
  const countsMap = new Map<CanonicalCategory, number>();

  rawIndustries.forEach(rawStr => {
    const canonicalList = normalizeIndustryString(rawStr);
    canonicalList.forEach(category => {
      countsMap.set(category, (countsMap.get(category) || 0) + 1);
    });
  });

  return Array.from(countsMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Returns raw search keywords / terms for a selected canonical category to enable database ILIKE filtering.
 */
export function getSearchTermsForCanonicalCategory(category: string): string[] {
  const normCategory = category.trim().toLowerCase();

  for (const rule of RAW_KEYWORD_MAP) {
    if (rule.canonical.toLowerCase() === normCategory) {
      return Array.from(new Set([rule.canonical, ...rule.keywords]));
    }
  }

  const found = CANONICAL_CATEGORIES.find(c => c.toLowerCase() === normCategory);
  return found ? [found] : [category];
}
