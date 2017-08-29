'use strict';

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
const folderName = isDevelopment ? 'dev' : 'dist';
const path = require('path');

const _src = path.resolve(__dirname, '../../client/');
const _public = path.resolve(__dirname, '../../public/' + folderName + '/client/');

const _fav = 'durak-game/assets/images/favicons/';
const _imgSrc = 'durak-game/assets/images/**/*.*'; // **/*.{png,svg}
const _imgDest = 'images';
const _scss = 'durak-game/styles/scss/**/*.scss';
const _css = 'durak-game/styles/css/';
const _any = '**/*.*';

/* Tasks params */
module.exports = {
  clean: {
    src: _public
  },
  favicon: {
    src: path.join(_src, _fav, 'favicon_logo.png'),
    dest: path.join(_src, _fav),
    favicons: {
      vinylMode: true,
      html: "index.html",
      pipeHTML: true,
      icons: {
          android: false,              // Create Android homescreen icon. `boolean` or `{ offset, background, shadow }`
          appleIcon: true,             // Create Apple touch icons. `boolean` or `{ offset, background }`
          appleStartup: false,         // Create Apple startup images. `boolean` or `{ offset, background }`
          coast: false,                // Create Opera Coast icon with offset 25%. `boolean` or `{ offset, background }`
          favicons: true,              // Create regular favicons. `boolean`
          firefox: false,              // Create Firefox OS icons. `boolean` or `{ offset, background }`
          windows: false,              // Create Windows 8 tile icons. `boolean` or `{ background }`
          yandex: false                // Create Yandex browser icon. `boolean` or `{ background }`
      }
    }
  },
  faviconCopy: {
    src: path.join(_src, _fav, 'favicon.ico'),
    dest: path.join(_public, _imgDest)
  },
  images: {
    src: [
      path.join(_src, _imgSrc),
      '!' + path.join(_src, _fav, _any)
    ],
    dest: path.join(_public, _imgDest),
    imagemin: function (use) {
      return {
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: use,
        interlaced: true
      };
    }
  },
  styles: {
    src: path.join(_src, _scss),
    dest: path.join(_src, _css),
    autoprefixer: {
      browsers: ['last 2 versions']
    }
  },
  scripts: {
    src: _src,
    dest: _public
  }

};
