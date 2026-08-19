import init, { code_version } from "../pkg/pssh_box_wasm.js";
init().then(() => {
    document.getElementById("version").innerHTML = code_version();
});

const myPackages = ["pycryptodome", "requests"];
let pyodide = await loadPyodide({ packages: myPackages });
await pyodide.loadPackage("micropip");
const micropip = pyodide.pyimport("micropip");
// This is an old version of the construct library which is not available in prepackaged whl format
// on PyPI, so we use a local copy that we build ourselves.
await micropip.install("../pkg/construct-2.8.8-py2.py3-none-any.whl");
await micropip.install("pyodide-http");
await micropip.install("pywidevine");
console.log("Pyodide + pywidevine loaded");
document.getElementById("loading").style.display = "none";
pyodide.setDebug(true)
var wvd_b64 = null;



const py_import = `
import js
import traceback
import pyodide
import requests
import pywidevine
import pyodide_http
from base64 import b64decode
from pywidevine.cdm import Cdm
from pywidevine.device import Device
from pywidevine.pssh import PSSH
`;


const py_parse_pssh = `
pssh_ok = False
try: 
   pypssh = PSSH(pssh)
   pssh_ok = type(pypssh) is pywidevine.pssh.PSSH
except:
   pssh_ok = False
pssh_ok
`;

const py_license = `
out = js.document.getElementById("output")
wvd = b64decode(wvd_b64)
device = Device.loads(wvd)
# log += "<p>CDM device: {}".format(device)
cdm = Cdm.from_device(device)
session_id = cdm.open()
log += "<p>CDM session: {}".format(session_id)
challenge = cdm.get_license_challenge(session_id, pypssh)
have_license = False
try:
   license = requests.post(lurl, headers=headers, data=challenge, timeout=20.0)
   license.raise_for_status()
   have_license = True
except pyodide.ffi.JsException as e:
   out.innerHTML = "<h3>Pyodide error {}</h3>".format(e.name)
   log += "<p>Pyodide error {}".format(e)
   if e.name == "NetworkError":
      log += "<p><strong>Hint</strong>: a NetworkError is often caused by a missing HTTP header containing an authentication token."
   log += "<p>Backtrace: " + traceback.format_exc()
except requests.exceptions.Timeout as e:
   out.innerHTML = "<h3>Python timeout requesting licence</h3>"
   log += "<p>Request timeout {}".format(e)
   log += "<p>Backtrace: " + traceback.format_exc()
except requests.exceptions.SSLError as e:
   out.innerHTML = "<h3>Python SSLError</h3>"
   log += "<p>SSL error {}".format(e)
   log += "<p>Backtrace: " + traceback.format_exc()
except requests.exceptions.ConnectionError as e:
   out.innerHTML = "<h3>Python ConnectionError</h3>"
   log += "<p>Licence request connection error {}".format(e)
   log += "<p>Backtrace: " + traceback.format_exc()
except requests.exceptions.HTTPError as e:
   out.innerHTML = "<h3>Python HTTPError</h3>"
   log += "<p>License request HTTP error {}".format(e)
   log += "<p>Backtrace: " + traceback.format_exc()
except Exception as e:
   out.innerHTML = "<h3>Generic Python Error</h3>"
   log += "<p>Generic Python error requesting license: {}".format(e)
   log += "<p>Backtrace: " + traceback.format_exc()
if have_license:
   cdm.parse_license(session_id, license.content)
   html = "<table class=wrapping>"
   keys = ""
   for key in cdm.get_keys(session_id):
       html += f"<tr><td>{key.type}</td> <td>{key.kid.hex}:{key.key.hex()}</td></tr>"
       if key.type == "CONTENT":
           keys += f"--key {key.kid.hex}:{key.key.hex()} "
   html += "</table>"
   cdm.close(session_id)
   html += "<p><strong>Commandline arguments</strong> for dash-mpd-cli or N_m3u8DL-RE:</p>"
   html += "<p id=cmdline><tt>" + keys + "</tt></p>"
have_license
`;


function updateLogElement() {
    document.getElementById("log").innerHTML = "<pre>" + pyodide.globals.get("log") + "</pre>";
}

