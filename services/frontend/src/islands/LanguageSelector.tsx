import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageSelectorProps {
  currentPath: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-cn', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja-jp', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

export default function LanguageSelector({ currentPath }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [translationStatus, setTranslationStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
      }
    }
  }, []);

  // Fetch translation availability for current page
  useEffect(() => {
    async function checkTranslations() {
      if (!currentPath || currentPath === '/') return;
      
      setLoading(true);
      try {
        // Extract tutorial path from current URL
        const tutorialPath = extractTutorialPath(currentPath);
        if (!tutorialPath) return;

        // Check translation availability via backend API
        const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(
          `${backendUrl}/api/translations/available?source_file_path=${encodeURIComponent(tutorialPath)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setTranslationStatus(data.translation_status || {});
        }
      } catch (error) {
        console.error('Error checking translations:', error);
      } finally {
        setLoading(false);
      }
    }

    checkTranslations();
  }, [currentPath]);

  function extractTutorialPath(path: string): string | null {
    // Extract tutorial path from URL like /tutorials/Audio/deepgram_tutorial
    const match = path.match(/\/tutorials\/(.+)/);
    if (!match) return null;
    
    // Add file extension based on common patterns
    let tutorialPath = match[1];
    if (!tutorialPath.includes('.')) {
      // Try to determine extension (default to .ipynb for now)
      // This could be improved with actual file checking
      tutorialPath += '.ipynb';
    }
    
    return tutorialPath;
  }

  function getCurrentLanguageOption(): LanguageOption {
    return LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];
  }

  function getStatusBadge(langCode: string): string {
    if (langCode === 'en') return 'available';
    
    const status = translationStatus[langCode];
    if (status === 'completed') return 'available';
    if (status === 'pending' || status === 'outdated') return 'in-progress';
    return 'unavailable';
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'text-green-500';
      case 'in-progress': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  }

  function switchLanguage(langCode: string) {
    const status = getStatusBadge(langCode);
    
    if (status === 'unavailable' && langCode !== 'en') {
      alert(`Translation to ${LANGUAGES.find(l => l.code === langCode)?.name} is not yet available for this tutorial.`);
      return;
    }

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

  const currentLang = getCurrentLanguageOption();

  return (
    <div className="relative">
      {/* Language selector button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dark-hover transition-colors text-dark-text"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <svg 
          className="w-5 h-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
          />
        </svg>
        <span className="text-sm font-medium hidden sm:inline">
          {currentLang.flag} {currentLang.nativeName}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-dark-bg border border-dark-border rounded-lg shadow-xl z-50 py-1">
            {LANGUAGES.map((lang) => {
              const status = getStatusBadge(lang.code);
              const isActive = lang.code === currentLanguage;
              
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    switchLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-dark-hover transition-colors text-left ${
                    isActive ? 'bg-dark-hover' : ''
                  }`}
                  disabled={loading}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-dark-text">
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-dark-secondary">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Status indicator */}
                    {status !== 'available' && lang.code !== 'en' && (
                      <span className={`text-xs ${getStatusColor(status)}`}>
                        {status === 'in-progress' ? '⏳' : '–'}
                      </span>
                    )}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <svg 
                        className="w-4 h-4 text-blue-500" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
            
            {/* Status legend */}
            <div className="border-t border-dark-border mt-2 pt-2 px-4 pb-2">
              <div className="text-xs text-dark-secondary space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⏳</span>
                  <span>In progress</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
