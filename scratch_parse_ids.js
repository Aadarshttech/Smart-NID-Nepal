const fs = require('fs');
let data = fs.readFileSync('d:\\Projects\\Projects\\nid auto\\docs\\New Text Document.txt');
if (data[0] === 255 && data[1] === 254) {
  data = data.toString('utf16le');
} else {
  data = data.toString('utf8');
}
const regex = /<(?:input|select|textarea)[^>]*id=['"]([^'"]+)['"]/gi;
let match;
const ids = [];
while ((match = regex.exec(data)) !== null) {
  ids.push(match[1]);
}
console.log(ids.join(', '));
