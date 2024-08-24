+++
title = "Fetch PSSH data"
description = "Fetch PSSH data from a DASH initialization segment."
+++


<form>
   <fieldset role="group">
      <input id="url" type="url" placeholder="https://server.com/init.mp4" autofocus />
      <button id="go"
         data-tooltip="Fetch MP4 segment and decode any PSSH boxes"
         data-placement="left">Fetch</button>
   </fieldset>
   <small>The URL of the initialization segment to fetch</small>
</form>

<article id="output" class="output"></article>

This tool fetches an initialization segment from a web server (an MP4 fragment), extracts any DRM
initialization data (PSSH boxes) and decodes and prints them. Please note that the initialization
segment is fetched using your own web browser. Due to browser restrictions on “<a
href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content">mixed content</a>”, this
tool will probably only work with HTTPS URLs and fail with HTTP URLs.

Some sample URLs for testing: [init1.mp4](https://m.dtv.fi/dash/dasherh264v3/drm/a1/i.mp4),
[init2.mp4](https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/video/180_250000/cenc_dash/init.mp4).

**Privacy**: this tool is implemented in WebAssembly and runs locally in your web browser. Once
loaded, it will run fully offline.


<script type="module" src="../js/fetch-init.js"></script>
