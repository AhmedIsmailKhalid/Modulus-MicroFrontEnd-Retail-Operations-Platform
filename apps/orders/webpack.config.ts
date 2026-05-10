import path from "path";
import { Configuration as WebpackConfig } from "webpack";
import { Configuration as DevServerConfig } from "webpack-dev-server";
import { ModuleFederationPlugin } from "@module-federation/enhanced/webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

type Configuration = WebpackConfig & { devServer?: DevServerConfig };

const isDev = process.env["NODE_ENV"] !== "production";

const config: Configuration = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    publicPath: "auto",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@modulus/auth":  path.resolve(__dirname, "../../packages/auth/src/index.ts"),
      "@modulus/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
      "@modulus/ui":    path.resolve(__dirname, "../../packages/ui/src/index.ts"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: { noEmit: false, allowImportingTsExtensions: false },
              transpileOnly: false,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
        ],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "orders",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App",
      },
      shared: {
        react:       { singleton: true, requiredVersion: "^18.3.1", eager: true },
        "react-dom": { singleton: true, requiredVersion: "^18.3.1", eager: true },
      },
      dts: false,
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public/mockServiceWorker.js", to: "mockServiceWorker.js" },
      ],
    }),
    ...(isDev ? [] : [new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" })]),
  ],
  devServer: {
    port: 3002,
    historyApiFallback: true,
    hot: true,
    headers: { "Access-Control-Allow-Origin": "*" },
  },
};

export default config;