+++
title = "Widevine license request"
description = "Make a Widevine DRM license request directly from your browser (WASM)."
+++


Make a Widevine DRM license request to **obtain decryption keys** for a specified PSSH. The license request is
sent from your browser, so should be using any cookies that have been set for the license URL.

This tool is pretty bleeding edge. Check your browser’s Javascript console if things don’t work; you
may see some extra diagnostics information.

<form>
  <label>PSSH in base 64 (required)
    <input id="pssh" class="form-input" name="pssh"
      data-tooltip="The PSSH box (DRM initialization data)"
      pattern="[A-Za-z0-9\-\+\/]*={0,3}" placeholder="PSSH..." 
      required aria-invalid="true"></input>
  </label>
  <label>License server URL (required)
    <input id="lurl" type="url" aria-describedby="lurl-help" required aria-invalid="true"/>
    <small id="lurl-help">The URL of the Widevine license server</small>
  </label>
  <label>Headers (optional)
    <textarea id="headers" placeholder="{ 'foo': 'bar' }" aria-describedby="headers-help"></textarea>
    <small id="headers-help">Any extra HTTP headers to include with the license request, 
    formatted as a Python dict. The HTML5 Fetch API used to make the request from your browser means
    that certain headers (including <tt>Accept-Encoding</tt>, <tt>Connection</tt> and
    <tt>Content-Length</tt>) cannot be set.</small>
  </label>
  <label><abbr title="Content Decryption Module">CDM</abbr> device in WVD format (required)
    <input id="wvd" type="file" required aria-invalid="true"/>
  </label>
  <button id="go" data-tooltip="Request the decryption keys" disabled>Request license</button>
</form>


<article id="loading">
  <i>Loading Pyodide library… (around 11MB of WASM code)</i>
  <progress />
</article>

<article id="output" class="output"></article>

<details id="logs" class="pyodide_logs">
  <summary role="button" class="outline secondary">Pywidevine logs</summary>
  <p id="log"></p>
</details>

**Privacy**: This tool is implemented in [WebAssembly](https://webassembly.org/) (WASM) and runs
fully inside your web browser (there is no server backend; the tool will work fully offline). It
uses the [Pywidevine library](https://github.com/devine-dl/pywidevine) compiled to WASM using
the excellent [Pyodide](https://pyodide.org/) tool.

<script defer src="../pyodide/pyodide.js"></script>
<script type="module" src="../js/get-license.js"></script>

