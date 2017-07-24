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

    // register for text editor events
    this.subscriptions.add(
      atom.workspace.observeTextEditors(e => this.handleEvents(e))
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  // handle text editor events
  handleEvents(editor) {
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
        "Elixir Formatter only formats Elixir source code.",
        { dismissable: false }
      );
    }
  },

  // formats the given text editor
  formatTextEditor(editor) {
    try {
      const { status, stdout, stderr } = this.spawnMixProcess(editor);

      switch (status) {
      case 0: {
        const cursorPosition = editor.getCursorScreenPosition();
        editor.buffer.setTextViaDiff(stdout.toString());
        editor.setCursorScreenPosition(cursorPosition);
        break;
      }
      default:
        this.showErrorNotifcation("Elixir Formatter Error", {
          detail: stderr
        });
      }
    } catch (exception) {
      this.showErrorNotifcation("Elixir Formatter Exception", {
        detail: exception
      });
    }
  },

  // spawns appropriate mix process
  spawnMixProcess(editor) {
    if (this.shouldUseLocalExfmt()) {
      return this.spawnLocalMixProcess(editor);
    } else {
      return this.spawnExternalMixProcess(editor);
    }
  },

  // spawn mix process using local exfmt installation
  spawnLocalMixProcess(editor) {
    return childProcess.spawnSync("mix", ["exfmt", "--stdin"], {
      cwd: this.projectPath(),
      input: editor.getText()
    });
  },

  // spawn mix process using user specified external exfmt installation
  spawnExternalMixProcess(editor) {
    return childProcess.spawnSync(
      "bin/exfmt.sh",
      [this.externalExfmtDirectory()],
      {
        cwd: this.packagePath(),
        input: editor.getText()
      }
    );
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
    return !this.externalExfmtDirectory();
  },

  // shows error notification
  showErrorNotifcation(message, options = {}) {
    if (atom.config.get("exfmt-atom.showErrorNotifications")) {
      atom.notifications.addError(message, options);
    }
  }
};
