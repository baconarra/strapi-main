export default {
  routes: [
    {
      method: "POST",
      path: "/generate/company-content",
      handler: "generate.company-content",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/generate/company-data",
      handler: "generate.company-data",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/generate/test",
      handler: "generate.test",
      config: {
        policies: [],
      },
    },
  ],
};
