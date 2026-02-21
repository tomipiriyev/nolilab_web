#!/usr/bin/env python3
"""
Automated website translation script for Nolilab
Translates HTML files while preserving structure
"""

import os
import re
import json
from pathlib import Path

# Language configurations
LANGUAGES = {
    'ru': 'Russian',
    'zh': 'Chinese (Simplified)',
    'ja': 'Japanese',
    'fr': 'French',
    'es': 'Spanish'
}

# Files to translate
HTML_FILES = [
    'nolilab-redesigned.html',
    'specifications.html',
    'software.html',
    'firmware.html',
    'setup-guides.html',
    'blog.html',
    'contact.html',
    'lorawan.html',
    'glossary.html',
    'privacy.html'
]

def copy_and_prepare_files():
    """Copy HTML files to language directories"""
    for lang_code in LANGUAGES.keys():
        lang_dir = Path(lang_code)
        lang_dir.mkdir(exist_ok=True)
        
        for html_file in HTML_FILES:
            src = Path(html_file)
            if src.exists():
                # Rename main page to index.html
                dest_name = 'index.html' if html_file == 'nolilab-redesigned.html' else html_file
                dest = lang_dir / dest_name
                
                # Copy file
                with open(src, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Update image paths to parent directory
                content = content.replace('src="images/', 'src="../images/')
                content = content.replace('href="images/', 'href="../images/')
                
                # Update internal links
                content = re.sub(r'href="\.\/nolilab-redesigned\.html', 'href="./index.html', content)
                
                # Update lang attribute
                content = re.sub(r'<html lang="en">', f'<html lang="{lang_code}">', content)
                
                with open(dest, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"Prepared: {lang_code}/{dest_name}")

if __name__ == '__main__':
    print("Preparing files for translation...")
    copy_and_prepare_files()
    print("\nFiles copied and prepared!")
    print("\nNext step: Use a translation service like:")
    print("- Google Cloud Translation API")
    print("- DeepL API") 
    print("- Azure Translator")
    print("- Or manual translation")

