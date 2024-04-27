+++
title = "Convert CDM"
description = "A web-based tool to convert Widevine CDMs into different formats."
authors = ["FoxRefire"]
+++


<article id="loading">
  <i>Loading Pyodide library… (around 11MB of WASM code)</i>
  <progress></progress>
</article>

A Content Decryption Module (CDM) is the component of a DRM system that makes requests to a license
server to obtain decryption keys and decrypts and decodes encrypted media content for display. The
pywidevine library is a software implementation of the Widevine CDM. Creating an “L3” CDM requires
two binary blobs: a client identifier (generally saved in a file named `client_id.bin`) and a
private key (generally saved in a file name `client_id.pem`). These can be combined to generate a
CDM in “WVD” (Widevine Device) format, which can be saved in a single file (named for instance
`mycdm.wvd`).

This tool allows you to convert a client ID and private key into a WVD file (blobs -> WVD), or the
opposite route of extracting the client ID and private key blobs from a WVD file. The tool uses the
pywidevine library compiled to WebAssembly, running fully inside your browser.


<form>
   <article>
      <header><h3>Blobs to WVD</h3></header>
      <label data-tooltip="device_client_id_blob or client_id.bin">Client ID
         <input id="cid" type="file" required aria-invalid="true"/>
      </label>
      <label data-tooltip="device_private_key or private_key.pem">Private Key
         <input id="prk" type="file" required aria-invalid="true"/>
      </label>
      <button id="toWVDGo">Convert</button>
   </article>
</form>

<hr>

<form>
   <article>
      <header><h3>WVD to Blobs</h3></header>
      <label>CDM device in WVD format
         <input id="wvd" type="file" required aria-invalid="true"/>
      </label>
      <button id="fromWVDGo">Convert</button>
   </article>
</form>

**Privacy**: this tool is implemented in WebAssembly and runs locally in your web browser. Once
loaded, it will run fully offline.


<script defer src="../pyodide/pyodide.js"></script>
<script type="module" src="../js/convert.js"></script>
