+++
title = "Widevine license request"
description = "Make a Widevine DRM license request directly from your browser (WASM)."
+++


Make a Widevine DRM license request to **obtain decryption keys** for a specified PSSH. This tool is
implemented in WebAssembly and runs fully inside your web browser, meaning: 

- from a software hygiene perspective, the code is running **safely sandboxed** by your web browser

- it doesn't require any software installation on your computer

- the license request is sent from your browser, so should be using any cookies that have been set
  for the license URL. It will respect any proxy settings and browser-based VPNs that you have set
  up.


**Note**: This tool is pretty bleeding edge, and error reporting is not very robust. Check your
browser’s Javascript console if things don’t work; you may see some extra diagnostics information.


<!-- Some test vectors

Manifest: 'https://devs.origin.cdn.cra.cz/dashmultikey/manifest.mpd'
PSSH: AAAAZXBzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAAEUIARIQdb8zrAhEDIHWIwGch/4TYBoFQ2Vza2UiJDc1YmYzM2FjLTA4NDQtMGM4MS1kNjIzLTAxOWM4N2ZlMTM2MCoCU0Q=
License URL: "https://drm-widevine-licensing.axtest.net/AcquireLicense"
Headers:
{ "X-AxDRM-Message":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21fa2V5X2lkIjoiNjVGM0JCNjItQUUwMS00MThGLUFCNkUtRTlBNTgwOUU3MEIxIiwibWVzc2FnZSI6eyJjb250ZW50X2tleV91c2FnZV9wb2xpY2llcyI6W3sicGxheXJlYWR5Ijp7ImRpZ2l0YWxfdmlkZW9fb3V0cHV0X3Byb3RlY3Rpb25zIjpbeyJjb25maWdfZGF0YSI6IkFBQUFBUT09IiwiaWQiOiJBQkIyQzZGMS1FNjYzLTQ2MjUtQTk0NS05NzJEMTdCMjMxRTcifV0sImFuYWxvZ192aWRlb19vcGwiOjIxMCwiY29tcHJlc3NlZF9kaWdpdGFsX3ZpZGVvX29wbCI6NDAwLCJhbmFsb2dfdmlkZW9fb3V0cHV0X3Byb3RlY3Rpb25zIjpbeyJjb25maWdfZGF0YSI6IkFBQUFBUT09IiwiaWQiOiI3NjBBRTc1NS02ODJBLTQxRTAtQjFCMy1EQ0RGODM2QTczMDYifV0sInVuY29tcHJlc3NlZF9kaWdpdGFsX3ZpZGVvX29wbCI6MzAwfSwibmFtZSI6ImhpZ2hzZWMiLCJ3aWRldmluZSI6eyJkaXNhYmxlX2FuYWxvZ19vdXRwdXQiOnRydWUsImhkY3AiOiIyLjAiLCJjZ21zLWEiOiJuZXZlciIsImRldmljZV9zZWN1cml0eV9sZXZlbCI6IlNXX1NFQ1VSRV9ERUNPREUifX0seyJwbGF5cmVhZHkiOnsibWluX2RldmljZV9zZWN1cml0eV9sZXZlbCI6MjAwMH0sIm5hbWUiOiJsb3dzZWMifV0sInZlcnNpb24iOjIsInR5cGUiOiJlbnRpdGxlbWVudF9tZXNzYWdlIiwiY29udGVudF9rZXlzX3NvdXJjZSI6eyJpbmxpbmUiOlt7InVzYWdlX3BvbGljeSI6Imxvd3NlYyIsImlkIjoiNzViZjMzYWMtMDg0NC0wYzgxLWQ2MjMtMDE5Yzg3ZmUxMzYwIiwiaXYiOiJleTVWZHNhNzFmOFhMU0oxTUZtdHZRPT0ifSx7InVzYWdlX3BvbGljeSI6ImhpZ2hzZWMiLCJpZCI6Ijc0ZWE4ZGI4LTc2YWUtOWM4Yy0yYTIxLTk4ODJkNzYzYmM3ZCIsIml2IjoiWERjVks0cVFQT0RQdjJhRVRsc3dNdz09In1dfSwibGljZW5zZSI6eyJkdXJhdGlvbiI6NjA0ODAwLCJmYWlycGxheSI6eyJyZWFsX3RpbWVfZXhwaXJhdGlvbiI6dHJ1ZX0sInBsYXlyZWFkeSI6eyJyZWFsX3RpbWVfZXhwaXJhdGlvbiI6dHJ1ZX19fSwidmVyc2lvbiI6MX0.fKaMnR9RdY_u4ZEvb7iCDI_qJyxnw6BF_bcwZoQnag0" }


Manifest: https://media.axprod.net/TestVectors/v6.1-MultiDRM-MultiKey/Manifest_1080p.mpd
PSSH: AAAANHBzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAABQIARIQFTDToGkERGqRoTOhFaqMQQ==
License URL: "https://drm-widevine-licensing.axtest.net/AcquireLicense"
Headers: { "X-AxDRM-Message":
		"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXJzaW9uIjoxLCJjb21fa2V5X2lkIjoiNjllNTQwODgtZTllMC00NTMwLThjMWEtMWViNmRjZDBkMTRlIiwibWVzc2FnZSI6eyJ0eXBlIjoiZW50aXRsZW1lbnRfbWVzc2FnZSIsImtleXMiOlt7ImlkIjoiMTUzMGQzYTAtNjkwNC00NDZhLTkxYTEtMzNhMTE1YWE4YzQxIn0seyJpZCI6ImM4M2ViNjM5LWU2NjQtNDNmOC1hZTk4LTQwMzliMGMxM2IyZCJ9LHsiaWQiOiIzZDhjYzc2Mi0yN2FjLTQwMGYtOTg5Zi04YWI1ZGM3ZDc3NzUifSx7ImlkIjoiYmQ4ZGFkNTgtMDMyZC00YzI1LTg5ZmEtYzdiNzEwZTgyYWMyIn1dfX0.9t18lFmZFVHMzpoZxYDyqOS0Bk_evGhTBw_F2JnAK2k" } 
    
and https://reference.dashif.org/dash.js/latest/samples/drm/license-wrapping.html
    -->

<form>
  <label>PSSH in base 64 (required)
    <input id="pssh" class="form-input" name="pssh"
      data-tooltip="The PSSH box (DRM initialization data)"
      pattern="\s*[A-Za-z0-9\-\+\/]*={0,3}\s*" placeholder="PSSH..." 
      required aria-invalid="true" />
    <small>The DRM initialization data (PSSH box). Make sure this contains no spaces.</small>
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
  <progress></progress>
</article>

<article id="output" class="output"></article>

<details id="logs" class="pyodide_logs">
  <summary role="button" class="outline secondary">Pywidevine logs</summary>
  <p id="log"></p>
</details>


### Limitations

Some DRM license servers require specific information as a “payload” of the `POST` request made to
the license server, in addition to or instead of specific HTTP headers. This tool doesn’t currently
support sending a `POST` payload.


### About

How does this tool work? It uses the [Pywidevine library](https://github.com/devine-dl/pywidevine)
which provides a Python implementation of the Widevine Content Decryption Module (CDM). This module
(normally implemented in obfuscated software that runs in your web browser, or on specially
protected hardware on your CPU or GPU) is responsible for making requests to the server that
provides the licenses (the decryption keys) for playing media “protected” by DRM. The pywidevine
library is compiled to WASM using the excellent [Pyodide](https://pyodide.org/) tool so that it can
run fully inside your web browser (there is no server backend for this software).

**Privacy**: this software is running fully inside your web browser. All the content is kindly
hosted by [GitHub pages](https://pages.github.com/) (please note their [privacy
policy](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement). We don’t
log visits (no web analytics, no cookies), but GitHub pages provides anonymized web traffic graphs.



<script defer src="../pyodide/pyodide.js"></script>
<script type="module" src="../js/get-license.js"></script>

