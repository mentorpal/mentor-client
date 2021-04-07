module.exports = {
  pathPrefix: `/chat`,
  siteMetadata: {
    title: `Chat`,
    description: ``,
    author: `@gatsbyjs`,
    siteUrl: `https:uscquestions.mentorpal.org/chat`,
  },
  plugins: [
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-sharp`,
    `gatsby-transformer-csv`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sharp`,
    {
      resolve: "gatsby-plugin-htaccess",
      options: {
        RewriteBase: "/chat/",
        https: true,
        SymLinksIfOwnerMatch: true,
        host: "uscquestions.mentorpal.org",
        redirect: [
          "RewriteRule ^not-existing-url/?$ /existing-url [R=301,L,NE]",
          {
            from: "http:uscquestions.mentorpal.org/chat",
            to: "https:uscquestions.mentorpal.org/chat",
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/static/favicon.png`,
      },
    },
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
