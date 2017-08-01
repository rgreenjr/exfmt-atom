"use babel";

import * as path from "path";
import ExfmtAtom from "../lib/exfmt-atom";
import Helper from "../spec/helper";

const invalidFile = path.join(__dirname, "fixtures", "invalid.ex");
const validFile = path.join(__dirname, "fixtures", "valid.ex");

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe("ExfmtAtom", () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage("exfmt-atom");

    waitsForPromise(() =>
      atom.packages
        .activatePackage("language-elixir")
        .then(() => atom.workspace.open(validFile))
    );

    atom.packages.triggerDeferredActivationHooks();

    waitsForPromise(() => activationPromise);
  });

  it("should be in packages list", () => {
    expect(atom.packages.isPackageLoaded("exfmt-atom")).toBe(true);
  });

  it("should be an active package", () => {
    expect(atom.packages.isPackageActive("exfmt-atom")).toBe(true);
  });

  describe("shouldUseLocalExfmt", () => {
    it("returns true when exfmtDirectory is blank or '.'", () => {
      atom.config.set("exfmt-atom.exfmtDirectory", "");
      expect(ExfmtAtom.shouldUseLocalExfmt()).toBe(true);

      atom.config.set("exfmt-atom.exfmtDirectory", ".");
      expect(ExfmtAtom.shouldUseLocalExfmt()).toBe(true);
    });

    it("returns false when exfmtDirectory isn't blank or '.'", () => {
      atom.config.set("exfmt-atom.exfmtDirectory", "/tmp");
      expect(ExfmtAtom.shouldUseLocalExfmt()).toBe(false);
    });
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

  describe("formatTextEditor", () => {
    it("replaces all text with stdout when no text selection", () => {
      spyOn(ExfmtAtom, "spawnMixProcess").andReturn({
        status: 0,
        stdout: "stdout text",
        stderr: null
      });

      waitsForPromise(() =>
        atom.workspace
          .open(validFile)
          .then(editor => ExfmtAtom.formatTextEditor(editor))
          .then(() => {
            notifications = atom.notifications.getNotifications();
            expect(notifications.length).toBe(0);
            expect(atom.workspace.getActiveTextEditor().getText()).toEqual(
              "stdout text"
            );
          })
      );
    });

    it("replaces selected range with stdout when text is selected", () => {
      const initialText = "Row 1\nRow 2\nRow 3";
      const expectedText = "Row 1\nREPLACEMENT TEXT\nRow 3";
      const selectionRange = [[1, 0], [2, 0]];

      spyOn(ExfmtAtom, "spawnMixProcess").andReturn({
        status: 0,
        stdout: "REPLACEMENT TEXT\n",
        stderr: null
      });

      waitsForPromise(() => atom.workspace.open());
      editor = atom.workspace.getActiveTextEditor();
      editor.setText(initialText);
      editor.setSelectedBufferRange(selectionRange);
      ExfmtAtom.formatTextEditor(editor);
      notifications = atom.notifications.getNotifications();
      expect(notifications.length).toBe(0);
      expect(editor.getText()).toEqual(expectedText);
    });

    it("displays error notification when exit code isn't zero", () => {
      spyOn(ExfmtAtom, "spawnMixProcess").andReturn({
        status: 1,
        stdout: null,
        stderr: "stderr msg"
      });

      waitsForPromise(() => atom.workspace.open());
      ExfmtAtom.formatTextEditor(atom.workspace.getActiveTextEditor());
      Helper.verifyNotification("Exfmt-Atom Error", {
        type: "error",
        detail: "stderr msg"
      });
    });

    it("displays error notification when exception is thrown", () => {
      spyOn(ExfmtAtom, "spawnMixProcess").andThrow("exception msg");

      waitsForPromise(() => atom.workspace.open());
      ExfmtAtom.formatTextEditor(atom.workspace.getActiveTextEditor());

      Helper.verifyNotification("Exfmt-Atom Exception", {
        type: "error",
        detail: "exception msg"
      });
    });
  });

  describe("formatActiveTextEditor", () => {
    it("displays info notification when file grammar isn't Elixir", () => {
      const filePath = path.join(__dirname, "fixtures", "plain.txt");

      waitsForPromise(() =>
        atom.workspace
          .open(filePath)
          .then(editor => ExfmtAtom.formatActiveTextEditor())
          .then(() =>
            Helper.verifyNotification(
              "Exfmt-Atom only formats Elixir source code.",
              { type: "info" }
            )
          )
      );
    });
  });
});
