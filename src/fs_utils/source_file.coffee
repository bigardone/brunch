fs = require 'fs'
sysPath = require 'path'
logger = require '../logger'

# A file that will be compiled by brunch.
module.exports = class SourceFile
  constructor: (@path, @compiler, @isHelper = no, @isVendor = no) ->
    logger.debug "Initializing fs_utils.SourceFile:", {
      @path, @isHelper, @isVendor
    }
    @type = @compiler.type
    @cache = Object.seal({data: '', dependencies: []})
    @compilerName = @compiler.constructor.name
    if isHelper
      fileName = "brunch_#{@compilerName}_#{sysPath.basename @path}"
      @realPath = @path
      @path = sysPath.join 'vendor', 'scripts', fileName
    Object.freeze(this)

  # Defines a requirejs module in scripts & templates.
  # This allows brunch users to use `require 'module/name'` in browsers.
  # 
  # path - path to file, contents of which will be wrapped.
  # source - file contents.
  # 
  # Returns a wrapped string.
  _wrap: (data) ->
    if not @isHelper and not @isVendor and @type in ['javascript', 'template']
      moduleName = JSON.stringify(
        @path
          .replace(new RegExp('\\\\', 'g'), '/')
          .replace(/^app\//, '')
          .replace(/\.\w*$/, '')
      )
      """
      (this.require.define({
        #{moduleName}: function(exports, require, module) {
          #{data}
        }
      }));\n
      """
    else
      data

  # Reads file and compiles it with compiler. Data is cached to `this.data`
  # in order to do compilation only if the file was changed.
  compile: (callback) ->
    realPath = if @isHelper then @realPath else @path
    fs.readFile realPath, (error, buffer) =>
      return callback "Read error: #{error}" if error?
      fileContent = buffer.toString()
      getDeps = @compiler.getDependencies or (data, path, callback) ->
        callback null, []
      @compiler.compile fileContent, @path, (error, result) =>
        return callback "Compile error: #{error}" if error?
        getDeps fileContent, @path, (error, dependencies) =>
          return callback "GetDeps error: #{error}" if error?
          @cache.dependencies = dependencies
          @cache.data = @_wrap result if result?
          callback error, @data
