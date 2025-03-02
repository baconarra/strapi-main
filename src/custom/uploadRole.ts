export const defaultUploadPermission = (function () {
  return [
    {
      action: "plugin::upload.read",
      subject: null,
      conditions: ["admin::is-creator"],
      properties: {},
    },
    {
      action: "plugin::upload.assets.create",
      subject: null,
      conditions: ["admin::is-creator"],
      properties: {},
    },
    {
      action: "plugin::upload.assets.update",
      subject: null,
      conditions: ["admin::is-creator"],
      properties: {},
    },
    {
      action: "plugin::upload.assets.download",
      subject: null,
      conditions: ["admin::is-creator"],
      properties: {},
    },
    {
      action: "plugin::upload.assets.copy-link",
      subject: null,
      conditions: ["admin::is-creator"],
      properties: {},
    },
  ];
})();
