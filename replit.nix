{pkgs}: {
  deps = [
    pkgs.unzip
    pkgs.chromium
  ];

  env = { LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [pkgs.libuuid]; };
}