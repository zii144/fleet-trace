/**
 * Changelog Parser Utility
 * Parses CHANGELOG.md and converts it to patch notes format
 */

export interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  title: string;
  description: string;
  features: string[];
  improvements: string[];
  fixes: string[];
  security: string[];
  breaking?: string[];
  knownIssues?: string[];
  deprecated?: string[];
  removed?: string[];
}

export interface ChangelogSection {
  title: string;
  items: string[];
}

export interface ParsedChangelog {
  version: string;
  date: string;
  sections: ChangelogSection[];
}

/**
 * Parse CHANGELOG.md content and extract version information
 */
export function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = content.split('\n');
  
  let currentVersion = '';
  let currentDate = '';
  let currentSections: { [key: string]: string[] } = {};
  let currentSection = '';
  
  for (const line of lines) {
    // Match version headers: ## [1.0.2] - 2025-01-28
    const versionMatch = line.match(/^## \[([^\]]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})/);
    if (versionMatch) {
      // Save previous version if exists
      if (currentVersion && currentDate) {
        entries.push(createChangelogEntry(currentVersion, currentDate, currentSections));
      }
      
      currentVersion = versionMatch[1];
      currentDate = versionMatch[2];
      currentSections = {};
      currentSection = '';
      continue;
    }
    
    // Match section headers: ### Added, ### Changed, etc. (English and Chinese)
    const sectionMatch = line.match(/^###\s+(.+)$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].toLowerCase();
      // Map Chinese section names to English keys
      const sectionMapping: { [key: string]: string } = {
        'added': 'added',
        '新增': 'added',
        'changed': 'changed',
        '變更': 'changed',
        'fixed': 'fixed',
        '修復': 'fixed',
        'security': 'security',
        '安全性': 'security',
        'deprecated': 'deprecated',
        '已棄用': 'deprecated',
        'removed': 'removed',
        '移除': 'removed'
      };
      
      currentSection = sectionMapping[sectionName] || sectionName;
      currentSections[currentSection] = [];
      continue;
    }
    
    // Match list items: - Item description
    const itemMatch = line.match(/^-\s+(.+)$/);
    if (itemMatch && currentSection) {
      if (!currentSections[currentSection]) {
        currentSections[currentSection] = [];
      }
      currentSections[currentSection].push(itemMatch[1]);
    }
  }
  
  // Add the last version
  if (currentVersion && currentDate) {
    entries.push(createChangelogEntry(currentVersion, currentDate, currentSections));
  }
  
  return entries;
}

/**
 * Create a ChangelogEntry from parsed sections
 */
function createChangelogEntry(
  version: string, 
  date: string, 
  sections: { [key: string]: string[] }
): ChangelogEntry {
  const type = getVersionType(version);
  const title = getVersionTitle(version, type);
  const description = generateDescription(sections);
  
  return {
    version,
    date,
    type,
    title,
    description,
    features: sections['added'] || [],
    improvements: sections['changed'] || [],
    fixes: sections['fixed'] || [],
    security: sections['security'] || [],
    breaking: sections['deprecated'] || [],
    knownIssues: [],
    deprecated: sections['deprecated'] || [],
    removed: sections['removed'] || []
  };
}

/**
 * Determine version type based on version number
 */
function getVersionType(version: string): 'major' | 'minor' | 'patch' | 'hotfix' {
  const parts = version.split('.');
  if (parts.length >= 3) {
    const patch = parts[2];
    if (patch.includes('hotfix')) return 'hotfix';
  }
  
  if (parts[1] === '0' && parts[2] === '0') return 'major';
  if (parts[2] === '0') return 'minor';
  return 'patch';
}

/**
 * Generate version title based on type and version
 */
function getVersionTitle(version: string, type: string): string {
  const titles: { [key: string]: string } = {
    'major': '主要版本',
    'minor': '次要版本',
    'patch': '修復版本',
    'hotfix': '緊急修復'
  };
  
  return `${titles[type] || 'Update'}`;
}

/**
 * Generate description from sections
 */
function generateDescription(sections: { [key: string]: string[] }): string {
  const descriptions: string[] = [];
  
  if (sections['added'] && sections['added'].length > 0) {
    descriptions.push(`${sections['added'].length} 個新增功能`);
  }
  
  if (sections['changed'] && sections['changed'].length > 0) {
    descriptions.push(`${sections['changed'].length} 個最佳化`);
  }
  
  if (sections['fixed'] && sections['fixed'].length > 0) {
    descriptions.push(`${sections['fixed'].length} 個修復`);
  }
  
  if (sections['security'] && sections['security'].length > 0) {
    descriptions.push(`${sections['security'].length} 個安全性更新`);
  }
  
  if (descriptions.length === 0) {
    return 'General update and maintenance release.';
  }
  
  return descriptions.join(', ') + '.';
}

/**
 * Load and parse CHANGELOG.md
 */
export async function loadChangelog(): Promise<ChangelogEntry[]> {
  try {
    // Fetch the CHANGELOG.md file with cache busting
    const timestamp = new Date().getTime();
    const response = await fetch(`/CHANGELOG.md?t=${timestamp}`, {
      cache: 'no-cache'
    });
    if (!response.ok) {
      throw new Error(`Failed to load changelog: ${response.status}`);
    }
    
    const content = await response.text();
    return parseChangelog(content);
  } catch (error) {
    console.error('Error loading changelog:', error);
    return [];
  }
}

/**
 * Get changelog entries for a specific version
 */
export function getChangelogEntry(entries: ChangelogEntry[], version: string): ChangelogEntry | null {
  return entries.find(entry => entry.version === version) || null;
}

/**
 * Get latest changelog entry
 */
export function getLatestChangelogEntry(entries: ChangelogEntry[]): ChangelogEntry | null {
  if (entries.length === 0) return null;
  return entries[0]; // Assuming entries are sorted by date (newest first)
}
