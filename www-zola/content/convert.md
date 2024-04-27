+++
title = "Convert CDM"
description = "This tool converts CDM files format"
+++
<article id="loading">
  <i>Loading Pyodide library… (around 11MB of WASM code)</i>
  <progress></progress>
</article>
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
