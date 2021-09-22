module.exports = {
  theme: {
    screens: {
      '2xl': {'max': '1536px'},
      // => @media (max-width: 1536px) { ... }

      'xl': {'max': '1280px'},
      // => @media (max-width: 1280px) { ... }

      'lg': {'max': '1024px'},
      // => @media (max-width: 1024px) { ... }

      'md': {'max': '768px'},
      // => @media (max-width: 768px) { ... }

      'sm': {'max': '640px'},
      // => @media (max-width: 640px) { ... }

      'xs': {'max': '480px'},
      // => @media (max-width: 480px) { ... }
    },
    fontFamily: {
      sans: ['Montserrat', 'Arial', 'sans-serif']
    }
  },
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './components/**/*.vue',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './plugins/**/*.js',
      './nuxt.config.js',
    ]
  },
  future: {
    purgeLayersByDefault: true,
  }
}
