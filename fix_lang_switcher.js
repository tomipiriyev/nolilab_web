// Improved Language Selector - detects current language from URL
document.querySelectorAll('.language-option').forEach(option => {
  option.addEventListener('click', (e) => {
    e.preventDefault();
    const targetLang = option.dataset.lang;
    
    // Store selected language
    localStorage.setItem('selectedLanguage', targetLang);
    
    // Detect current language from URL path
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(p => p);
    
    // Check if we're in a language directory
    const langDirs = ['ru', 'zh', 'ja', 'fr', 'es'];
    let currentLang = 'en';
    let currentPage = 'index.html';
    
    // Find current language and page
    for (let i = 0; i < pathParts.length; i++) {
      if (langDirs.includes(pathParts[i])) {
        currentLang = pathParts[i];
        currentPage = pathParts[i + 1] || 'index.html';
        break;
      }
    }
    
    // If no language directory found, get the page from the last part
    if (currentLang === 'en') {
      currentPage = pathParts[pathParts.length - 1] || 'nolilab-redesigned.html';
    }
    
    // Map main page names
    if (currentPage === 'nolilab-redesigned.html' || currentPage === '') {
      currentPage = 'index.html';
    }
    
    // Build redirect URL
    let redirectUrl;
    if (targetLang === 'en') {
      // Going to English - go to root directory
      if (currentLang === 'en') {
        // Already in English
        redirectUrl = './nolilab-redesigned.html';
      } else {
        // From language dir to English
        if (currentPage === 'index.html') {
          redirectUrl = '../nolilab-redesigned.html';
        } else {
          redirectUrl = `../${currentPage}`;
        }
      }
    } else {
      // Going to another language
      if (currentLang === 'en') {
        // From English to language dir
        redirectUrl = `./${targetLang}/${currentPage}`;
      } else {
        // From one language to another
        redirectUrl = `../${targetLang}/${currentPage}`;
      }
    }
    
    // Redirect
    window.location.href = redirectUrl;
  });
});
