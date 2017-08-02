"use babel";

import gateway from "../lib/gateway";

describe("Gateway", () => {
  describe("packagePath", () => {
    it("returns path of package installation", () => {
      expect(gateway.packagePath()).toContain("exfmt-atom");
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
