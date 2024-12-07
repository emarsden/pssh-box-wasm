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

// Normally we could load these simply with "micropip.install('pywidevine')". However, pywidevine
// version 1.8.0 depends on pymp4 version 1.4.0, which depends on a very old version of construct,
// v2.8.8, for which a prebuilt wheel is not available on pip. Therefore, we load our packages manually.
const myPackages = [
    "https://files.pythonhosted.org/packages/d6/45/fc303eb433e8a2a271739c98e953728422fa61a3c1f36077a49e395c972e/xmltodict-0.14.2-py2.py3-none-any.whl",
    "https://files.pythonhosted.org/packages/ec/1a/610693ac4ee14fcdf2d9bf3c493370e4f2ef7ae2e19217d7a237ff42367d/packaging-23.2-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/a2/73/a68704750a7679d0b6d3ad7aa8d4da8e14e151ae82e6fee774e6e0d05ec8/urllib3-2.2.1-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/70/8e/0e2d847013cb52cd35b38c009bb167a1a26b2ce6cd6965bf26b47bc0bf44/requests-2.31.0-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/2d/14/d1bf3b7141ad5a42c26e4173a69e3e6529bd92b05bc587c570d28b6a3ce8/pyodide_http-0.2.1-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/c2/e7/a82b05cf63a603df6e68d59ae6a68bf5064484a0718ea5033660af4b54a9/idna-3.6-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/ba/06/a07f096c664aeb9f01624f858c3add0a4e913d6c96257acb4fce61e7de14/certifi-2024.2.2-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/28/76/e6222113b83e3622caa4bb41032d0b1bf785250607392e1b778aca0b8a7d/charset_normalizer-3.3.2-py3-none-any.whl",
    "pycryptodome",
    "https://files.pythonhosted.org/packages/e8/35/4a113189f7138035a21bd255d30dc7bffc77c942c93b7948d2eac2e22429/ECPy-1.2.5-py3-none-any.whl",
    "protobuf",
    "/pssh-box-wasm/pyodide/construct-2.8.8-py2.py3-none-any.whl",
    "https://files.pythonhosted.org/packages/41/9f/60f8a4c8e7767a8c34f5c42428662e03fa3e38ad18ba41fcc5370ee43263/pywidevine-1.8.0-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/aa/a2/27fea39af627c0ce5dbf6108bf969ea8f5fc9376d29f11282a80e3426f1d/pymp4-1.4.0-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/53/71/5d853cf6c3c919c2de67c329f41d3be59468213d95e8ef7b3d4207843475/pyplayready-0.4.4-py3-none-any.whl"
]
let pyodide = await loadPyodide({ packages: myPackages });
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
