//! lib.rs -- WASM code for parsing/printing PSSH boxes

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, Response};
use url::Url;
use html_escape::encode_text;
use pssh_box::{from_base64, from_hex, from_buffer, find_iter};
use pssh_box::{PsshBox, PsshBoxVec, DRMKeyId, PsshData, ToBytes};
use pssh_box::widevine::widevine_pssh_data::ProtectionScheme;


#[derive(thiserror::Error, Debug)]
#[non_exhaustive]
pub enum PsshBoxWasmError {
    #[error("parse error {0}")]
    Parsing(String),
    #[error("invalid DRM Key ID: {0}")]
    InvalidKeyId(String),
    #[error("invalid Base64 encoding: {0}")]
    InvalidBase64(String),
    #[error("invalid hex encoding: {0}")]
    InvalidHex(String),
    #[error("WebSys error: {0}")]
    WebSys(String),
    #[error("fetching URL")]
    Fetching,
    #[error("{0}")]
    Other(String),
}


#[wasm_bindgen]
pub fn code_version() -> String {
    wasm_log::init(wasm_log::Config::default());
    console_error_panic_hook::set_once();

    String::from(pssh_box::version())
}

fn psshboxes_to_html(boxes: &PsshBoxVec) -> String {
    let mut outputs = Vec::new();
    for pssh in boxes.iter() {
        let mut out = String::from("");
        out += "<table class='wrapping'>";
        out += &format!("  <tr><td style='width:14em'>PSSH in Base64</td><td><tt style='font-size:60%'>{}</tt></td></tr>\n",
                        pssh.clone().to_base64());
        out += &format!("  <tr><td id='boxversion'>PSSH Box version</td><td>{}</td></tr>\n",
                        pssh.version);
        let raw = pssh.system_id.to_string();
        out += &format!("  <tr><td id='systemid' title='{}'>SystemID</td><td>{}</td></tr>\n",
                        "Identifies the DRM system for this pssh box",
                        encode_text(&raw).replace('/', "<br>"));
        for key in &pssh.key_ids {
            let raw = key.to_string();
            out += &format!("  <tr><td id='keyid' title='{}'>Key ID</td><td>{}</td></tr>",
                            "Identifier for a content encryption key",
                            encode_text(&raw));
        }
        let html = match &pssh.pssh_data {
            PsshData::Widevine(d) => encode_text(&format!("{d:?}"))
                .replace("&lt;", "&lt;<br>&nbsp;&nbsp;&nbsp;")
                .replace("&gt;", "<br>&gt;")
                .replace(", ", ",<br>&nbsp;&nbsp;&nbsp;"),
            PsshData::PlayReady(d) => String::from(encode_text(&format!("{d:?}"))),
            PsshData::Irdeto(d) => String::from(encode_text(&format!("{d:?}"))),
            PsshData::WisePlay(d) => String::from(encode_text(&format!("{d:?}"))),
            PsshData::Marlin(d) => String::from(encode_text(&format!("{d:?}"))),
            PsshData::Nagra(d) => String::from(encode_text(&format!("{d:?}"))),
            PsshData::CommonEnc(d) => String::from(encode_text(&format!("{d:?}"))),
            _ => String::from("<unknown PSSH type>"),
        };
        out += &format!("  <tr><td title='{}'>PSSH data</td><td>{html}</td><tr>",
                        "Data that is specific to this DRM system");
        out += &String::from("</table>");
        out += &format!("<p>Condensed format: <tt style='font-size:60%'>{}</tt></p>", encode_text(&pssh.to_string()));
        outputs.push(out);
    }
    outputs.join("\n<div class='flourish'></div>\n")

}

#[wasm_bindgen]
pub fn pssh_hex_to_html(hx: &str) -> Result<String, JsError> {
    console_error_panic_hook::set_once();
    match from_hex(hx) {
        Ok(boxes) => Ok(psshboxes_to_html(&boxes)),
        Err(e) => Err(PsshBoxWasmError::InvalidHex(format!("{e:?}")).into()),
    }
}

#[wasm_bindgen]
pub fn pssh_base64_to_html(b64: &str) -> Result<String, JsError> {
    console_error_panic_hook::set_once();
    match from_base64(b64) {
        Ok(boxes) => Ok(psshboxes_to_html(&boxes)),
        Err(e) => Err(PsshBoxWasmError::InvalidBase64(format!("{e:?}")).into()),
    }
}


