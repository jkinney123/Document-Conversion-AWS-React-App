"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canBeConvertedToPDF = canBeConvertedToPDF;
var _isVideo = _interopRequireDefault(require("is-video"));
var _isImage = _interopRequireDefault(require("is-image"));
var _isAudioFilepath = _interopRequireDefault(require("@shelf/is-audio-filepath"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const UNSUPPORTED_FILE_EXTENSIONS = ['.chm', '.heic', '.gdoc', '.gsheet', '.gslides', '.zip', '.dwg'];
function canBeConvertedToPDF(filename) {
  filename = filename.toLowerCase();
  const isFileExtensionUnsupported = UNSUPPORTED_FILE_EXTENSIONS.some(ext => filename.endsWith(ext));
  if (isFileExtensionUnsupported) {
    return false;
  }
  return !(0, _isImage.default)(filename) && !(0, _isVideo.default)(filename) && !(0, _isAudioFilepath.default)(filename);
}