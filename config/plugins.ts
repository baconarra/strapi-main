module.exports = ({ env }) => ({
  email: {
    config: {
      "netlify-deployments": {
        enabled: true,
        config: {
          accessToken: env("NETLIFY_ACCESS_TOKEN"),
          sites: [
            {
              name: 'My Site',
              id: env("NETLIFY_SITE_ID"),
              buildHook: `https://api.netlify.com/build_hooks/${env("NETLIFY_BUILD_HOOK_ID")}`,
              branch: 'main' // optional
            }
          ]
        },
      },  
      // provider: "nodemailer",
      // providerOptions: {
      //   host: env("SMTP_HOST", "smtp.example.com"),
      //   port: env.int("SMTP_PORT", 587),
      //   auth: {
      //     user: env("SMTP_USERNAME", "your-email@example.com"),
      //     pass: env("SMTP_PASSWORD", "your-email-password"),
      //   },
      //   secure: false,
      // },
      settings: {
        defaultFrom: "your-email@example.com",
        defaultReplyTo: "your-email@example.com",
      },
    },
  },
});
