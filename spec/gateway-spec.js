"use babel";

import gateway from "../lib/gateway";
import path from "path";
import process from "child_process";

describe("Gateway", () => {
  describe("packagePath", () => {
    it("returns path of package installation", () => {
      expect(gateway.packagePath()).toContain("exfmt-atom");
    });
  });

  describe("runExfmt", () => {
    beforeEach(function() {
      spyOn(process, "spawnSync").andReturn({});
    });

    it("invokes runLocalExfmt when exfmtDirectory is undefined", () => {
      atom.config.set("exfmt-atom.exfmtDirectory", undefined);
      gateway.runExfmt("input text");
      expect(process.spawnSync).toHaveBeenCalledWith(
        "mix",
        ["exfmt", "--stdin"],
        {
          cwd: [atom.project.getPaths()[0]],
          input: "input text"
        }
      );
    });

    it("invokes runExternalExfmt when exfmtDirectory is set", () => {
      atom.config.set("exfmt-atom.exfmtDirectory", "/tmp");
      gateway.runExfmt("input text");
      expect(process.spawnSync).toHaveBeenCalledWith("bin/exfmt.sh", ["/tmp"], {
        cwd: path.join(__dirname, ".."),
        input: "input text"
      });
    });
  });

  describe("exfmtDirectory", () => {
    it("defaults to current directory when undefined", () => {
      atom.config.set("exfmt-atom.exfmtDirectory", undefined);
      expect(gateway.exfmtDirectory()).toEqual(".");
    });
  });

  describe("shouldUseLocalExfmt", () => {
    it("returns true when exfmtDirectory is blank or '.'", () => {
      atom.config.set("exfmt-atom.exfmtDirectory", "");
      expect(gateway.shouldUseLocalExfmt()).toBe(true);

      atom.config.set("exfmt-atom.exfmtDirectory", ".");
      expect(gateway.shouldUseLocalExfmt()).toBe(true);
    });

    it("returns false when exfmtDirectory isn't blank or '.'", () => {
      atom.config.set("exfmt-atom.exfmtDirectory", "/tmp");
      expect(gateway.shouldUseLocalExfmt()).toBe(false);
    });
  });
});
