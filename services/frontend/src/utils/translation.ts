/**
 * Translation utilities for handling multilingual content
 */

export interface TranslationConfig {
  supportedLanguages: string[];
  defaultLanguage: string;
  languageNames: Record<string, string>;
}

export const translationConfig: TranslationConfig = {
  supportedLanguages: ['en', 'zh-cn', 'ja-jp', 'ja'],
  defaultLanguage: 'en',
  languageNames: {
    'en': 'English',
    'zh-cn': '中文',
    'ja-jp': '日本語',
    'ja': '日本語'
  }
};

/**
 * Get language from URL parameter or localStorage
 */
export function getLanguageFromRequest(url: URL): string {
  const langParam = url.searchParams.get('lang');
  
  if (langParam && translationConfig.supportedLanguages.includes(langParam)) {
    return langParam;
  }
  
  return translationConfig.defaultLanguage;
}

/**
 * Get the directory path for a specific language
 */
export function getLanguageDir(language: string): string {
  const langDirs: Record<string, string> = {
    'en': 'tutorials',
    'zh-cn': 'tutorials-zh-cn',
    'ja-jp': 'tutorials-ja',
    'ja': 'tutorials-ja'  // Support both ja and ja-jp
  };
  
  return langDirs[language] || 'tutorials';
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(language: string): boolean {
  return translationConfig.supportedLanguages.includes(language);
}

/**
 * Get tutorial path for a specific language
 */
export function getTranslatedTutorialPath(basePath: string, language: string): string {
  if (language === 'en') {
    return basePath;
  }
  
  // For translated content, prepend language directory
  const langDir = getLanguageDir(language);
  return `${langDir}/${basePath}`;
}

/**
 * Extract tutorial file path from URL
 */
export function extractTutorialPath(urlPath: string): string | null {
  const match = urlPath.match(/\/tutorials\/(.+)/);
  return match ? match[1] : null;
}

/**
 * Category/section name translations per language
 */
export const categoryTranslations: Record<string, Record<string, string>> = {
  'ja-jp': {
    'Overview': '概要',
    'Vibe Coding': 'Vibe Coding',
    'Automation': '自動化',
    'Web Search': 'ウェブ検索',
    'Image And Video': '画像と動画',
    'Image and Video': '画像と動画',
    'Data And Memory': 'データとメモリ',
    'Data and Memory': 'データとメモリ',
    'Model Providers': 'モデルプロバイダー',
    'Gateways': 'ゲートウェイ',
    'Frameworks': 'フレームワーク',
    'Chat UI Framework': 'チャットUIフレームワーク',
    'Observarbility': 'オブザーバビリティ',
    'Observability': 'オブザーバビリティ',
    'Fine Tuning': 'ファインチューニング',
    'Audio': 'オーディオ',
    'Browser Use': 'ブラウザ利用',
    'Drafts': '下書き',
  },
  'ja': {
    'Overview': '概要',
    'Vibe Coding': 'Vibe Coding',
    'Automation': '自動化',
    'Web Search': 'ウェブ検索',
    'Image And Video': '画像と動画',
    'Image and Video': '画像と動画',
    'Data And Memory': 'データとメモリ',
    'Data and Memory': 'データとメモリ',
    'Model Providers': 'モデルプロバイダー',
    'Gateways': 'ゲートウェイ',
    'Frameworks': 'フレームワーク',
    'Chat UI Framework': 'チャットUIフレームワーク',
    'Observarbility': 'オブザーバビリティ',
    'Observability': 'オブザーバビリティ',
    'Fine Tuning': 'ファインチューニング',
    'Audio': 'オーディオ',
    'Browser Use': 'ブラウザ利用',
    'Drafts': '下書き',
  },
};

/**
 * Get translated category name, falling back to the original if no translation exists
 */
export function getCategoryName(name: string, language: string): string {
  if (language === 'en' || !categoryTranslations[language]) {
    return name;
  }
  return categoryTranslations[language][name] ?? name;
}
