+++
title = "Convert CDM"
description = "This tool converts CDM files to file format"
+++
<form id="toWVD">
   <article>
      <header><h3>Blobs to WVD</h3></header>
      <label data-tooltip="device_client_id_blob or client_id.bin">Client ID
         <input id="cid" type="file" required aria-invalid="true"/>
      </label>
      <label data-tooltip="device_private_key or private_key.pem">Private Key
         <input id="cid" type="file" required aria-invalid="true"/>
      </label>
   </article>
</form>

**Privacy**: this tool is implemented in WebAssembly and runs locally in your web browser. Once
loaded, it will run fully offline.


<script type="module" src="../js/fetch-init.js"></script>
