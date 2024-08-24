+++
title = "PSSH box generator"
description = "Generate a Widevine PSSH box directly in your browser (WASM)."
+++

Given a Key ID and other optional arguments, this tool generates a Widevine PSSH box and encodes it
in Base 64 format.


<form>
  <article>
    <header><h3>Mandatory field</h3></header>
      <label data-tooltip="Key ID (32 hex characters)">Key ID or KID (required argument)
        <input id="kid" type="text" minlength="32" maxlength="36"
        pattern="[0-9ABCDEFabcdef]{8}-?[0-9ABCDEFabcdef]{4}-?[0-9ABCDEFabcdef]{4}-?[0-9ABCDEFabcdef]{4}-?[0-9ABCDEFabcdef]{12}" 
        required autofocus />
      </label>
  </article>

  <article>
  <header><h3>Optional fields</h3>
  
  <p>All fields below can be left blank or at their default values.</p>
  </header>

  <fieldset>
    <legend>PSSH box version:</legend>
    <input id="v0" type="radio" name="version" value="0" checked />
    <label htmlFor="v0">Version 0 (recommended)</label>
    <input id="v1" type="radio" name="version" value="1" />
    <label htmlFor="v1">Version 1</label>
  </fieldset>
  <small>v0 PSSH boxes are more widely supported by Widevine license servers</small>
  
 
  <label>Content provider name (optional) 
    <input id="provider" type="text"/>
  </label>

  <label>Content ID (optional) 
    <input id="contentid" type="text" aria-describedby="contentid-help"/>
    <small id="contentid-help">An identifier supplied by a content provider, used to identify a
    piece of content and derive key IDs and content keys</small>
  </label>

  <label>Policy (optional) 
    <input id="policy" type="text" aria-describedby="policy-help"/>
    <small id="policy-help">A policy name that refers to a stored policy in Widevine service</small>
  </label>

  <fieldset>
    <legend>Encryption algorithm (optional)</legend>
    <label><input type="radio" name="algorithm" value="unspecified" checked />Unspecified (recommended)</label>
    <label><input type="radio" name="algorithm" value="0"/>Unencrypted (algorithm = 0)</label>
    <label><input type="radio" name="algorithm" value="1"/>AES-CTR (algorithm = 1)</label>
  </fieldset>

  <label>Crypto period index, for media using key rotation (an uint32, optional)
    <input id="crypto_period_index" type="number"/>
  </label>

  <fieldset>
    <legend>Protection scheme</legend>
    <label><input type="radio" name="protection_scheme" value="unspecified" checked/>Unspecified</label>
    <label><input type="radio" name="protection_scheme" value="CENC"/>cenc (AES-CTR)</label>
    <label><input type="radio" name="protection_scheme" value="CBC1"/>cbc1 (AES-CBC)</label>
    <label><input type="radio" name="protection_scheme" value="CENS"/>cens (AES-CTR subsample)</label>
    <label><input type="radio" name="protection_scheme" value="CBCS"/>cbcs (AES-CBC subsample)</label>
  </fieldset>
  </article>

  <button id="go" data-tooltip="Generate PSSH">Generate</button>
</form>

<article id="output" class="output"></article>

**Privacy**: this tool is implemented in [WebAssembly](https://webassembly.org/) (WASM)
and runs fully inside your web browser (there is no server backend).


<script type="module" src="../js/generate-pssh.js"></script>
