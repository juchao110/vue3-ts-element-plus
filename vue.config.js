module.exports = {
  publicPath: process.env.NODE_ENV !== 'development' ? './' : '/',
  productionSourceMap: false,
  configureWebpack: {
    externals: {
      vue: 'Vue',
      'vue-router': 'VueRouter'
    }
  },
  devServer: {
    proxy: {
      '/': {
        // target: 'https://m.snowlink.cn/',
        target: 'https://test.snowlink.cn/',
        changeOrigin: true,
        secure: false,
        ws: false,
        pathRewrite: {
          '^/': ''
        }
      }
    },
    inline: true,
    hot: true,
    stats: 'minimal',
    contentBase: __dirname,
    overlay: true,
    historyApiFallback: true
  },
}