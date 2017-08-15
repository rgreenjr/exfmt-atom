"use babel";

import path from "path";
import process from "child_process";

export default {
  // run appropriate mix process
  runExfmt(text) {
    if (this.shouldUseLocalExfmt()) {
      return this.runLocalExfmt(text);
    } else {
      return this.runExternalExfmt(text);
    }
  },

  // run mix process using local exfmt installation
  runLocalExfmt(text) {
    return process.spawnSync("mix", ["exfmt", "--stdin"], {
      cwd: this.projectPath(),
      input: text
    });
  },

  // run mix process using user specified external exfmt installation
  runExternalExfmt(text) {
    return process.spawnSync("bin/exfmt.sh", [this.exfmtDirectory()], {
      cwd: this.packagePath(),
      input: text
    });
  },

  // returns exfmtDirectory setting
  exfmtDirectory() {
    return atom.config.get("exfmt-atom.exfmtDirectory") || ".";
  },

  // returns path of exfmt-atom package
  packagePath() {
    return path.join(__dirname, "..");
  },

  // returns path of current atom project
  projectPath() {
    return atom.project.getPaths();
  },

  // returns true if local directory should be used to run exfmt
  shouldUseLocalExfmt() {
    return this.exfmtDirectory() == ".";
  }
};
