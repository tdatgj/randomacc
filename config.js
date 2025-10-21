// Encrypted Configuration
// This file contains encrypted API keys and database configuration

// Simple encryption/decryption for config
function encryptConfig(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode ^ keyChar);
    }
    return btoa(result);
}

function decryptConfig(encryptedText, key) {
    try {
        const decoded = atob(encryptedText);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i);
            const keyChar = key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode ^ keyChar);
        }
        return result;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

// Master key for encryption (in production, this should be stored securely)
const MASTER_KEY = 'RANDOMACC_2024_SECURE_KEY_!@#';

// Encrypted configurations
const ENCRYPTED_CONFIGS = {
    // Firebase Config
    firebase: {
        apiKey: encryptConfig('AIzaSyAiD-pBWfSwvmIsWmHI9cCp3wn93CqshQE', MASTER_KEY),
        authDomain: encryptConfig('randomacc-96218.firebaseapp.com', MASTER_KEY),
        projectId: encryptConfig('randomacc-96218', MASTER_KEY),
        storageBucket: encryptConfig('randomacc-96218.firebasestorage.app', MASTER_KEY),
        messagingSenderId: encryptConfig('113176272821', MASTER_KEY),
        appId: encryptConfig('1:113176272821:web:1eabdc70e688db379203fc', MASTER_KEY),
        measurementId: encryptConfig('G-TPQH4G05C2', MASTER_KEY)
    },
    
    // Telegram Bot Config
    telegram: {
        botToken: encryptConfig('8146452946:AAGZEteUFdu4i_6XuisJS3M0MaaNal3njRw', MASTER_KEY),
        chatId: encryptConfig('-4887423118', MASTER_KEY)
    },
    
    // Bank Config
    bank: {
        accountNumber: encryptConfig('0363064356', MASTER_KEY),
        bankName: encryptConfig('VPBank', MASTER_KEY)
    }
};

// Function to get decrypted config
function getConfig(section, key) {
    const encryptedValue = ENCRYPTED_CONFIGS[section]?.[key];
    if (!encryptedValue) {
        console.error(`Config not found: ${section}.${key}`);
        return null;
    }
    
    const decryptedValue = decryptConfig(encryptedValue, MASTER_KEY);
    if (!decryptedValue) {
        console.error(`Failed to decrypt: ${section}.${key}`);
        return null;
    }
    
    return decryptedValue;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getConfig, encryptConfig, decryptConfig };
}
