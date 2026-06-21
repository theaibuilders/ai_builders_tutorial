import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

interface LanguageOption {
  code: string;
  name: string;
}

interface LanguageSelectorProps {
  currentPath: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'zh-cn', name: 'Chinese' },
  { code: 'ja-jp', name: 'Japanese' },
];

export default function LanguageSelector({ currentPath }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  // Get current language from URL parameter or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    
    if (langParam && LANGUAGES.some(l => l.code === langParam)) {
      setCurrentLanguage(langParam);
      localStorage.setItem('preferred_language', langParam);
    } else {
      const savedLang = localStorage.getItem('preferred_language');
      if (savedLang && LANGUAGES.some(l => l.code === savedLang)) {
        setCurrentLanguage(savedLang);
        // Note: We intentionally do NOT redirect here to avoid a flash of English content.
        // The early inline script in TutorialLayout.astro handles redirecting on first load
        // for users with a saved non-English preference, before any content is painted.
      }
    }
  }, []);

  function getLanguageLabel(): string {
    switch (currentLanguage) {
      case 'zh-cn': return '中文';
      case 'ja-jp': return '日本語';
      default: return 'EN';
    }
  }

  function switchLanguage(langCode: string) {
    // Update URL with language parameter
    const url = new URL(window.location.href);
    if (langCode === 'en') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', langCode);
    }
    
    // Save preference
    localStorage.setItem('preferred_language', langCode);
    
    // Reload page with new language
    window.location.href = url.toString();
  }

  return (
    <div className="relative">
      {/* Language button - small text icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-12 h-8 px-2 flex items-center justify-center text-xs font-semibold text-gray-300 hover:text-white transition-colors rounded hover:bg-dark-hover whitespace-nowrap"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        {getLanguageLabel()}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu - opens downward on mobile, upward on desktop */}
          <div className="absolute left-0 w-28 bg-dark-bg border border-dark-border rounded-lg shadow-xl z-50 py-1 top-full mt-2 md:top-auto md:bottom-full md:mt-0 md:mb-2">
            {LANGUAGES.map((lang) => {
              const isActive = lang.code === currentLanguage;
              
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    switchLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-dark-hover transition-colors ${
                    isActive ? 'text-blue-400 font-medium' : 'text-gray-300'
                  }`}
                >
                  {lang.name}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
