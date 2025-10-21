// Encrypted Configuration
// This file contains encrypted API keys and database configuration

// Simple XOR cipher for demonstration purposes
function xorEncryptDecrypt(input, key) {
    let output = '';
    for (let i = 0; i < input.length; i++) {
        output += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return output;
}

// Encryption key (should be kept secret and ideally loaded from a secure environment variable)
const ENCRYPTION_KEY = 'supersecretkey'; // DO NOT use a hardcoded key in production

// Encrypted configuration data
const _encryptedConfig = {
    firebase: {
        apiKey: xorEncryptDecrypt('AIzaSyAiD-pBWfSwvmIsWmHI9cCp3wn93CqshQE', ENCRYPTION_KEY),
        authDomain: xorEncryptDecrypt('randomacc-96218.firebaseapp.com', ENCRYPTION_KEY),
        projectId: xorEncryptDecrypt('randomacc-96218', ENCRYPTION_KEY),
        storageBucket: xorEncryptDecrypt('randomacc-96218.firebasestorage.app', ENCRYPTION_KEY),
        messagingSenderId: xorEncryptDecrypt('113176272821', ENCRYPTION_KEY),
        appId: xorEncryptDecrypt('1:113176272821:web:1eabdc70e688db379203fc', ENCRYPTION_KEY),
        measurementId: xorEncryptDecrypt('G-TPQH4G05C2', ENCRYPTION_KEY)
    },
    telegram: {
        botToken: xorEncryptDecrypt('8146452946:AAGZEteUFdu4i_6XuisJS3M0MaaNal3njRw', ENCRYPTION_KEY),
        chatId: xorEncryptDecrypt('-4887423118', ENCRYPTION_KEY)
    },
    bank: {
        accountNumber: xorEncryptDecrypt('0363064356', ENCRYPTION_KEY),
        bankName: xorEncryptDecrypt('VPBank', ENCRYPTION_KEY)
    }
};

// Function to get decrypted configuration values
function getConfig(category, key) {
    if (_encryptedConfig[category] && _encryptedConfig[category][key]) {
        return xorEncryptDecrypt(_encryptedConfig[category][key], ENCRYPTION_KEY);
    }
    console.warn(`Configuration key not found: ${category}.${key}`);
    return null;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getConfig, encryptConfig, decryptConfig };
}
