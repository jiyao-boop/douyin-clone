const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@': path.resolve(__dirname, 'src'),  // 和你原本的@路径别名完全一致
            '@/pages': path.resolve(__dirname, 'src/pages'),
            '@/components': path.resolve(__dirname, 'src/components'),
            '@/router': path.resolve(__dirname, 'src/router')
        }
    },
    style: {
        sass: {
            loaderOptions: {
                sourceMap: false  // 兼容sass-loader，避免编译报错
            }
        }
    }
};