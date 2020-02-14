const fs = require('fs');

const txt = fs.readFileSync('src/db/odeonmat.txt', 'utf8');

const split = txt.split('\n').filter(x => x.length > 0).reduce((a, b,i) => {
  if (i % 2 == 0) {
    let s = b.split("\t");
    a.push({
      id: s[0],
      material: s[1],
      coefficients: []
    });
  }
  else {
    a[a.length - 1].coefficients.push(...b.trim().split('\t'));
  }
  return a;
}, []) //?

fs.writeFileSync('src/db/odeon.json', JSON.stringify(split), 'utf8');