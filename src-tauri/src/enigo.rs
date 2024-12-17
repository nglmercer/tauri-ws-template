use enigo::{
    Direction::{Click, Press, Release},
    Enigo, Key, Keyboard, Settings
};
async fn enigo_test() {
    env_logger::try_init().ok();
    thread::sleep(Duration::from_secs(5));
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    // write text
    enigo
        .text("Hello World! here is a lot of text  ❤️")
        .unwrap();

    // select all
    enigo.key(Key::Control, Press).unwrap();
    enigo.key(Key::Unicode('a'), Click).unwrap();
    enigo.key(Key::Control, Release).unwrap();

}
fn get_keys_by_platform() -> HashMap<String, Vec<String>> {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    
    // Ejemplo de keys comunes por plataforma
    let mut platform_keys = HashMap::new();
    
    #[cfg(target_os = "windows")]
    {
        platform_keys.insert("windows".to_string(), vec![
            "VK_RETURN".to_string(),
            "VK_SHIFT".to_string(),
            "VK_CONTROL".to_string(),
            "VK_MENU".to_string(), // Alt key
            "VK_ESCAPE".to_string()
        ]);
    }
    
    #[cfg(target_os = "macos")]
    {
        platform_keys.insert("macos".to_string(), vec![
            "kVK_Return".to_string(),
            "kVK_Shift".to_string(),
            "kVK_Command".to_string(),
            "kVK_Option".to_string(),
            "kVK_Escape".to_string()
        ]);
    }
    
    #[cfg(target_os = "linux")]
    {
        platform_keys.insert("linux".to_string(), vec![
            "Return".to_string(),
            "Shift".to_string(),
            "Control".to_string(),
            "Alt".to_string(),
            "Escape".to_string()
        ]);
    }
    
    platform_keys
}
fn execute_key_combinations(combinations: &[(Option<Key>, Key, Option<u64>)]) {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    for (modifier, main_key, delay) in combinations {
        // Press modifier key if exists
        if let Some(mod_key) = modifier {
            enigo.key(mod_key.clone(), Press).unwrap();
        }

        // Press and release the main key
        enigo.key(main_key.clone(), Click).unwrap();

        // Release modifier key if exists
        if let Some(mod_key) = modifier {
            enigo.key(mod_key.clone(), Release).unwrap();
        }

        // Add delay if specified
        if let Some(ms) = delay {
            thread::sleep(Duration::from_millis(*ms));
        }
    }
}


fn example_usage() {
    enigo_test();
    let combinations = vec![
        (Some(Key::Control), Key::Unicode('a'), Some(50)),  // Select all
        (Some(Key::Control), Key::Unicode('c'), Some(50)),  // Copy
    ];
    
    execute_key_combinations(&combinations);
}
