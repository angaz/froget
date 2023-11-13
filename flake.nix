{
  description = "Gets you frogs";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";

    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
    };
  };

  outputs = inputs@{
    self,
    nixpkgs,
    devshell,
    flake-parts,
    ...
  }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        devshell.flakeModule
        flake-parts.flakeModules.easyOverlay
      ];

      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      perSystem = { config, pkgs, system, ... }: {
        # Attrs for easyOverlay
        overlayAttrs = {
          inherit (config.packages)
            nodeCrawler
            nodeCrawlerFrontend;
        };

        devshells.default = {
          packages = with pkgs; [
            bun
            chromium
          ];
        };
      };
  };
}
