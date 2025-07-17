module.exports = {
  purge:
    process.env.NODE_ENV == 'production'
      ? ['./src/**/*.html', './src/**/*.jsx', './src/**/*.js']
      : false,
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['DM Sans', 'sans-serif'],
    },
    screens: {
      sm: {max: '639px'},
      md: {max: '767px'},
      lg: {max: '1023px'},
      xl: {max: '1279px'},
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
