"use babel";

import gateway from "./gateway";
import main from "./main";

export default {
  // formats the active text editor
  formatActiveTextEditor() {
    if ((editor = atom.workspace.getActiveTextEditor())) {
      if (main.hasElixirGrammar(editor)) {
        this.formatTextEditor(editor);
      } else {
        atom.notifications.addInfo(
          "Exfmt-Atom only formats Elixir source code",
          { dismissable: false }
        );
      }
    }
  },

  // formats the given text editor
  formatTextEditor(editor) {
    try {
      const { text, range } = this.currentTextSelection(editor);
      const { status, stdout, stderr } = gateway.runExfmt(text);

      switch (status) {
      case 0: {
        this.insertText(editor, range, stdout.toString());
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
  currentTextSelection(editor) {
    if (this.hasSelectedText(editor)) {
      text = editor.getSelectedText();
      range = editor.getSelectedBufferRange();
    } else {
      text = editor.getText();
      range = null;
    }

    return { text: text, range: range };
  },

  // inserts the given text and updates cursor position
  insertText(editor, range, text) {
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
  exfmtDirectory() {
    return atom.config.get("exfmt-atom.exfmtDirectory");
  },

  // shows error notification
  showErrorNotifcation(message, options = {}) {
    options["dismissable"] = true;

    if (atom.config.get("exfmt-atom.showErrorNotifications")) {
      atom.notifications.addError(message, options);
    }
  }
};
