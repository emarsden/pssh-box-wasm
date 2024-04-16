import init, { fetch_pssh_data, code_version } from "../pkg/pssh_box_wasm.js";
init().then(() => {
    document.getElementById("version").innerHTML = code_version();
});

document.getElementById("go").addEventListener("click", function(e) {
    e.preventDefault();
    e.target.style.cursor = "wait";
    let url = document.getElementById("url").value.trim();
    let out = document.getElementById("output");
    out.style.visibility = "visible";
    out.scrollIntoView();
    fetch_pssh_data(url)
        .then((html) => {
            out.classList.remove("failed");
            out.innerHTML = "<strong>PSSH data</strong><br>" + html;
        })
        .catch((e) => {
            out.innerHTML = e.toString()
                .replace("Error:", "<strong>Error</strong>:")
                .replace("\n", "<br>");
            out.classList.add("failed");
        });
    e.target.style.cursor = "auto";
});
