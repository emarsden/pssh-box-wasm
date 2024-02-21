import init, { fetch_pssh_data, code_version } from "../pkg/pssh_box_wasm.js";
init().then(() => {
    document.getElementById("version").innerHTML = code_version();
});

document.getElementById("go").addEventListener("click", function(e) {
    e.preventDefault();
    e.target.style.cursor = "wait";
    let out = document.getElementById("output");
    let url = document.getElementById("url").value.trim();
    fetch_pssh_data(url)
        .then((html) => {
            out.innerHTML = "<strong>PSSH data</strong><br>" + html;
            out.style.backgroundColor = "#CCC";
        })
        .catch((e) => {
            out.innerHTML = "<img src='../img/error.svg' style='width:1em'>&nbsp;" +
                e.toString()
                .replace("Error:", "<strong>Error</strong>:")
                .replace("\n", "<br>");
            out.style.backgroundColor = "rgba(250, 10, 10, 0.2)";
        });
    e.target.style.cursor = "auto";
});
