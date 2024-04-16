import init, { generate_widevine_pssh_b64, code_version } from "../pkg/pssh_box_wasm.js";
init().then(() => {
    document.getElementById("version").innerHTML = code_version();
});

document.getElementById("go").addEventListener("click", function(e) {
    e.preventDefault();
    const kid = document.getElementById("kid").value.trim();
    const version_str = document.querySelector("input[name='version']:checked").value;
    const provider = document.getElementById("provider").value.trim();
    const contentid = document.getElementById("contentid").value.trim();
    const policy = document.getElementById("policy").value.trim();
    const crypto_period_idx_str = document.getElementById("crypto_period_index").value.trim();
    var protection_scheme = document.querySelector("input[name='protection_scheme']:checked").value;
    const algorithm_str = document.querySelector("input[name='algorithm']:checked").value;
    let out = document.getElementById("output");
    out.style.visibility = "visible";
    out.scrollIntoView();
    try {
        let version = 0;
        if (version_str === "1") {
            version = 1;
        }
        let cpi = null;  // maps to None in Rust
        if (crypto_period_idx_str.length > 0) {
            cpi = Number(crypto_period_idx_str);
        }
        if (protection_scheme === "unspecified") {
            protection_scheme = "";
        }
        let algorithm = null;
        if (algorithm_str === "0") {
            algorithm = 0;
        } else if (algorithm_str === "1") {
            algorithm = 1;
        }
        let encoded = generate_widevine_pssh_b64(version, [kid], provider, contentid, policy,
                                                 cpi, protection_scheme, algorithm);
        out.classList.remove("failed");
        out.innerHTML = "<h3>Generated PSSH in Base 64</h3>" + "<p>" + encoded;
    } catch (e) {
        out.innerHTML = e.toString()
            .replace("Error:", "<strong>Error</strong>:")
            .replace("\n", "<br>");
        out.classList.add("failed");
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
        if (field.pattern && !(field.type == "radio")) {
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
