import init, { code_version } from "../pkg/pssh_box_wasm.js";
init().then(() => {
    document.getElementById("version").innerHTML = code_version();
});

// For content tab support, from https://rwdevelopment.github.io/tabs_js/
const _ = el => [...document.querySelectorAll(el)];
_('[role=tab]')[0].setAttribute('aria-current', true);

_('[role=tab]').forEach(tab=> {
  tab.addEventListener('click', (e) => {
        e.preventDefault();

        !e.target.hasAttribute('aria-current') ?
        e.target.setAttribute('aria-current', true) :
        null;

        _('[role=tab]').forEach(t=> {
          t.hasAttribute('aria-current') && t != e.target ?
          t.removeAttribute('aria-current') :
          null;
        });

        _('[role=tabpanel]').forEach(tp=> {
          _('[role=tabpanel]').indexOf(tp) == _('[role=tab]').indexOf(e.target) ?
          tp.removeAttribute('hidden') :
          tp.setAttribute('hidden', true);
        });

  });
});


const myPackages = ["pycryptodome", "requests", "base64"];
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
pyodide.setDebug(true);

const to_WVD=`
import js
from base64 import b64encode, b64decode
from pywidevine.device import Device, DeviceTypes

cid = b64decode(js.cid.encode())
prk = b64decode(js.prk.encode())
device = Device(client_id=cid,
                private_key=prk,
                type_=DeviceTypes['ANDROID'],
                security_level=3,
                flags=None).dumps()
b64encode(device).decode()
`

const from_WVD=`
import js
from zipfile import ZipFile
from base64 import b64encode, b64decode
from pywidevine.device import Device

wvd = b64decode(js.wvd.encode())
device = Device.loads(wvd)

with ZipFile('device_blobs.zip', 'w') as zf:
    with zf.open('device_client_id_blob', 'w') as f:
        f.write(device.client_id.SerializeToString())

    with zf.open('device_private_key', 'w') as f:
        f.write(device.private_key.export_key(format='PEM'))

    with zf.open('device_info.txt', 'w') as f:
        f.write(str(device).encode())

b64encode(open('device_blobs.zip', 'rb').read()).decode()
`

const b64 = {
    decode: s => Uint8Array.from(atob(s), c => c.charCodeAt(0)),
    encode: b => btoa(String.fromCharCode(...new Uint8Array(b)))
};

function downloadResult(ret, name) {
    console.log("downloadResult on object named " + name + " of length " + ret.length);
    // let blob = new Blob([b64.decode(ret)], {type: "octet/stream"});
    let blob = new Blob([b64.decode(ret)], {type: "application/octet-stream"});
    let blobLink = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.download = name;
    a.href = blobLink;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobLink);
}

document.getElementById("toWVDGo").addEventListener("click", async function(e) {
    e.preventDefault();
    e.target.style.cursor = "wait";
    window.cid = b64.encode(
        (await document.getElementById("cid").files[0].arrayBuffer())
    );
    window.prk = b64.encode(
        (await document.getElementById("prk").files[0].arrayBuffer())
    );
    let result = await pyodide.runPythonAsync(to_WVD);
    downloadResult(result, "device.wvd")
});

document.getElementById("fromWVDGo").addEventListener("click", async function(e) {
    e.preventDefault();
    e.target.style.cursor = "wait";
    window.wvd = b64.encode(
        (await document.getElementById("wvd").files[0].arrayBuffer())
    )
    let result = await pyodide.runPythonAsync(from_WVD);
    downloadResult(result, "device_blobs.zip")
});



// === Playready functions ====

// Create a Playready Device (.prd) file from an ECC private group key and group certificate chain.
//
// See https://github.com/ready-dl/pyplayready/blob/main/pyplayready/main.py#L130
const to_playready_device=`
import js
from base64 import b64encode, b64decode
from Crypto.Random import get_random_bytes
from pyplayready.ecc_key import ECCKey
from pyplayready.bcert import CertificateChain, Certificate
from pyplayready.device import Device

group_certificate = b64decode(js.prgroupcert.encode())
group_key = b64decode(js.prgroupkey.encode())
encryption_key = ECCKey.generate()
signing_key = ECCKey.generate()
certificate_chain = CertificateChain.loads(group_certificate)
group_key = ECCKey.loads(group_key)
new_certificate = Certificate.new_leaf_cert(
    cert_id = get_random_bytes(16),
    security_level = certificate_chain.get_security_level(),
    client_id = get_random_bytes(16),
    signing_key = signing_key,
    encryption_key = encryption_key,
    group_key = group_key,
    parent = certificate_chain
)
certificate_chain.prepend(new_certificate)
device = Device(
    group_certificate=certificate_chain.dumps(),
    encryption_key=encryption_key.dumps(),
    signing_key=signing_key.dumps()
)
print("Playready device: {}".format(device))
prd_bin = device.dumps()
b64encode(prd_bin).decode()
`

const export_playready_device=`
import js
from zipfile import ZipFile
from pyplayready.device import Device
from base64 import b64encode, b64decode

prd_bin = b64decode(js.prdevice.encode())
device = Device.loads(prd_bin)
print("Playready device: " + device.get_name())
with ZipFile('device_blobs.zip', 'w') as zf:
    with zf.open('bgroupcert.dat', 'w') as f:
        f.write(device.group_certificate.dumps())

    with zf.open('zprivencr.dat', 'w') as f:
        f.write(device.encryption_key.dumps())

    with zf.open('zprivsig.dat', 'w') as f:
        f.write(device.signing_key.dumps())
b64encode(open('device_blobs.zip', 'rb').read()).decode()
`

document.getElementById("to_playready_device").addEventListener("click", async function(e) {
    e.preventDefault();
    e.target.style.cursor = "wait";
    window.prgroupcert = b64.encode(
        (await document.getElementById("prgroupcert").files[0].arrayBuffer())
    );
    window.prgroupkey = b64.encode(
        (await document.getElementById("prgroupkey").files[0].arrayBuffer())
    );
    let result = await pyodide.runPythonAsync(to_playready_device);
    console.log("to_playready_device returned result of length " + result.length);
    downloadResult(result, "playready_device.prd")
});

document.getElementById("export_playready_device").addEventListener("click", async function(e) {
    e.preventDefault();
    e.target.style.cursor = "wait";
    window.prdevice = b64.encode(
        (await document.getElementById("prdevice").files[0].arrayBuffer())
    );
    let result = await pyodide.runPythonAsync(export_playready_device);
    downloadResult(result, "device_blobs.zip")
});
