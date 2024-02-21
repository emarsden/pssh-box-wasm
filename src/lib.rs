//! lib.rs -- WASM code for parsing/printing PSSH box

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, Response};
use url::Url;
use html_escape::encode_text;
use pssh_box::{from_base64, from_hex, from_buffer, find_iter};
use pssh_box::{PsshBox, PsshBoxVec, DRMKeyId, PsshData, ToBytes};


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
    console_error_panic_hook::set_once();
    String::from(pssh_box::version())
}

fn psshboxes_to_html(boxes: &PsshBoxVec) -> String {
    let mut out = String::from("");
    for pssh in boxes.iter() {
        out += "<table>";
        out += &format!("  <tr><td style='width:12em' id='boxversion'>PSSH Box version</td><td>{}</td></tr>\n",
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
    }
    out
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


#[wasm_bindgen]
pub fn generate_widevine_pssh_b64(
    kids_jsval: JsValue, // array of strings
    provider: &str,
    content_id: &str,
    policy: &str) -> Result<String, JsError>
{
    console_error_panic_hook::set_once();

    if hex::decode(content_id).is_err() {
        return Err(PsshBoxWasmError::InvalidHex(String::from("content_id")).into());
    }
    let mut pssh = PsshBox::new_widevine();
    let kids: Vec<String> = serde_wasm_bindgen::from_value(kids_jsval)?;
    for kid_string in &kids {
        let kid = DRMKeyId::try_from(&kid_string as &str)
            .map_err(|_| PsshBoxWasmError::InvalidKeyId(format!("{kid_string:?}")))?;
        pssh.add_key_id(kid);
    }
    if let PsshData::Widevine(ref mut pd) = pssh.pssh_data {
        if !provider.is_empty() {
            pd.provider = Some(String::from(provider));
        }
        if !policy.is_empty() {
            pd.policy = Some(String::from(policy));
        }
        if !content_id.is_empty() {
            pd.content_id = Some(content_id.into());
        }
        // We include the key ids twice, in case some consumers only look at the PSSH data for them
        // and ignore the box header.
        for kid_string in &kids {
            let kid = DRMKeyId::try_from(&kid_string as &str)
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
    let mut opts = RequestInit::new();
    opts.method("GET");
    let request = Request::new_with_str_and_init(url, &opts)
        .or(Err(PsshBoxWasmError::WebSys(String::from("creating Request"))))?;
    request
        .headers()
        .set("Accept", "video/*")
        .map_err(|e| PsshBoxWasmError::WebSys(format!("{e:?}")))?;
    let window = web_sys::window()
            .ok_or(PsshBoxWasmError::WebSys(String::from("web_sys::window")))?;
    let resp_value = JsFuture::from(window.fetch_with_request(&request))
        .await
        .map_err(|e| PsshBoxWasmError::WebSys(format!("{e:?}")))?;
    let resp: Response = resp_value.dyn_into()
        .map_err(|e| PsshBoxWasmError::WebSys(format!("{e:?}")))?;
    if ! resp.ok() {
        return Err(PsshBoxWasmError::Fetching.into());
    }
    let rab = resp.array_buffer()
        .map_err(|e| PsshBoxWasmError::WebSys(format!("{e:?}")))?;
    let segment_buf = JsFuture::from(rab)
        .await
        .map_err(|e| PsshBoxWasmError::WebSys(format!("{e:?}")))?;
    let segment = js_sys::Uint8Array::new(&segment_buf).to_vec();
    let positions: Vec<usize> = find_iter(&segment).collect();
    let mut html = String::new();
    for pos in positions {
        let boxes = from_buffer(&segment[pos..])
            .map_err(|_| PsshBoxWasmError::Other(String::from("extracting PSSH data")))?;
        html += &psshboxes_to_html(&boxes);
    }
    Ok(html)
}
