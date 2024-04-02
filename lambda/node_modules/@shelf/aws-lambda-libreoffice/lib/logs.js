"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConvertedFilePath = getConvertedFilePath;
function getConvertedFilePath(logs) {
  try {
    return logs.match(/\/tmp\/.+->\s(\/tmp\/.+) using/)[1];
  } catch (e) {
    const ErrorWithExtendedMessage = new Error(e);
    ErrorWithExtendedMessage.message += `;\tTried to parse string: "${logs}"`;
    throw ErrorWithExtendedMessage;
  }
}