// TypeScript sucks
exports.start = async function (options) {
  const devServer = await import("@projectsophon/df-plugin-dev-server");
  await devServer.start(options);
};
