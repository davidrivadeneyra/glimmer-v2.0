/** @type {import('tailwindcss').Config} */
const semanticColorKeys = [
  'accent',
  'title-darker',
  'title-gray',
  'background-darker-surface',
  'background-dark-surface',
  'background-white-surface',
  'background-light-surface',
  'background-lighter-surface',
  'description-light-surface',
  'description-dark-surface',
  'description-transparent',
  'border-dark-surface',
]

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: semanticColorKeys.flatMap((key) => [
    `bg-${key}`,
    `text-${key}`,
    `border-${key}`,
  ]),
  theme: {
    extend: {
      colors: {
        accent: '#254AF6',
        'title-darker': '#010104',
        'title-gray': '#8D98AC',
        'background-darker-surface': '#010104',
        'background-dark-surface': '#18181B',
        'background-white-surface': '#FFFFFF',
        'background-light-surface': '#EAEEF6',
        'background-lighter-surface': '#F8F9FC',
        'description-light-surface': '#282C34',
        'description-dark-surface': '#ABAFB6',
        'description-transparent': 'rgba(248, 249, 252, 0.7)',
        'border-dark-surface': 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
				'sans': ['Silka', 'system-ui']
			}
    },
  },
  plugins: [],
}
