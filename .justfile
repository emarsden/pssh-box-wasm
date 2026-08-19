# For use with the just command runner, https://just.systems/

default:
    @just --list

build:
    wasm-pack build --release --target web

wasm:
    cargo build --target wasm32-unknown-unknown


# We have a dependency on an old (v2.8.8) version of the construct package, which doesn't have a
# prebuilt wheel on pypi. So we need to build that manually and make it available to the micropip
# loader. (See https://pypi.org/project/construct/2.8.8/)
serve:
    #!/usr/bin/env bash
    TMPSRC=`mktemp -d /tmp/pyodide-buildXXXX`
    DIST=`mktemp -d /tmp/pssh-box-wasmXXXXX`
    mkdir -p $DIST/static/pkg
    (cd $TMPSRC &&
    wget https://files.pythonhosted.org/packages/b6/2c/66bab4fef920ef8caa3e180ea601475b2cbbe196255b18f1c58215940607/construct-2.8.8.tar.gz &&
    tar xzf construct-2.8.8.tar.gz &&
    cd construct-2.8.8 &&
    python3 setup.py bdist_wheel &&
    cp dist/construct-2.8.8-py2.py3-none-any.whl $DIST/static/pkg)
    cp -r www-zola/* $DIST
    wasm-pack build --release --target web
    cp -r pkg $DIST/static
    echo serving from $DIST
    (cd $DIST && zola serve)


# This target is no longer needed as of 202608, because new pyodide versions are usable from a CDN
# and packaged with many of the libraries that we need.
build_pyodide:
    #!/usr/bin/env bash
    TMPSRC=`mktemp -d /tmp/pyodide-buildXXXX`
    DIST=`mktemp -d /tmp/pyodide-distXXXX`
    echo Building in $TMPSRC
    mkdir $TMPSRC/dist
    (cd $TMPSRC && git clone --quiet --recursive --depth 1 https://github.com/pyodide/pyodide.git)
    cd $TMPSRC/pyodide
    git clone --quiet --depth 1 https://github.com/pyodide/pyodide-recipes
    # Build pyodide using emscripten, as per
    # https://pyodide.org/en/stable/development/building-from-sources.html
    podman run -ti --tty -v $PWD:/src \
       docker.io/pyodide/pyodide-env:20260724-chrome151-firefox152-py315 \
       /bin/bash -c "make && pyodide build-recipes micropip,pycryptodome,pyyaml,protobuf,requests,lzma,hashlib --recipe-dir pyodide-recipes/packages --install"
    cp -r dist/* $TMPSRC/dist
    # Now we build a whl for construct v2.8.8 (not available on pypi)
    cd $TMPSRC
    wget https://files.pythonhosted.org/packages/b6/2c/66bab4fef920ef8caa3e180ea601475b2cbbe196255b18f1c58215940607/construct-2.8.8.tar.gz
    tar xzf construct-2.8.8.tar.gz
    cd construct-2.8.8
    python3 setup.py bdist_wheel
    cp dist/construct-2.8.8-py2.py3-none-any.whl $TMPSRC/dist
    cd $TMPSRC/dist
    # Now copy only the necessary files (for many we are able to use the official whl tarballs)
    cp construct-*whl $DIST
    cp ffi.d.ts $DIST
    cp package.json $DIST
    cp protobuf-6*wasm32.whl $DIST
    cp pycryptodome-3*wasm32.whl $DIST
    cp pyodide.asm.js $DIST
    cp pyodide.asm.wasm $DIST
    cp pyodide.d.ts $DIST
    cp pyodide.js $DIST
    cp pyodide.js.map $DIST 
    cp pyodide-lock.json $DIST
    cp pyodide.mjs $DIST
    cp pyodide.mjs.map $DIST
    cp python_stdlib.zip $DIST
    cp request*whl $DIST
    cp micropip* $DIST
    echo Outputs are in $DIST



# for use with twiggy ("cargo install twiggy")
# Need a non-release build for symbols
twiggy:
   wasm-pack build --dev --target web
   twiggy top pkg/pssh_box_wasm_bg.wasm -n 40
