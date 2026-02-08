export interface ThemeColors {
  accent50: string
  accent100: string
  accent200: string
  accent300: string
  accent400: string
  accent500: string
  accent600: string
  accent700: string
  accent800: string
  accent900: string
}

export interface Theme {
  id: string
  name: string
  description: string
  colors: ThemeColors
  preview: string // Single hex color for the preview swatch
}

export const themes: Theme[] = [
  {
    id: 'poa',
    name: 'POA Emerald',
    description: 'El tema original del sistema',
    preview: '#10b981',
    colors: {
      accent50: '236 253 245',
      accent100: '209 250 229',
      accent200: '167 243 208',
      accent300: '110 231 183',
      accent400: '52 211 153',
      accent500: '16 185 129',
      accent600: '5 150 105',
      accent700: '4 120 87',
      accent800: '6 95 70',
      accent900: '4 78 56',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Tonos de azul marino profesional',
    preview: '#0ea5e9',
    colors: {
      accent50: '240 249 255',
      accent100: '224 242 254',
      accent200: '186 230 253',
      accent300: '125 211 252',
      accent400: '56 189 248',
      accent500: '14 165 233',
      accent600: '2 132 199',
      accent700: '3 105 161',
      accent800: '7 89 133',
      accent900: '12 74 110',
    },
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    description: 'Violeta elegante para despachos',
    preview: '#8b5cf6',
    colors: {
      accent50: '245 243 255',
      accent100: '237 233 254',
      accent200: '221 214 254',
      accent300: '196 181 253',
      accent400: '167 139 250',
      accent500: '139 92 246',
      accent600: '124 58 237',
      accent700: '109 40 217',
      accent800: '91 33 182',
      accent900: '76 29 149',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Tonos cálidos energéticos',
    preview: '#f97316',
    colors: {
      accent50: '255 247 237',
      accent100: '255 237 213',
      accent200: '254 215 170',
      accent300: '253 186 116',
      accent400: '251 146 60',
      accent500: '249 115 22',
      accent600: '234 88 12',
      accent700: '194 65 12',
      accent800: '154 52 18',
      accent900: '124 45 18',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate Blue',
    description: 'Azul corporativo clásico',
    preview: '#3b82f6',
    colors: {
      accent50: '239 246 255',
      accent100: '219 234 254',
      accent200: '191 219 254',
      accent300: '147 197 253',
      accent400: '96 165 250',
      accent500: '59 130 246',
      accent600: '37 99 235',
      accent700: '29 78 216',
      accent800: '30 64 175',
      accent900: '30 58 138',
    },
  },
]

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) || themes[0]
}
