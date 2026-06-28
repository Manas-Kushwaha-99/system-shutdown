use tokio::process::Command;

#[tauri::command]
async fn schedule_shutdown(seconds: u32) -> Result<String, String> {
    let output = Command::new("shutdown")
        .args(["/s", "/t", &seconds.to_string()])
        .output()
        .await;

    match output {
        Ok(o) if o.status.success() => Ok("Shutdown scheduled".to_string()),
        Ok(o) => Err(format!("Failed: {}", String::from_utf8_lossy(&o.stderr))),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
async fn cancel_shutdown() -> Result<String, String> {
    let output = Command::new("shutdown")
        .args(["/a"])
        .output()
        .await;

    match output {
        Ok(o) if o.status.success() => Ok("Shutdown cancelled".to_string()),
        Ok(o) => Err(format!("Failed: {}", String::from_utf8_lossy(&o.stderr))),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![schedule_shutdown, cancel_shutdown])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
