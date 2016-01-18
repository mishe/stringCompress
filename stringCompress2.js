(function(root){

            var hashTable=[];

            function search(keyword){
                var len=hashTable.length;
                if(len>0){
                    for (var i = 0; i < len; i++) {
                        if (hashTable[i].key == keyword) return hashTable[i].code;
                    }
                }
            }

            function insert (e) {
                hashTable[hashTable.length] = e
            }

            function initTable(){
                hashTable=[];
                for (var i = 0; i < 128; i++) {
                    insert({
                        key: i,
                        code: i
                    });
                }
            }

            function toUnicode(str){
                if(!str) return '';
                return str.toString().replace(/[^\x00-\xff]/g,function(s){
                    return '\\u'+s.charCodeAt(0).toString(16);
                });
            }

            function unicode2Char(str){
                if(!str) return '';
                return str.replace(/\\u(\w{1,4})/g,function(a,s){
                    return String.fromCharCode(parseInt(s,16));
                });
            }

            root.compress=function(strNormalString) {
                var strCompressedString = "",
                    used = 128,
                    intLeftOver = 0,
                    intOutputCode = 0,
                    pcode = 0,
                    ccode = 0,
                    k = 0,
                    intSearch,
                    strNormalString=toUnicode(strNormalString),
                    len = strNormalString.length,
                    getCode=String.fromCharCode;

                initTable();

                for (var i = 0; i < len; i++) {
                    ccode = strNormalString.charCodeAt(i);
                    k = (pcode << 8) | ccode;
                    intSearch = search(k);
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
                            insert({
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


                for (i = 0; i < len; i++) {
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
                return unicode2Char(strNormalString);
            }
        }(this));
