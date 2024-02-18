+++
title = "PSSH box generator"
description = "Generate a Widevine PSSH box directly in your browser (WASM)."
+++

Note: all fields except for key ID can be left empty.


<form>
  <label data-tooltip="Key ID (32 hex characters)">Key ID
    <input id="kid" type="text" minlength="32" maxlength="32"
      pattern="[0-9ABCDEFabcdef]{32}" /></label>
  <label>Content provider name <input id="provider" type="text"/></label>
  <label>Content ID <input id="contentid" type="text"/></label>
  <label>Policy <input id="policy" type="text"/></label>
  <label>Crypto period index, for media using key rotation (an uint32)
    <input id="crypto_period_index" type="number"/></label>
  <fieldset>
    <legend>Protection scheme</legend>
    <label><input type="radio" name="protection_scheme" value="cenc" checked/>cenc (AES-CTR)</label>
    <label><input type="radio" name="protection_scheme" value="cbc1"/>cbc1 (AES-CBC)</label>
    <label><input type="radio" name="protection_scheme" value="cens"/>cens (AES-CTR subsample)</label>
    <label><input type="radio" name="protection_scheme" value="cbcs"/>cbcs (AES-CBC subsample)</label>
  </fieldset>
  <button id="go" data-tooltip="Generate PSSH">Generate</button>
</form>

<div style="margin-top:2em;margin-bottom:2em;padding:1em" id="output"></div>

This tool generates a Widevine PSSH box and encodes it in Base 64 format.

**Privacy**: this tool is implemented in [WebAssembly](https://webassembly.org/) (WASM)
and runs fully inside your web browser (there is no server backend).



<script type="module" src="../js/generate.js"></script>
