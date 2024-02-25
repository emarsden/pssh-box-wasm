# For use with the just command runner, https://just.systems/

default:
    @just --list

build:
    wasm-pack build --release --target web

wasm:
    cargo build --target wasm32-unknown-unknown

serve:
    #!/usr/bin/env bash
    DIST=`mktemp -d /tmp/pssh-box-wasmXXXXX`
    (cd www-zola && zola build --output-dir $DIST --force)
    wasm-pack build --release --target web
    cp -r pkg $DIST
    echo serving from $DIST
    (cd $DIST && python3 -m http.server)


# for use with twiggy ("cargo install twiggy")
# Need a non-release build for symbols
twiggy:
   wasm-pack build --dev --target web
   twiggy top pkg/pssh_box_wasm_bg.wasm -n 40
