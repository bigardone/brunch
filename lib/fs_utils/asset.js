'use strict';
const debug = require('debug')('brunch:asset');
const sysPath = require('path');

const prettify = require('../helpers').prettify;
const common = require('./common');

// Asset: Simple abstraction on top of static assets that are not compiled.

// Directory separator.
const separator = sysPath.sep;

/* Get first parent directory that matches asset convention.
 *
 * Example:
 *   getAssetDirectory 'app/assets/thing/thing2.html', /assets/
 *   # app/assets/
 *
 * Returns String.
 */
const getAssetDirectory = (path, convention) => {
  const split = path.split(separator);

  /* Creates thing like this
   * 'app/', 'app/assets/', 'app/assets/thing/', 'app/assets/thing/item.html/'
   */
  return split.map((part, index) => {
    return split.slice(0, index).concat([part, '']).join(separator);
  }).filter(convention)[0];
};


/* A static file that shall be copied to public directory. */

class Asset {
  constructor(path, publicPath, assetsConvention) {
    const directory = getAssetDirectory(path, assetsConvention);
    const rel = sysPath.relative(directory, path);
    const destinationPath = sysPath.join(publicPath, rel);
    this.path = path;
    this.relativePath = rel;
    this.destinationPath = destinationPath;
    this.error = null;
    this.copyTime = null;
    debug(`Init ${path} %s`, prettify({
      directory, relativePath: rel, destinationPath
    }));
    Object.seal(this);
  }

  updateTime() {
    this.copyTime = Date.now();
  }

  /* Copy file to public directory. */
  copy() {
    const path = this.path;
    return common.copy(path, this.destinationPath).then(() => {
      debug(`Copied ${path}`);
      this.updateTime();
      this.error = null;
      return Promise.resolve();
    }, err => {
      debug(`Cannot copy ${path}: ${err}`);
      this.updateTime();
      const error = new Error(err);
      error.code = 'Copying';
      this.error = error;
      return Promise.reject(this.error);
    });
  }

  dispose() {
    // You're frozen when your heart's not open.
    Object.freeze(this);
  }
}

module.exports = Asset;
