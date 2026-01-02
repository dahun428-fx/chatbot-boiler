import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        desktop: '900px',
        tablet: '600px',
        desktopMsg: '950px',
        tabletMsg: '650px',
      },
      height: {
        desktopPopup: '65vh',
        tabletPopup: '50vh',
        mobilePopup: '28rem',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          1: '#66A8D0',
          2: '#0F75BD',
        },
        blue: {
          1: '#F5FAFD',
          2: '#E7F1F8',
        },
        semired: {
          1: '#EF4444',
        },
        original: {
          50: '#E6F1F7',
          100: '#CCE3F0',
          150: '#CCE3F0',
          200: '#CCE3F0',
          300: '#66A8D0',
          400: '#66A8D0',
          500: '#0F75BD',
          525: '#0F75BD',
          550: '#0F75BD',
          600: '#0F75BD',
          700: '#0C5A90',
          800: '#0C5A90',
          900: '#083C62',
        },
        modalbtn: {
          default: '#FF7BEE',
        },
        hospital: {
          1: '#66A8D0', //typename
          2: '#FF8C42', //만성질환 관리기관
        },
        wellecheck: { 1: '#525FD2' },
        gradeLabel: {
          1: '#131312ff',
          2: '#C0C0C0',
          3: '#CD7F32',
        },
        chart: {
          1: '#E6F1F7',
        },
        gray: {
          50: '#F7F7F7',
          60: '#F0F1F3',
          75: '#F3F3F3',
          80: '#F5F5FF',
          90: '#e7e7e7',
          100: '#DCDCDC',
          150: '#C4C4C4',
          200: '#B0B0B0',
          250: '#9B9B9B',
          300: '#8A8A8A',
          350: '#737373',
          400: '#5C5C5C',
          500: '#474747',
          600: '#303030',
          700: '#2A2A2A',
          800: '#1C1C1C',
          900: '#171717',
          950: '#0F0F0F',
        },
        orange: {
          50: '#FFFAF7',
          100: '#FEEEE5',
          150: '#FED9C4',
          200: '#FFBD96',
          300: '#FF9B61',
          400: '#FF7B2E',
          500: '#FF5E00',
          600: '#C94A00',
          700: '#913500',
          800: '#592100',
          900: '#290F00',
        },
        white: 'rgba(255, 255, 255, 1)',
        black: 'rgba(0, 0, 0, 1)',
        abnormal: {
          caution: '#F59E0B',
        },
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
      },
      fontSize: {
        body2: '1rem', // 16px
        body1: '1rem', // 16px
        label: '0.875rem', // 14px
        caption: '0.75rem', // 12px
      },
      fontWeight: {
        light: '300', // font-light 재정의
        body2: '600',
        body1: '400',
        label: '500',
        caption: '400',
      },
      lineHeight: {
        body2: '22px',
        body1: '22px',
        label: '20px',
        caption: '20px',
      },
      letterSpacing: {
        body2: '-2%',
        body1: '-2%',
        label: '0',
        caption: '0',
      },
    },
  },
  darkMode: 'class',
  plugins: [heroui()],
};
export default config;
