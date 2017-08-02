"use babel";

import * as path from "path";
import formatter from "../lib/formatter";
import gateway from "../lib/gateway";
import helper from "./helper";

const validFile = path.join(__dirname, "fixtures", "valid.ex");

describe("Formatter", () => {
  let activationPromise;

  beforeEach(() => {
    activationPromise = atom.packages.activatePackage("exfmt-atom");
    waitsForPromise(() =>
      atom.packages
        .activatePackage("language-elixir")
        .then(() => atom.workspace.open(validFile))
    );
    atom.packages.triggerDeferredActivationHooks();
  });

  describe("formatTextEditor", () => {
    it("replaces all text with stdout when text selection is empty", () => {
      spyOn(gateway, "runExfmt").andReturn({
        status: 0,
        stdout: "replacement text",
        stderr: null
      });

      const editor = atom.workspace.getActiveTextEditor();
      editor.setText("initial text");
      formatter.formatTextEditor(editor);
      expect(editor.getText()).toEqual("replacement text");
      expect(atom.notifications.getNotifications().length).toBe(0);
    });

    it("replaces selected text range with stdout", () => {
      spyOn(gateway, "runExfmt").andReturn({
        status: 0,
        stdout: "REPLACEMENT\n",
        stderr: null
      });

      const editor = atom.workspace.getActiveTextEditor();
      editor.setText("Row1\nRow2\nRow3");
      editor.setSelectedBufferRange([[1, 0], [2, 0]]); // select 2nd row
      formatter.formatTextEditor(editor);
      expect(editor.getText()).toEqual("Row1\nREPLACEMENT\nRow3");
      expect(atom.notifications.getNotifications().length).toBe(0);
    });

    it("displays error notification when status is nonzero", () => {
      spyOn(gateway, "runExfmt").andReturn({
        status: 1,
        stdout: null,
        stderr: "stderr msg"
      });

      formatter.formatTextEditor(atom.workspace.getActiveTextEditor());
      helper.verifyNotification("Exfmt-Atom Error", {
        type: "error",
        detail: "stderr msg"
      });
    });

    it("displays error notification when exception is thrown", () => {
      spyOn(gateway, "runExfmt").andThrow("exception msg");
      formatter.formatTextEditor(atom.workspace.getActiveTextEditor());
      helper.verifyNotification("Exfmt-Atom Exception", {
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
          .then(editor => formatter.formatActiveTextEditor())
          .then(() =>
            helper.verifyNotification(
              "Exfmt-Atom only formats Elixir source code",
              { type: "info" }
            )
          )
      );
    });
  });
});
