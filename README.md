# pssh-box-wasm

A web-based tool to serialize and deserialize (create and decode) PSSH boxes, as used for the
initialization of DRM systems. This tool uses code from the Rust crate
[pssh-box](https://crates.io/crates/pssh-box) compiled to WASM, and runs fully in your web browser
(there is no server backend; the tool will work fully offline once loaded).

PSSH boxes are used:

- in an MP4 box of type `pssh` in an MP4 fragment (CMAF/MP4/ISOBMFF containers)

- in a `<cenc:pssh>` element in a DASH MPD manifest

A PSSH box includes information for a single DRM system. This library supports the PSSH data formats
for the following DRM systems:

- Widevine, owned by Google, widely used for DASH streaming
- PlayReady, owned by Microsoft, widely used for DASH streaming
- WisePlay, owned by Huawei
- Irdeto
- Marlin
- Nagra
- Common Encryption

PSSH boxes contain (depending on the DRM system) information on the key_ID for which to obtain a
content key, the encryption scheme used (e.g. cenc, cbc1, cens or cbcs), the URL of the licence
server, and checksum data.



Useful references: 

- Information from the W3C on the [cenc initialization data format](https://www.w3.org/TR/eme-initdata-cenc/)

- [Widevine diagnostics tools](https://integration.widevine.com/diagnostics) 

- The Shaka packager utility includes a Python script
  [pssh-box.py](https://github.com/shaka-project/shaka-packager/blob/main/packager/tools/pssh/pssh-box.py)
  which is able to decode and create Widevine initialization data.



## License

This project is licensed under the MIT license. For more information, see the `LICENSE` file.
