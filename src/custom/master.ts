export const masterContents = {
  Page: {
    api: "api::page.page",
    populate: {
      blocks: {
        on: {
          "shared.media": {
            populate: "*",
          },
          "shared.slider": {
            populate: "*",
          },
          "shared.quote": {
            populate: "*",
          },
          "shared.rich-text": {
            populate: "*",
          },
        },
      },
    },
  },
  Navigation: {
    api: "api::navigation.navigation",
    populate: {
      footer: {
        on: {
          "navigation.nav-group": {
            populate: "items.media",
          },
          "navigation.nav-text": {
            populate: "*",
          },
        },
      },
      navbar: {
        on: {
          "navigation.nav-group": {
            populate: "items.media",
          },
          "navigation.nav-text": {
            populate: "*",
          },
        },
      },
    },
  },
  Global: {
    api: "api::global.global",
    populate: "*",
  },
};
