const esbuild = require("esbuild");
const http = require("http");

const proxyPort = 2222;

const esbuildServeConfig = {
  port: 2221,
};

const esbuildConfig = {
  entryPoints: ["plugins/RevealMarket.ts"],
  outdir: "plugins",
  bundle: true,
  format: "esm",
  target: ["es2020"],
};

async function start() {
  const { host, port } = await esbuild.serve(esbuildServeConfig, esbuildConfig);

  const proxyServer = http.createServer((req, res) => {
    const options = {
      hostname: host,
      port: port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    // Forward each incoming request to esbuild
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        ...proxyRes.headers,
        // Add CORS
        "access-control-allow-origin": "*",
      });
      proxyRes.pipe(res, { end: true });
    });

    // Forward the body of the request to esbuild
    req.pipe(proxyReq, { end: true });
  });

  proxyServer.listen(proxyPort, () => {
    console.log(`Local server started on http://127.0.0.1:${proxyPort}/`);
  });
}

start();
