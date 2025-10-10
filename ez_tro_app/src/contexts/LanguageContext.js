import React, { createContext, useState, useContext } from 'react';
import en from '../constants/languages/en';
import zh from '../constants/languages/zh';
import vi from '../constants/languages/vi';
import th from '../constants/languages/th';
import id from '../constants/languages/id';

const LanguageContext = createContext();

const languages = {
  en,
  zh,
  vi,
  th,
  id
};

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('vi'); // Set Vietnamese as default

  const translate = (key) => {
    const keys = key.split('.');
    let translation = languages[currentLanguage];
    
    for (let k of keys) {
      translation = translation[k];
      if (!translation) return key;
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
