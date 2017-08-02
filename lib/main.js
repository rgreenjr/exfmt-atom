"use babel";

import { CompositeDisposable } from "atom";
import config from "./settings";
import formatter from "./formatter";

export default {
  config,
  subscriptions: null,

  // registers commands and event hooks
  activate(state) {
    this.subscriptions = new CompositeDisposable();

    // register format command
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "exfmt-atom:format": () => formatter.formatActiveTextEditor()
      })
    );

    // register to receive text editor events
    this.subscriptions.add(
      atom.workspace.observeTextEditors(e => this.handleTextEvents(e))
    );
  },

  // deregisters commands and event hooks
  deactivate() {
    this.subscriptions.dispose();
  },

  // handle text editor events
  handleTextEvents(editor) {
    editor.getBuffer().onWillSave(() => {
      if (this.shouldFormatOnSave() && this.hasElixirGrammar(editor)) {
        formatter.formatTextEditor(editor);
      }
    });
  },

  // returns true if editor grammar is elixir
  hasElixirGrammar(editor) {
    return editor.getGrammar().scopeName === "source.elixir";
  },

  // returns true if formatOnSave setting is enabled
  shouldFormatOnSave() {
    return atom.config.get("exfmt-atom.formatOnSave");
  }
};
