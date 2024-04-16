import init, { pssh_base64_to_html, pssh_hex_to_html, code_version } from "../pkg/pssh_box_wasm.js";
init().then(() => {
    document.getElementById("version").innerHTML = code_version();
});

document.getElementById("go").addEventListener("click", function(e) {
    e.preventDefault();
    let input = document.getElementById("pssh").value.trim();
    let out = document.getElementById("output");
    out.style.visibility = "visible";
    out.scrollIntoView();
    try {
        let decoded;
        if (document.getElementById("fmt_base64").checked) {
            decoded = pssh_base64_to_html(input);
        } else {
            decoded = pssh_hex_to_html(input);
        }
        out.classList.remove("failed");
        out.innerHTML = "<strong>Decoded</strong><br>" + decoded;
    } catch (e) {
        out.innerHTML = e.toString()
            .replace("Error:", "<strong>Error</strong>:")
            .replace("\n", "<br>");
        out.classList.add("failed");
    }
});


const pssh = document.getElementById("pssh");
pssh.addEventListener("input", function (e) {
    if (pssh.validity.patternMismatch) {
        pssh.setAttribute("aria-invalid", true);
        pssh.setCustomValidity("Invalid PSSH format");
        document.getElementById("go").setAttribute("disabled", true);
    } else {
        pssh.setCustomValidity("");
        pssh.setAttribute("aria-invalid", false);
        document.getElementById("go").removeAttribute("disabled");
    }
});

