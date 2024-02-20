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


// Inspired by https://oliverjam.es/articles/better-native-form-validation
function initValidation(form) {
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", () => {
        if (!form.checkValidity()) {
            event.preventDefault();
        }
    })

    let field = document.getElementById("url");
    field.setAttribute("aria-invalid", false);
    const helpBox = document.createElement("small");
    const helpId = field.id + "Helper";
    helpBox.setAttribute("id", helpId);
    field.setAttribute("aria-describedby", helpId);
    field.insertAdjacentElement("afterend", helpBox);
    field.addEventListener("invalid", () => {
        field.setAttribute("aria-invalid", true);
        helpBox.textContent = getMessage(field) || field.validationMessage;
    })
    
    field.addEventListener("blur", () => {
        field.checkValidity();
    })
    
    field.addEventListener("input", () => {
        if (field.checkValidity()) {
            field.setAttribute("aria-invalid", false);
            helpBox.textContent = "";
        }
    });
}

function getMessage(field) {
    const validity = field.validity;
    if (validity.valueMissing) return `Please enter your ${field.name || field.id}`;
    if (validity.typeMismatch) return `Please enter a valid ${field.type}`;
}

document.addEventListener("DOMContentLoaded", function () {
   const form = document.querySelector("form");
   initValidation(form);
})
