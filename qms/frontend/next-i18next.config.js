module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de", "it", "pt", "ru"],
  },
  // An explicit separator stops i18next from treating keys that contain "?"
  // (such as "rescueForm:timer?") as natural-language keys without a namespace.
  nsSeparator: ":",
};
