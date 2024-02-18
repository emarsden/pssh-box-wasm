import init, { generate_widevine_pssh_b64, code_version } from "../pkg/pssh_box_wasm.js";
init().then(() => {
    document.getElementById("version").innerHTML = code_version();
});

document.getElementById("go").addEventListener("click", function(e) {
    e.preventDefault();
    let kid = document.getElementById("kid").value.trim();
    let provider = document.getElementById("provider").value.trim();
    let contentid = document.getElementById("contentid").value.trim();
    let policy = document.getElementById("policy").value.trim();
    let crypto_period_index = document.getElementById("crypto_period_index").value.trim();
    let protection_scheme = document.querySelector("input[name='protection_scheme']:checked").value;
    let out = document.getElementById("output");
    try {
        let encoded = generate_widevine_pssh_b64([kid], provider, contentid, policy);
        out.innerHTML = "<h3>Generated PSSH in Base 64</h3>" + "<p>" + encoded;
        out.style.backgroundColor = "#CCC";
    } catch (e) {
        out.innerHTML = "<img src='img/error.svg' style='width:1em'>&nbsp;" +
            e.toString()
            .replace("Error:", "<strong>Error</strong>:")
            .replace("\n", "<br>");
        out.style.backgroundColor = "rgba(255, 10, 10, 0.2)";
    }
});

// Inspired by https://oliverjam.es/articles/better-native-form-validation
//
// TODO: also check https://www.jsdelivr.com/package/npm/pristinejs
function initValidation(form) {
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", () => {
        if (!form.checkValidity()) {
            event.preventDefault();
        }
    })
    
    const fields = Array.from(form.elements);
    fields.forEach(field => {
        if (!(field.type == "radio")) {
            field.setAttribute("aria-invalid", false);
            const helpBox = document.createElement("small");
            const helpId = field.id + "Helper";
            helpBox.setAttribute("id", helpId);
            field.setAttribute("aria-describedby", helpId);
            field.insertAdjacentElement("afterend", helpBox);
            field.addEventListener("invalid", () => {
                field.setAttribute("aria-invalid", true);
                const message = getMessage(field);
                helpBox.textContent = message || field.validationMessage;
            })
            
            field.addEventListener("blur", () => {
                field.checkValidity();
            })
            
            field.addEventListener("input", () => {
                const valid = field.checkValidity();
                if (valid) {
                    field.setAttribute("aria-invalid", false);
                    helpBox.textContent = "";
                }
            });
            
            // if you don't want to re-validate as the user types
            // field.addEventListener("input", () => {
            //   input.setAttribute("aria-invalid", false);
            //   errorBox.textContent = "";
            // })
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
