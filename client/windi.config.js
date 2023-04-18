
export default {
  extract: {
    include: ['./src/**/*.html', './src/**/*.vue'],
  },
  plugins: [
    WindiCSS({
      scan: {
        dirs: ['.'], // all files in the cwd
        fileExtensions: ['vue', 'js', 'ts'], // also enabled scanning for js/ts
      },
}),
  ],
}
