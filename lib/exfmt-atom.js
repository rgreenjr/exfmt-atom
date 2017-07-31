"use babel";

import { CompositeDisposable } from "atom";
import childProcess from "child_process";
import config from "./settings";
import path from "path";

export default {
  config,
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    // register format command
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "exfmt-atom:format": () => this.formatActiveTextEditor()
      })
    );

    // register to receive text editor events
    this.subscriptions.add(
      atom.workspace.observeTextEditors(e => this.handleTextEvents(e))
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  // handle text editor events
  handleTextEvents(editor) {
    editor.getBuffer().onWillSave(() => {
      if (this.shouldFormatOnSave() && this.isElixirEditor(editor)) {
        this.formatTextEditor(editor);
      }
    });
  },

  // formats the active text editor
  formatActiveTextEditor() {
    const editor = atom.workspace.getActiveTextEditor();

    if (!editor) {
      return;
    }

    if (this.isElixirEditor(editor)) {
      this.formatTextEditor(editor);
    } else {
      atom.notifications.addInfo(
        "Exfmt-Atom only formats Elixir source code.",
        { dismissable: false }
      );
    }
  },

  // formats the given text editor
  formatTextEditor(editor) {
    try {
      const { text, range } = this.findTextSelectionAndRange(editor);
      const { status, stdout, stderr } = this.spawnMixProcess(text);

      switch (status) {
      case 0: {
        this.insertFormattedText(editor, range, stdout.toString());
        break;
      }
      default:
        this.showErrorNotifcation("Exfmt-Atom Error", { detail: stderr });
      }
    } catch (exception) {
      this.showErrorNotifcation("Exfmt-Atom Exception", { detail: exception });
    }
  },

  // returns current text selection and range (or entire text if none)
  findTextSelectionAndRange(editor) {
    if (this.hasSelectedText(editor)) {
      text = editor.getSelectedText();
      range = editor.getSelectedBufferRange();
    } else {
      text = editor.getText();
      range = null;
    }

    return { text: text, range: range };
  },

  // spawns appropriate mix process
  spawnMixProcess(text) {
    if (this.shouldUseLocalExfmt()) {
      return this.spawnLocalMixProcess(text);
    } else {
      return this.spawnExternalMixProcess(text);
    }
  },

  // spawn mix process using local exfmt installation
  spawnLocalMixProcess(text) {
    return childProcess.spawnSync("mix", ["exfmt", "--stdin"], {
      cwd: this.projectPath(),
      input: text
    });
  },

  // spawn mix process using user specified external exfmt installation
  spawnExternalMixProcess(text) {
    return childProcess.spawnSync(
      "bin/exfmt.sh",
      [this.externalExfmtDirectory()],
      {
        cwd: this.packagePath(),
        input: text
      }
    );
  },

  // inserts the given text and updates cursor position
  insertFormattedText(editor, range, text) {
    if (range) {
      editor.setTextInBufferRange(range, this.indentText(editor, range, text));
      editor.setCursorScreenPosition(range.start);
    } else {
      const cursorPosition = editor.getCursorScreenPosition();
      editor.setText(text);
      editor.setCursorScreenPosition(cursorPosition);
    }
  },

  // indents text using indentation level of first line of range
  indentText(editor, range, text) {
    const indentation = editor.indentationForBufferRow(range.start.row);

    if (editor.softTabs) {
      prefix = " ".repeat(indentation * editor.getTabLength());
    } else {
      prefix = "\t".repeat(indentation);
    }

    return prefix + text.replace(/\n/g, "\n" + prefix);
  },

  // returns true if editor has selected text
  hasSelectedText(editor) {
    return !!editor.getSelectedText();
  },

  // returns the external exfmt directory from settings (if any)
  externalExfmtDirectory() {
    return atom.config.get("exfmt-atom.externalExfmtDirectory");
  },

  // returns true if the editor has a known Elixir file extension
  isElixirEditor(editor) {
    return editor.getGrammar().scopeName === "source.elixir";
  },

  // returns path of exfmt-atom package
  packagePath() {
    return path.join(__dirname, "..");
  },

  // returns path of current atom project
  projectPath() {
    return atom.project.getPaths();
  },

  shouldFormatOnSave() {
    return atom.config.get("exfmt-atom.formatOnSave");
  },

  shouldUseLocalExfmt() {
    const directory = this.externalExfmtDirectory();
    return !directory || directory == ".";
  },

  // shows error notification
  showErrorNotifcation(message, options = {}) {
    options["dismissable"] = true;

    if (atom.config.get("exfmt-atom.showErrorNotifications")) {
      atom.notifications.addError(message, options);
    }
  }
};
