const Jimp = require('jimp');
const path = require('path');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

Jimp.read(inputPath)
  .then(image => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If the pixel is very light (almost white)
      if (red > 230 && green > 230 && blue > 230) {
        this.bitmap.data[idx + 3] = 0; // Make transparent
      }
    });
    
    // Also crop the transparent edges to make it a tighter fit
    image.autocrop();
    // Resize to fit nicely as a 160px high image
    image.resize(Jimp.AUTO, 320); // 2x resolution for crisp display
    
    return image.writeAsync(outputPath);
  })
  .then(() => {
    console.log('Image processed successfully!');
  })
  .catch(err => {
    console.error(err);
  });
