"use babel";

import * as path from "path";
import formatter from "../lib/formatter";
import helper from "./helper";
import main from "../lib/main";
import process from "child_process";

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
      spyOn(formatter, "runExfmt").andReturn({
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

    it("replaces selected text with stdout when text selection exists", () => {
      spyOn(formatter, "runExfmt").andReturn({
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
      spyOn(formatter, "runExfmt").andReturn({
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
      spyOn(formatter, "runExfmt").andThrow("exception msg");
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

  describe("prependDelimiter", () => {
    it("prepends delimiter to text", () => {
      expect(formatter.prependDelimiter("hello")).toEqual(
        formatter.getDelimiter() + "hello"
      );
    });
  });

  describe("stripDelimiter", () => {
    it("strips delimiter and anything preceeding it", () => {
      expect(
        formatter.stripDelimiter(formatter.getDelimiter() + "hello")
      ).toEqual("hello");

      expect(
        formatter.stripDelimiter(
          "no trailing newline" + formatter.getDelimiter() + "hello"
        )
      ).toEqual("hello");

      expect(
        formatter.stripDelimiter(
          "Compiling 5 files (.ex)\n" + formatter.getDelimiter() + "hello"
        )
      ).toEqual("hello");
    });
  });

  describe("runExfmt", () => {
    beforeEach(function() {
      spyOn(process, "spawnSync").andReturn({});
    });

    it("uses project path when exfmtDirectory setting undefined", () => {
      atom.config.set("exfmt-atom.exfmtDirectory", undefined);

      formatter.runExfmt("input text");
      expect(process.spawnSync).toHaveBeenCalledWith(
        "mix",
        ["exfmt", "--stdin"],
        {
          cwd: main.projectPath(),
          input: "input text"
        }
      );
    });

    it("uses exfmtDirectory setting when defined", () => {
      atom.config.set("exfmt-atom.exfmtDirectory", "/tmp");

      formatter.runExfmt("input text");
      expect(process.spawnSync).toHaveBeenCalledWith(
        "mix",
        ["exfmt", "--stdin"],
        {
          cwd: "/tmp",
          input: "input text"
        }
      );
    });
  });
});
