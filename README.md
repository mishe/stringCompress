
# 字符串压缩加密

## stringCompress.js

### API

给字符串加密
compress(string)

解密字符串
deCompress(string)

很遗憾这个库不支持ascii以外的字符集。

## stringCompress2.js

支持ascii以外的字符集，但性能上不如上面的


## stringCode.js

优化了code的过程，去除压缩的步骤，编码效率大大提升，但生成后的字符串长度超过原字串。
并修复解码后的数据不正确的问题

## xorCrypt.js

加密和解密都是同一个函数，支持中文



