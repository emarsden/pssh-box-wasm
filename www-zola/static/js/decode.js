import init, { pssh_base64_to_html, pssh_hex_to_html, code_version } from "../pkg/pssh_box_wasm.js";
init().then(() => {
    document.getElementById("version").innerHTML = code_version();
});

document.getElementById("go").addEventListener("click", function(e) {
    e.preventDefault();
    let input = document.getElementById("pssh").value.trim();
    let out = document.getElementById("output");
    let decoded;
    try {
        if (document.getElementById("fmt_base64").checked) {
            decoded = pssh_base64_to_html(input);
        } else {
            decoded = pssh_hex_to_html(input);
        }
        out.innerHTML = "<strong>Decoded</strong><br>" + decoded;
        out.style.backgroundColor = "#CCC";
    } catch (e) {
        out.innerHTML = "<img src='img/error.svg' style='width:1em'>&nbsp;" + 
            e.toString()
            .replace("Error:", "<strong>Error</strong>:")
            .replace("\n", "<br>");
        out.style.backgroundColor = "rgba(255, 10, 10, 0.2)";
    }
});
