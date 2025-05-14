// eslint.config.js
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js'; // React için önerilen kurallar
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';

export default [
  // Global ayarlar (tarayıcı ve Node.js ortamları için)
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Tarayıcı global değişkenleri
        ...globals.node,    // Node.js global değişkenleri (geliştirme ortamı için)
      },
    },
  },

  // Temel JavaScript kuralları
  pluginJs.configs.recommended,

  // TypeScript kuralları
  ...tseslint.configs.recommended, // tslint.configs.recommendedTypeChecked için projenizde tsconfig.json'a parserOptions.project eklemeniz gerekir.

  // React'a özel yapılandırma
  {
    files: ['**/*.{ts,tsx}'], // Sadece .ts ve .tsx dosyalarına uygula
    ...pluginReactConfig,     // eslint-plugin-react'in önerilen ayarlarını kullan
    settings: {
      react: {
        version: 'detect', // Yüklü React sürümünü otomatik olarak algıla
      },
    },
    languageOptions: {
      ...pluginReactConfig.languageOptions, // eslint-plugin-react'ten dil seçeneklerini al
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // JSX'i etkinleştir
        },
      },
    },
    plugins: {
      'react': pluginReactConfig.plugins.react, // React plugin'ini açıkça ekle (recommended içinde gelir ama belirtmek iyi olabilir)
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    rules: {
      ...pluginReactConfig.rules, // React kurallarını ekle
      ...pluginReactHooks.configs.recommended.rules, // React Hooks kurallarını ekle
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Modern React (17+) ve Vite gibi araçlarla JSX için React'ı import etmeye gerek yok.
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off', // Bu da genellikle gereksizdir.

      // Aldığınız hatalarla ilgili kurallar:
      '@typescript-eslint/no-explicit-any': 'warn', // 'any' kullanımını hata yerine uyarı olarak göster (başlangıç için)
      '@typescript-eslint/prefer-as-const': 'warn', // 'as const' kullanımını öner (uyarı olarak)

      // Diğer faydalı olabilecek kurallar (isteğe bağlı):
      'no-unused-vars': 'off', // @typescript-eslint/no-unused-vars daha iyidir
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Kullanılmayan değişkenler için uyarı
      'quotes': ['warn', 'single', { avoidEscape: true }], // Tek tırnak kullanımını öner
      'semi': ['warn', 'always'], // Noktalı virgül kullanımını öner
    },
  },

  // Göz ardı edilecek dosyalar ve klasörler
  {
    ignores: [
      'dist/',
      'node_modules/',
      'build/',
      '.vite/',
      'vite.config.ts.timestamp-*', // Vite'in geçici dosyaları
      'eslint.config.js', // ESLint yapılandırma dosyasının kendisi
    ],
  },
];