async function get_license(wvd_b64, pssh, lurl, headers) {
    pyodide.globals.set("wvd_b64", wvd_b64);
    pyodide.globals.set("pssh", pssh);
    pyodide.globals.set("lurl", lurl);
    pyodide.globals.set("headers", pyodide.runPython(headers));
    pyodide.globals.set("log", "");
    let out = document.getElementById("output");
    pyodide.runPython(py_import);
    updateLogElement();
    document.getElementById("logs").style.visibility = "visible";
    var pssh_ok = false;
    try {
        pssh_ok = pyodide.runPython(py_parse_pssh);
    } catch (e) {
        pssh_ok = false;
        document.getElementById("log").innerHTML = "<pre>" +
            e.toString().replace("\n", "<br>") + "</pre>";
    }
    if (!pssh_ok) {
        out.scrollIntoView();
        out.style.visibility = "visible";
        out.classList.add("failed");
        out.innerHTML = "<h3>Not a valid PSSH</h3>";
        return;
    }
    try {
        let have_license = pyodide.runPython(py_license);
        updateLogElement();
        if (have_license) {
            out.classList.remove("failed");
            out.scrollIntoView();
            out.style.visibility = "visible";
            out.innerHTML = "<h3>Decryption keys</h3>" + pyodide.globals.get("html");
        } else {
            out.innerHTML = "Licence request failed (see logs)";
            out.classList.add("failed");
            updateLogElement();
        }
    } catch (e) {
        updateLogElement();
        out.classList.add("failed");
        out.innerHTML = "<h3>Python error</h3><p>" + e.toString().replace("\n", "<br>");
    }
    out.scrollIntoView();
    out.style.visibility = "visible";
}

document.getElementById("go").addEventListener("click", async function(e) {
    e.preventDefault();
    e.target.style.cursor = "wait";
    if (!document.querySelector("form").checkValidity()) {
        alert("Form arguments are invalid");
        return;
    }
    const pssh = document.getElementById("pssh").value.trim();
    const lurl = document.getElementById("lurl").value.trim();
    const headers = document.getElementById("headers").value.trim();
    get_license(wvd_b64, pssh, lurl, headers);
    e.target.style.cursor = "auto";
});


function maybeValidateSubmit() {
    if (document.querySelector("form").checkValidity()) {
        document.getElementById("go").removeAttribute("disabled");
    }
}


const pssh = document.getElementById("pssh");
pssh.addEventListener("input", function (e) {
    if (pssh.validity.patternMismatch) {
        pssh.setAttribute("aria-invalid", true);
        pssh.setCustomValidity("Invalid PSSH format");
        document.getElementById("go").setAttribute("disabled", true);
    } else {
        pssh.setCustomValidity("");
        pssh.setAttribute("aria-invalid", false);
        maybeValidateSubmit();
    }
});

const lurl = document.getElementById("lurl");
lurl.addEventListener("input", function (e) {
    if (lurl.validity.typeMismatch) {
        lurl.setAttribute("aria-invalid", true);
        lurl.setCustomValidity("Need a valid URL for the license server");
        document.getElementById("go").setAttribute("disabled", true);
    } else {
        lurl.setCustomValidity("");
        lurl.setAttribute("aria-invalid", false);
        maybeValidateSubmit();
    }
});

const headers = document.getElementById("headers");
headers.addEventListener("input", function (e) {
    // Check whether the content of the headers field parses as a Python dict.
    var headers_valid = false;
    try {
        pyodide.runPython("test_headers = " + headers.value);
        headers_valid = pyodide.runPython("type(test_headers) is dict");
    } catch (e) {
        // Don't spam the javascript console: there will be multiple errors if the user types this
        // in manually.
    }
    if (headers_valid) {
        headers.setCustomValidity("");
        headers.setAttribute("aria-invalid", false);
        maybeValidateSubmit();
    } else {
        headers.setAttribute("aria-invalid", true);
        headers.setCustomValidity("Need a valid Python dictionary");
        document.getElementById("go").setAttribute("disabled", true);
    }
});


const wvd = document.getElementById("wvd");
wvd.addEventListener("input", function (e) {
    const reader = new FileReader();
    reader.onload = (e) => {
        let octets = new Uint8Array(e.target.result);
        // check that octets.startsWith(b'WVD...')
        if (octets.length > 50 &&
            octets[0] == 'W'.charCodeAt(0) &&
            octets[1] == 'V'.charCodeAt(0) &&
            octets[2] == 'D'.charCodeAt(0)) {
            wvd_b64 = btoa(String.fromCodePoint(...octets));
            wvd.setCustomValidity("");
            wvd.setAttribute("aria-invalid", false);
            maybeValidateSubmit();
        } else {
            wvd.setAttribute("aria-invalid", true);
            wvd.setCustomValidity("Need a CDM in WVD format");
            document.getElementById("go").setAttribute("disabled", true);
        }
    };
    reader.readAsArrayBuffer(wvd.files[0]);
});