// TODO: should probably define a struct to hold all these arguments, or use WidevinePsshData
// directly from javascript.
#[allow(clippy::too_many_arguments)]
#[wasm_bindgen]
pub fn generate_widevine_pssh_b64(
    version: u8,
    kids_jsval: JsValue, // array of strings
    provider: &str,
    content_id: &str,
    policy: &str,
    crypto_period_index: Option<u32>,
    protection_scheme: &str,
    algorithm: Option<i32>) -> Result<String, JsError>
{
    console_error_panic_hook::set_once();

    let mut pssh = PsshBox::new_widevine();
    if version > 1 {
        return Err(PsshBoxWasmError::Other(String::from("version must be 0 or 1")).into());
    }
    pssh.version = version;
    let kids: Vec<String> = serde_wasm_bindgen::from_value(kids_jsval)?;
    for kid_string in &kids {
        let kid = DRMKeyId::try_from(kid_string as &str)
            .map_err(|_| PsshBoxWasmError::InvalidKeyId(format!("{kid_string:?}")))?;
        pssh.add_key_id(kid);
    }
    if let PsshData::Widevine(ref mut pd) = pssh.pssh_data {
        let provider = provider.trim();
        if !provider.is_empty() {
            pd.provider = Some(String::from(provider));
        }
        let content_id = content_id.trim();
        if !content_id.is_empty() {
            if let Ok(ci) = hex::decode(content_id) {
                pd.content_id = Some(ci);
            } else {
                return Err(PsshBoxWasmError::InvalidHex(String::from("content_id")).into());
            }
        }
        let policy = policy.trim();
        if !policy.is_empty() {
            pd.policy = Some(String::from(policy));
        }
        if let Some(cpi) = crypto_period_index {
            pd.crypto_period_index = Some(cpi);
        }
        let protection_scheme = protection_scheme.trim();
        if !protection_scheme.is_empty() {
            if let Some(ps) = ProtectionScheme::from_str_name(protection_scheme) {
                pd.protection_scheme = Some(ps.into());
            } else {
                return Err(PsshBoxWasmError::Other(String::from("invalid protection_scheme")).into());
            }
        }
        if let Some(alg) = algorithm {
            pd.algorithm = Some(alg);
        }
        // We include the key ids twice, in case some consumers only look at the PSSH data for them
        // and ignore the box header.
        for kid_string in &kids {
            let kid = DRMKeyId::try_from(kid_string as &str)
                .map_err(|_| PsshBoxWasmError::InvalidKeyId(format!("{kid_string:?}")))?;
            pd.key_id.push(kid.to_bytes());
        }
    }
    Ok(pssh.to_base64())
}


#[wasm_bindgen]
pub async fn fetch_pssh_data(url: &str) -> Result<String, JsError> {
    match Url::parse(url) {
        Ok(u) => {
            if u.scheme() != "https" {
                return Err(PsshBoxWasmError::Parsing(String::from("URL must be HTTPS")).into());
            }
        },
        Err(e) => {
            return Err(PsshBoxWasmError::Parsing(format!("invalid URL: {e:?}")).into());
        },
    }
    let opts = RequestInit::new();
    opts.set_method("GET");
    let request = Request::new_with_str_and_init(url, &opts)
        .or(Err(PsshBoxWasmError::WebSys(String::from("creating Request"))))?;
    request
        .headers()
        .set("Accept", "video/*")
        .map_err(|e| PsshBoxWasmError::WebSys(format!("{e:?}")))?;
    let window = web_sys::window()
            .ok_or(PsshBoxWasmError::WebSys(String::from("web_sys::window")))?;
    let resp_value = JsFuture::from(window.fetch_with_request(&request)).await
        .map_err(|e| PsshBoxWasmError::WebSys(format!("{e:?}")))?;
    let resp: Response = resp_value.dyn_into()
        .map_err(|e| PsshBoxWasmError::WebSys(format!("{e:?}")))?;
    if ! resp.ok() {
        return Err(PsshBoxWasmError::Fetching.into());
    }
    let rab = resp.array_buffer()
        .map_err(|e| PsshBoxWasmError::WebSys(format!("{e:?}")))?;
    let segment_buf = JsFuture::from(rab).await
        .map_err(|e| PsshBoxWasmError::WebSys(format!("{e:?}")))?;
    let segment = js_sys::Uint8Array::new(&segment_buf).to_vec();
    let positions: Vec<usize> = find_iter(&segment).collect();
    let mut outputs = Vec::new();
    if positions.is_empty() {
        outputs.push(String::from("No PSSH initialization data found."));
    }
    // We need to be careful not to double count PSSH boxes here. The from_buffer() method will read
    // all boxes in the buffer, and they may overlap with boxes at later start positions.
    let mut boxes = PsshBoxVec::new();
    for pos in positions {
        let new_boxes = from_buffer(&segment[pos..])
            .map_err(|_| PsshBoxWasmError::Other(String::from("extracting PSSH data")))?;
        for new in new_boxes {
            if !boxes.contains(&new) {
                boxes.add(new);
            }
        }
    }
    outputs.push(psshboxes_to_html(&boxes));
    outputs.reverse();
    Ok(outputs.join(&String::from("\n<div class='flourish'></div>\n")))
}
