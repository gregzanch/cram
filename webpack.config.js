const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const isEnvProduction = process.env.NODE_ENV === "production";

process.env.NODE_ENV = "development";


module.exports = {
  mode: process.env.NODE_ENV,
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx"]
  },
  devServer: {
    port: 8080,
    // host: '0.0.0.0',
    contentBase: path.join(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        loader: require.resolve("babel-loader"),
        options: {
          customize: require.resolve(
            "babel-preset-react-app/webpack-overrides"
          ),

          plugins: [
            [
              require.resolve("babel-plugin-named-asset-import"),
              {
                loaderMap: {
                  svg: {
                    ReactComponent: "@svgr/webpack?-prettier,-svgo![path]"
                  }
                }
              }
            ],
            [require.resolve("@babel/plugin-proposal-optional-chaining")]
          ],
          cacheDirectory: true,
          cacheCompression: isEnvProduction,
          compact: isEnvProduction
        }
      },

      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"]
      },
      {
        test: /\.(stl|obj|mtl)$/,
        use: ["raw-loader"]
      },
      {
        // Load all icons
        test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/,
        use: [
          {
            loader: "file-loader"
          }
        ]
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ["raw-loader", "glslify-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    })
  ]
};
            