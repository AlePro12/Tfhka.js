function to_buffstr(strBuffer) {
  var str = strBuffer.toString("utf-8");
  var terminatingNullPos = str.indexOf("\u0000");
  if (terminatingNullPos >= 0) {
    str = str.substr(0, terminatingNullPos);
  }
  return str;
}
module.exports = to_buffstr;