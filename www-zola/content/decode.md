+++
title = "PSSH box decoder"
description = "Decode a DRM PSSH box directly in your browser (WASM)."
+++


<form>
  <textarea id="pssh" class="form-input" name="pssh"
    data-tooltip="The PSSH box (DRM initialization data)"
    pattern="[0-9ABCDEFabcdef+=]+"
    placeholder="PSSH..."></textarea>
  <fieldset>
    <legend>Input format:</legend>
      <label><input type="radio" name="fmt" id="fmt_base64" checked />Base64 (normal format in an <tt>mpd</tt> manifest)</label>
      <label><input type="radio" name="fmt" id="fmt_hex" />Hex (Base 16)</label>
  </fieldset>
  <button id="go" data-tooltip="Decode PSSH">Decode</button>
</form>

<div style="margin-top:2em;padding:1em" id="output"></div>

<p style="margin-top:2em">This tool decodes a <abbr title="Protection System Specific
Header">PSSH</abbr> box or sequence of <abbr title="Protection System Specific
Header">PSSH</abbr> boxes that are used to initialize <abbr title="Digital Rights
Management">DRM</abbr> systems for streaming media. You will typically find a
<abbr title="Protection System Specific Header">PSSH</abbr> box:

- inside a `<cenc:pssh>` element in a DASH MPD manifest;
- within a `pssh` box in the initialization segment of a media stream (an fMP4 fragment);
- in an `EXT-X-SESSION-KEY` field of an m3u8 playlist.


This tool is implemented in [WebAssembly](https://webassembly.org/) (WASM) and runs fully inside
your web browser (there is no server backend; the tool will work fully offline). It supports the
following <abbr title="Digital Rights Management">DRM</abbr> systems:

- <a href="https://www.widevine.com/solutions/widevine-drm">Widevine</a>, owned by Google, widely used for DASH streaming
- <a href="https://www.microsoft.com/playready/overview/">PlayReady</a>, owned by Microsoft, widely used for DASH streaming
- <a href="https://irdeto.com/video-entertainment/multi-drm/">Irdeto</a>
- <a href="https://www.marlin-community.com/">Marlin</a>
- <a href="https://developer.huawei.com/consumer/en/hms/huawei-wiseplay/">WisePlay</a>, owned by Huawei
- The unofficial variant of Apple FairPlay that is used for DASH-like streaming by Netflix
- Common Encryption (CENC)


<script type="module" src="../js/decode.js"></script>

