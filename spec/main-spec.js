"use babel";

import * as path from "path";

const validFile = path.join(__dirname, "fixtures", "valid.ex");

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe("Main", () => {
  let activationPromise;

  beforeEach(() => {
    activationPromise = atom.packages.activatePackage("exfmt-atom");

    waitsForPromise(() =>
      atom.packages
        .activatePackage("language-elixir")
        .then(() => atom.workspace.open(validFile))
    );
  });

  it("should be in packages list", () => {
    expect(atom.packages.isPackageLoaded("exfmt-atom")).toBe(true);
  });

  it("should be an active package", () => {
    expect(atom.packages.isPackageActive("exfmt-atom")).toBe(true);
  });

  describe("package settings", () => {
    it("should default formatOnSave to false", () => {
      expect(atom.config.get("exfmt-atom.formatOnSave")).toBe(false);
    });

    it("should default showErrorNotifications to false", () => {
      expect(atom.config.get("exfmt-atom.showErrorNotifications")).toBe(true);
    });

    it("should default exfmtDirectory to current directory", () => {
      expect(atom.config.get("exfmt-atom.exfmtDirectory")).toEqual(".");
    });
  });
});
