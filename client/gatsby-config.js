module.exports = {
  pathPrefix: `/chat`,
  siteMetadata: {
    title: `Chat`,
    description: ``,
  },
  plugins: [
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-env-variables`,
      options: {
        whitelist: ["CMI5_ENDPOINT"],
        whitelist: ["CMI5_FETCH"],
        whitelist: ["MENTOR_API_URL"],
        whitelist: ["MENTOR_VIDEO_URL"],
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
