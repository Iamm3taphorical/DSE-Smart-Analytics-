import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enJSON from './i18n/en.json';
import bnJSON from './i18n/bn.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enJSON },
            bn: { translation: bnJSON },
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;
