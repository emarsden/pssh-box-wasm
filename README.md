# pssh-box-wasm

A collection of web-based tools for working with PSSH boxes (as used for the initialization of DRM
systems) and with Widevine Content Decryption Modules (CDMs). There are tools that allow you to:

- serialize and deserialize (create and decode) PSSH boxes
- request decryption keys (obtain a license) from a Widevine DRM licensing server
- convert Widevine CDMs between blob format and “WVD” format

The tools use code from the Rust crate [pssh-box](https://crates.io/crates/pssh-box) compiled to
WebAssembly (WASM), and run fully in your web browser (there is no server backend; the tools will work fully
offline once loaded).

> [!TIP]
> You can [try out the tools in your browser](https://emarsden.github.io/pssh-box-wasm/). 


PSSH boxes are used:

- in an MP4 box of type `pssh` in an MP4 fragment (CMAF/MP4/ISOBMFF containers)

- in a `<cenc:pssh>` element in a DASH MPD manifest

- in DRM initialization data passed to the Encrypted Media Extension of a web browser

- in an `EXT-X-SESSION-KEY` field of an m3u8 playlist


A PSSH box includes information for a single DRM system. This library supports the PSSH data formats
for the following DRM systems:

- Widevine, owned by Google, widely used for DASH streaming
- PlayReady, owned by Microsoft, widely used for DASH streaming
- WisePlay, owned by Huawei
- Irdeto
- Marlin
- Nagra
- The unofficial variant of Apple FairPlay that is used for DASH-like streaming by Netflix
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
