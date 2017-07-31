"use babel";

export default {
  formatOnSave: {
    title: "Format on Save",
    description: "Automatically format files on save.",
    type: "boolean",
    default: false,
    order: 1
  },
  showErrorNotifications: {
    title: "Show Error Notifications",
    description: "Show an error notification when formatting fails.",
    type: "boolean",
    default: true,
    order: 2
  },
  externalExfmtDirectory: {
    title: "Exfmt Directory",
    description:
      "By default, `exfmt-atom` requires the presence a local `mix.exs` file \
      with `exfmt` included as a dependency. To use an external `exfmt` \
      installation, specify the directory here.",
    type: "string",
    default: ".",
    order: 3
  }
};
