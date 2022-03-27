let
  pkgs = import
    (builtins.fetchTarball {
      name = "nixos-unstable-2021-10-01";
      url = "https://github.com/nixos/nixpkgs/archive/fa5e153653a1b48e4a21a14b341e2e01835ba8b5.tar.gz";
      sha256 = "1yvqxrw0ila4y6mryhpf32c8ydljfmfbvijxra2dawvhcfbbm2rw";
    })
    { };
in
pkgs.stdenv.mkDerivation {
 name = "shell";
 buildInputs = [
  pkgs.nodejs-14_x
 ];

 shellHook = ''
  source .env
  export PATH=$( npm bin ):$PATH
  # keep it fresh
  npm install
 '';
}