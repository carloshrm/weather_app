const path = require("path");
module.exports = {
  entry: "./src/index.js",
  watch: true,
  watchOptions: {
    poll: 1000,
    ignored: "**/node_modules",
  },
  mode: "development",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
};
