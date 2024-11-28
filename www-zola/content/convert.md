+++
title = "Convert CDM"
description = "A web-based tool to convert Widevine and Playready CDMs into different formats."
authors = ["FoxRefire"]
+++

<style>
av[aria-label=breadcrumb] ul {
  width: 100%;
}
nav[aria-label=breadcrumb] ul li {
  display:flex;justify-content: center;align-items: center;
}
nav[aria-label=breadcrumb] ul li:not(:last-child) ::after {
  content: "";
}
[role=tab] {
  border-bottom: 2px solid transparent;
  font-size: 140%;
  font-weight: bold;
  padding: var(--nav-link-spacing-vertical) calc(var(--nav-link-spacing-horizontal)*1.5);
  user-select: none;
  color: var(--secondary);
  border-radius: 0;
  background: transparent;
  transition: all .25s;
}
[role=tab][aria-current] {
  color: var(--contrast)!important;
  border-color: var(--contrast);
}
section {
  margin: calc(var(--block-spacing-vertical)*.5) 0;
}
section [role=tabpanel] {
  animation-duration: 0.3s;
  animation-fill-mode: both;
  animation-name: slideIn;
}
@keyframes slideIn {
    0% {
      transform: translateY(1rem);
      opacity: 0;
    }
    100% {
      transform:translateY(0rem);
      opacity: 1;
    }
    0% {
      transform: translateY(1rem);
      opacity: 0;
    }
}
</style>


<article id="loading">
  <i>Loading Pyodide library… (around 11MB of WASM code)</i>
  <progress></progress>
</article>

A Content Decryption Module (CDM) is the component of a DRM system that makes requests to a license
server to obtain decryption keys and decrypts and decodes encrypted media content for display. This
tool allows you to convert between a CDM and “blob” format, the binary content from which a CDM
device is defined. It works for both Widevine and Playready CDM devices.

<nav aria-label="breadcrumb">
  <ul>
    <li><a href="#" role="tab">Widevine</a></li>
    <li><a href="#" role="tab">Playready</a></li>
  </ul>
</nav>

<section>
  <div role="tabpanel">
  <!-- Widevine -->
  The pywidevine library is a software implementation of the Widevine CDM. Creating an “L3” CDM
  requires two binary blobs: a client identifier (generally saved in a file named `client_id.bin`) and
  a private key (generally saved in a file name `client_id.pem`). These can be combined to generate a
  CDM in “WVD” (Widevine Device) format, which can be saved in a single file (named for instance
  `mycdm.wvd`).

  This tool allows you to convert a client ID and private key into a WVD file (blobs -> WVD), or the
  opposite route of extracting the client ID and private key blobs from a WVD file. The tool uses the
  pywidevine library compiled to WebAssembly, running fully inside your browser.

  <form>
     <article>
        <header><strong>Blobs to WVD</strong></header>
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
        <header><strong>WVD to Blobs</strong></header>
        <label>CDM device in WVD format
           <input id="wvd" type="file" required aria-invalid="true"/>
        </label>
        <button id="fromWVDGo">Convert</button>
     </article>
  </form>
  </div>

  <div role="tabpanel" hidden>
  <!-- Playready -->

  The [pyplayready](https://github.com/ready-dl/pyplayready) library is a software implementation of
  a Playready CDM. You can create a Playready device (`.prd` file) from a group certificate file and
  a group key file (two binary “blobs”), or given a `.prd` device, can extract the binary blobs. 
  This tool uses the pyplayready library compiled to WebAssembly, running fully inside your browser.

  <form>
     <article>
        <header><strong>Blobs to Playready device (.prd)</strong></header>
        <label data-tooltip="group_cert.bin">Group certificate
           <input id="prgroupcert" type="file" required aria-invalid="true"/>
        </label>
        <label data-tooltip="group_key.pem">Group key
           <input id="prgroupkey" type="file" required aria-invalid="true"/>
        </label>
        <button id="to_playready_device">Convert</button>
     </article>
  </form>

  <hr>

  <form>
     <article>
        <header><strong>PRD to blobs</strong></header>
        <label>Playready device in .prd format
           <input id="prdevice" type="file" required aria-invalid="true"/>
        </label>
        <button id="export_playready_device">Convert</button>
     </article>
  </form>
</div>
</section>



**Privacy**: this tool is implemented in WebAssembly and runs locally in your web browser. Once
loaded, it will run fully offline.


<script defer src="../pyodide/pyodide.js"></script>
<script type="module" src="../js/convert.js"></script>
