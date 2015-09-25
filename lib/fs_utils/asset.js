// Generated by CoffeeScript 1.10.0
'use strict';
var Asset, common, debug, getAssetDirectory, isWindows, separator, sysPath;

debug = require('debug')('brunch:asset');

sysPath = require('path');

common = require('./common');

isWindows = require('../helpers').isWindows;


/* Directory separator. */

separator = sysPath.sep || (isWindows ? '\\' : '/');


/* Get first parent directory that matches asset convention.
 *
 * Example:
 *   getAssetDirectory 'app/assets/thing/thing2.html', /assets/
 *   # app/assets/
 *
 * Returns String.
 */

getAssetDirectory = function(path, convention) {
  var split;
  split = path.split(separator);

  /* Creates thing like this
   * 'app/', 'app/assets/', 'app/assets/thing/', 'app/assets/thing/thing2.html/'
   */
  return split.map(function(part, index) {
    return split.slice(0, index).concat([part, '']).join(separator);
  }).filter(convention)[0];
};


/* A static file that shall be copied to public directory. */

module.exports = Asset = (function() {
  function Asset(path, publicPath, assetsConvention) {
    var directory;
    directory = getAssetDirectory(path, assetsConvention);
    this.path = path;
    this.relativePath = sysPath.relative(directory, path);
    this.destinationPath = sysPath.join(publicPath, this.relativePath);
    debug("Initializing fs_utils.Asset %s", JSON.stringify({
      path: path,
      directory: directory,
      relativePath: this.relativePath,
      destinationPath: this.destinationPath
    }));
    this.error = null;
    this.copyTime = null;
    Object.seal(this);
  }


  /* Copy file to public directory. */

  Asset.prototype.copy = function(callback) {
    var _this;
    _this = this;
    common.copy(this.path, this.destinationPath, function(error) {
      var err;
      if (error != null) {
        err = new Error(error);
        err.code = 'Copying';
        _this.error = err;
      } else {
        _this.error = null;
      }
      _this.copyTime = Date.now();
      return callback(_this.error);
    });
  };

  return Asset;

})();