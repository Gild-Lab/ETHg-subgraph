let
   pkgs = import
    (builtins.fetchTarball {
      name = "nixos-unstable-2021-10-01";
      url = "https://github.com/nixos/nixpkgs/archive/d3d2c44a26b693293e8c79da0c3e3227fc212882.tar.gz";
      sha256 = "0vi4r7sxzfdaxzlhpmdkvkn3fjg533fcwsy3yrcj5fiyqip2p3kl";
    })
    { };

  compile = pkgs.writeShellScriptBin "compile" ''
    hardhat compile
  '';

  copy-abis = pkgs.writeShellScriptBin "copy-abis" ''
    cp -r artifacts/contracts/oracle/price/TwoPriceOracle.sol/TwoPriceOracle.json abis/
    cp -r artifacts/contracts/oracle/price/TwoPriceOracleFactory.sol/TwoPriceOracleFactory.json abis/
    cp -r artifacts/contracts/vault/priceOracle/ERC20PriceOracleVault.sol/ERC20PriceOracleVault.json abis/
    cp -r artifacts/contracts/vault/priceOracle/ERC20PriceOracleVaultFactory.sol/ERC20PriceOracleVaultFactory.json abis/
  '';

  init = pkgs.writeShellScriptBin "init" ''
    mkdir -p contracts && cp -r node_modules/@Gild-Lab/ethgild/contracts .
    compile
    copy-abis
  '';
in
pkgs.stdenv.mkDerivation {
 name = "shell";
 buildInputs = [
  pkgs.nixpkgs-fmt
  pkgs.nodejs-16_x
  pkgs.slither-analyzer
  compile
  copy-abis
  init
 ];

 shellHook = ''
  export PATH=$( npm bin ):$PATH
  # keep it fresh
  npm install
  init
 '';
}