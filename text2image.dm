# 字符串转成成图片加密

## 演示：

### 加密
```javascript
var sss='{"c":1453183794701,"e":1453788594701}'
    var d1=new Date();
    for(var i=0;i<1000;i++)
        var  c1=compressor.compress(sss);
    console.log(new Date()-d1)
    console.log(c1)
```
### 解密
```javascript
    var d2=new Date();
    compressor.decompressImage(c1,function(data){
        console.log(new Date()-d2)
        console.log(JSON.parse(''+data))
    });
```
