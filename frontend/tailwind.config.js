/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F9FB',
        surface: '#FFFFFF',
        raised: '#FCFCFB',
        sunken: '#F2F3F6',
        line: '#E8E8E5',
        'line-strong': '#DCDCD8',
        ink: '#171717',
        'ink-soft': '#3F3F46',
        muted: '#6B7280',
        faint: '#9AA0AA',
        accent: '#4F6DF5',
        'accent-hover': '#3F5AE0',
        'accent-soft': '#EEF1FE',
        'accent-line': '#D6DEFC',
        positive: '#177245',
        'positive-soft': '#E9F4EE',
        caution: '#9A6700',
        'caution-soft': '#FBF3E2',
        danger: '#B42318',
        'danger-soft': '#FDECEA',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', '16px'],
        meta: ['12px', '18px'],
        sm: ['13px', '20px'],
        base: ['14px', '22px'],
        lg: ['15px', '24px'],
        reading: ['16px', '28px'],
        section: ['20px', '28px'],
        title: ['28px', '36px'],
        display: ['34px', '42px'],
      },
      borderRadius: { sm: '4px', DEFAULT: '6px', md: '8px', lg: '10px', xl: '14px' },
      boxShadow: {
        soft: '0 1px 2px rgba(23,23,23,0.04)',
        raised: '0 1px 3px rgba(23,23,23,0.06), 0 6px 18px -8px rgba(23,23,23,0.14)',
        pop: '0 12px 40px -12px rgba(23,23,23,0.22), 0 2px 6px rgba(23,23,23,0.06)',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-320px 0' }, '100%': { backgroundPosition: '320px 0' } },
        indeterminate: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(320%)' } },
      },
      animation: {
        shimmer: 'shimmer 1.4s linear infinite',
        indeterminate: 'indeterminate 1.3s cubic-bezier(0.4,0,0.2,1) infinite',
      },
    },
  },
  plugins: [],
};
