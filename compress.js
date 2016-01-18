(function(root){
            function HashTable() {
                this.Search = function (keyword) {
                    var arr = this.ht;
                    if (typeof (arr) != "undefined") {
                        for (var i = 0; i < arr.length; i++) {
                            if (arr[i].key == keyword) return arr[i].code;
                        }
                    }
                    return null;
                }

                this.Insert = function (e) {
                    var arr = this.ht;
                    if (typeof (arr) == "undefined") {
                        arr = [];
                        arr[0] = e;
                        this.ht = arr;
                    }
                    else {
                        arr[arr.length] = e;
                    }
                }
            }
            root.compress=function(strNormalString) {
                var strCompressedString = "",
                    ht = new HashTable,
                    used = 128,
                    intLeftOver = 0,
                    intOutputCode = 0,
                    pcode = 0,
                    ccode = 0,
                    k = 0,
                    intSearch,
                    len = strNormalString.length,
                    getCode=String.fromCharCode;

                for (var i = 0; i < used; i++) {
                    ht.Insert({
                        key: i,
                        code: i
                    });
                }

                for (i = 0; i < len; i++) {
                    ccode = strNormalString.charCodeAt(i);
                    k = (pcode << 8) | ccode;
                    intSearch = ht.Search(k);
                    if (intSearch != null) {
                        pcode = intSearch;
                    } else {
                        intLeftOver += 12;
                        intOutputCode <<= 12;
                        intOutputCode |= pcode;
                        pcode = ccode;
                        if (intLeftOver >= 16) {
                            strCompressedString += getCode(intOutputCode >> (intLeftOver - 16));
                            intOutputCode &= (Math.pow(2, (intLeftOver - 16)) - 1);
                            intLeftOver -= 16;
                        }
                        if (used < 4096) {
                            used++;
                            ht.Insert({
                                key: k,
                                code: used - 1
                            });
                        }
                    }
                }

                if (pcode != 0) {
                    intLeftOver += 12;
                    intOutputCode <<= 12;
                    intOutputCode |= pcode;
                }

                if (intLeftOver >= 16) {
                    strCompressedString += getCode(intOutputCode >> (intLeftOver - 16));
                    intOutputCode &= (Math.pow(2, (intLeftOver - 16)) - 1);
                    intLeftOver -= 16;
                }

                if (intLeftOver > 0) {
                    intOutputCode <<= (16 - intLeftOver);
                    strCompressedString += getCode(intOutputCode);
                }

                return strCompressedString;
            };
            root.deCompress=function(strCompressedString){
                var strNormalString = "",
                    ht = [],
                    used = 128,
                    intLeftOver = 0,
                    intOutputCode = 0,
                    ccode = 0,
                    pcode = 0,
                    key = 0,
                    len = strCompressedString.length,
                    getCode=String.fromCharCode;

                for (var i = 0; i < used; i++) {
                    ht[i] = getCode(i);
                }


                for (var i = 0; i < len; i++) {
                    intLeftOver += 16;
                    intOutputCode <<= 16;
                    intOutputCode |= strCompressedString.charCodeAt(i);

                    while (1) {
                        if (intLeftOver >= 12) {
                            ccode = intOutputCode >> (intLeftOver - 12);
                            if (typeof (key = ht[ccode]) != "undefined") {
                                strNormalString += key;
                                if (used > 128) {
                                    ht[ht.length] = ht[pcode] + key.substr(0, 1);
                                }
                                pcode = ccode;
                            }else {
                                key = ht[pcode] + ht[pcode].substr(0, 1);
                                strNormalString += key;
                                ht[ht.length] = ht[pcode] + key.substr(0, 1);
                                pcode = ht.length - 1;
                            }
                            used++;
                            intLeftOver -= 12;
                            intOutputCode &= (Math.pow(2, intLeftOver) - 1);
                        }else {
                            break;
                        }
                    }
                }
                return strNormalString.substr(1,strNormalString.length-2);
            }
        }(this))
