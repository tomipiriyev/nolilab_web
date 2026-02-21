#!/bin/bash

# Updated language switcher JavaScript
read -r -d '' NEW_JS << 'JAVASCRIPT'
    // Language Selector
    document.querySelectorAll('.language-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const langCode = option.dataset.lang;

        // Store selected language
        localStorage.setItem('selectedLanguage', langCode);

        // Get current page filename
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';

        // Build redirect URL based on selected language
        let redirectUrl;
        if (langCode === 'en') {
          // English - go to root directory
          if (currentPage === 'index.html') {
            redirectUrl = '../nolilab-redesigned.html';
          } else {
            redirectUrl = `../${currentPage}`;
          }
        } else {
          // Other languages - go to language directory  
          redirectUrl = `../${langCode}/${currentPage}`;
        }

        // Redirect to language-specific page
        window.location.href = redirectUrl;
      });
    });
JAVASCRIPT

# Update each language directory
for lang in ru zh ja fr es; do
  file="/Users/tamleykhapiriyev/Downloads/Nolilab_Website_AI/${lang}/index.html"
  
  if [ -f "$file" ]; then
    # Use perl for multi-line replacement
    perl -i -pe 'BEGIN{undef $/;} s/    \/\/ Language Selector\n.*?}\);/'"$(echo "$NEW_JS" | sed 's/\\/\\\\/g; s/\//\\\//g; s/&/\\&/g')"'/s' "$file"
    echo "Updated: $file"
  fi
done

echo "Language switchers updated!"
