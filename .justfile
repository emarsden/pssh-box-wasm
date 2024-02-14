# For use with the just command runner, https://just.systems/

default:
   @just --list

wasm-pack:
   wasm-pack build --release --target web


wasm2:
   cargo build --target wasm32-unknown-unknown 


serve:
   cd html && python3 -m http.server


# for use with twiggy ("cargo install twiggy")
# Need a non-release build for symbols
twiggy:
   wasm-pack build --dev --target web
   twiggy top pkg/pssh_box_wasm_bg.wasm -n 40
