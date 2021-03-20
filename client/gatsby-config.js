module.exports = {
  pathPrefix: `/chat`,
  siteMetadata: {
    title: `Chat`,
    description: ``,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-env-variables`,
      options: {
        allowlist: ["CMI5_ENDPOINT"],
        allowlist: ["CMI5_FETCH"],
        allowlist: ["MENTOR_API_URL"],
        allowlist: ["MENTOR_VIDEO_URL"],
      },
    },
    `gatsby-plugin-typescript`,
    {
      resolve: "gatsby-plugin-eslint",
      options: {
        test: /\.js$|\.jsx$|\.ts$|\.tsx$/,
        exclude: /(node_modules|.cache|public|static)/,
        stages: ["develop"],
        options: {
          emitWarning: true,
          failOnError: false,
        },
      },
    },
  ],
};
