function xorCrypt (str, key) {
    var output = ''

    if (!key) {
      key = 6
    }

    for (var i = 0; i < str.length; ++i) {
      output += String.fromCharCode(key ^ str.charCodeAt(i))
    }

    return output
  }
