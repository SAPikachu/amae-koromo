const fs = require('fs');
const pathToEntry = './build/index.html';
const pathToHeaders = './build/_headers';
const bundlesRegExp = /\/static\/\w+\/\w+\.[a-f0-9]+\.chunk\.(?:css|js)/g;

const builtHTMLContent = fs.readFileSync(pathToEntry).toString();
const links = builtHTMLContent.match(bundlesRegExp);

let preloadLines = [];

links.forEach(link => {
  let fileType = 'script';

  if (/\.css$/.test(link)) {
    fileType = 'stylesheet';
  }
  preloadLines.push(`  Link: ${link}; rel=preload; as=${fileType}`);
});

const headerTemplate = `
/static/*
  Cache-Control: max-age=86400

/*
`;

fs.writeFileSync(pathToHeaders, headerTemplate + preloadLines.join("\n") + "\n");
