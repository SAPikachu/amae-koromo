const fs = require("fs");
const pathToEntry = "./build/index.html";
const pathToHeaders = "./build/_headers";
const bundlesRegExp = /\/static\/\w+\/\w+\.[a-f0-9]+\.chunk\.(?:css|js)/g;

const builtHTMLContent = fs.readFileSync(pathToEntry).toString();
const links = builtHTMLContent.match(bundlesRegExp);

let preloadLines = [];

links.forEach(link => {
  let fileType = "script";

  if (/\.css$/.test(link)) {
    fileType = "style";
  }
  preloadLines.push(`Link: <${link}>; rel=preload; as=${fileType}`);
});

const mediaFiles = fs.readdirSync("build/static/media/");
for (const file of mediaFiles) {
  if (file.includes(".preload.")) {
    preloadLines.push(`Link: </static/media/${file}>; rel=preload; as=image`);
  }
}

const headerTemplate = `
/static/*
  Cache-Control: public, immutable, max-age=604800, s-maxage=604800
/favicon2/*
  Cache-Control: public, immutable, max-age=604800, s-maxage=604800
`;

const paths = ["/", "/:a", "/:a/:b"];
const cacheHeader = "Cache-Control: public, max-age=0";

fs.writeFileSync(
  pathToHeaders,
  headerTemplate +
    paths
      .map(
        path => `
${path}
  ${cacheHeader}
  ${preloadLines.join("\n  ")}
`
      )
      .join("")
);
