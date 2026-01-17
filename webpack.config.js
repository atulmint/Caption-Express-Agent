const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Base configuration shared between UI and sandbox
const baseConfig = {
  mode: process.env.NODE_ENV || "development",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { modules: false }],
              ["@babel/preset-react", { runtime: "automatic" }],
              "@babel/preset-typescript"
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"]
  }
};

// Sandbox Configuration (document sandbox, different runtime) - build first
const sandboxConfig = {
  ...baseConfig,
  name: "sandbox",
  entry: {
    code: "./src/sandbox/code.ts"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true // This runs first and cleans
  },
  externals: {
    "add-on-sdk-document-sandbox": "add-on-sdk-document-sandbox",
    "express-document-sdk": "express-document-sdk"
  }
};

// UI Configuration (iframe-based, uses ES modules) - build second
const uiConfig = {
  ...baseConfig,
  name: "ui",
  dependencies: ["sandbox"], // Ensures sandbox builds first
  entry: {
    index: "./src/ui/index.tsx"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: false // Don't clean, preserve sandbox output
  },
  experiments: {
    outputModule: true
  },
  externalsType: "module",
  externals: {
    "https://express.adobe.com/static/add-on-sdk/sdk.js": "https://express.adobe.com/static/add-on-sdk/sdk.js"
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      chunks: ["index"],
      scriptLoading: "module"
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "manifest.json", to: "manifest.json" },
        { from: "src/assets", to: "assets", noErrorOnMissing: true }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist")
    },
    port: 5241,
    hot: true,
    https: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
};

// Export sandbox first, then UI with dependency
module.exports = [sandboxConfig, uiConfig];
