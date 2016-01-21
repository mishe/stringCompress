(function(window) {

        var Compressor = function() {

        };

        Compressor.Color = function(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a || 255;
        };

        Compressor.Color.prototype.toPixelData = function() {
            return new Uint8ClampedArray([this.r, this.g, this.b, this.a]);
        };

        Compressor.Color.prototype.toString = function() {
            return [this.r, this.g, this.b].join(',');
        }

        Compressor.Compressed = function(colors) {
            this.colors = colors;
        }

        Compressor.Compressed.prototype.toString = function() {
            return this.colors.reduce(function(acc, current) {
                acc.push(current.toString());
                return acc;
            }, []).join(',');
        }

        Compressor.Compressed.prototype.getColorsColor = function() {
            var colors = this.colors.length;

            var rest = colors;
            var r = Math.floor(rest / 65025);
            rest = rest % 65025;

            var g = Math.floor(rest / 255);
            rest = rest % 255;

            var b = rest;

            return new Compressor.Color(r, g, b);
        };

        Compressor.Compressed.prototype.getColorsByColor = function(color) {
            return (color.r * 65025) + (color.g * 255) + color.b;
        }

        Compressor.Compressed.prototype.toImage = function() {

            var size = Math.ceil(Math.sqrt(this.colors.length + 1));

            var canvas = document.createElement('canvas');

            canvas.width = canvas.height = size;
            var context = canvas.getContext("2d");
            context.imageSmoothingEnabled = false;

            var headerPixel = this.toPixelData(context, this.getColorsColor());

            context.putImageData(headerPixel, 0, 0);
            var colors = this.colors.length + 1;

            for (var x = 1; x < colors; x++) {
                var location = {x: x % size, y: Math.floor(x / size) };

                var pixel = this.toPixelData(context, this.colors[x-1])

                context.putImageData(pixel, location.x, location.y);
            }

            return canvas.toDataURL("image/png", 1.0).substr(22);
//            return canvas.toDataURL("image/png", 1.0);
        }

        Compressor.Compressed.prototype.fromImage = function(image) {

            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            var size = image.width;

            canvas.width = canvas.height = size;

            context.drawImage(image, 0, 0, size, size);

            var headerData = context.getImageData(0, 0, 1, 1).data;
            var headerColor = new Compressor.Color(headerData[0], headerData[1], headerData[2]);

            var colors = this.getColorsByColor(headerColor) + 1;

            this.colors = [];

            for (var x=1; x < colors; x++) {
                var location = {x: x % size, y: Math.floor(x / size) };
                var data = context.getImageData(location.x, location.y, 1, 1).data;
                this.colors.push(new Compressor.Color(data[0], data[1], data[2]));
            }

            return this.colors;
        }

        Compressor.Compressed.prototype.toPixelData = function(context, color) {
            var colorData = color.toPixelData();
            var pixel = context.createImageData(1,1);
            for (var i = 0; i < 4; i++) {
                pixel.data[i] = colorData[i];
            }

            return pixel;
        }

        Compressor.prototype.compress = function(text) {

            var encoder = new TextEncoder();

            var encoded = encoder.encode(text);
            var length = encoded.length;

            var rest = 3 - (length % 3);

            var colors = [];

            var start = 0;
            while (start < length + 1) {
                var color = new Compressor.Color(
                                encoded[start++] || rest || 2,
                                encoded[start++] || rest || 2,
                                encoded[start++] || rest || 2
                );

                colors.push(color);
            }

            var compressTxt=new Compressor.Compressed(colors);

            return compressTxt.toImage()
        };

        Compressor.prototype.decompressImage = function(img, callback) {

            var image = new Image();

            image.onload = function() {
                var decoder = new Compressor.Compressed();
                var colors = decoder.fromImage(image);

                var encoded = colors.reduce(function(acc, item) {
                    acc.push(item.r);
                    acc.push(item.g);
                    acc.push(item.b);
                    return acc;
                }, []);

                var strip = encoded[encoded.length - 1];

                for (var x = 0; x < strip; x++) {
                    encoded.pop();
                }

                var decoder = new TextDecoder();
                callback(decoder.decode(new Uint8Array(encoded)));
            }

//            image.src = img.src;
            image.src = 'data:image/png;base64,'+img;

        }

        window.compressor = new Compressor();

    }(window, undefined));
