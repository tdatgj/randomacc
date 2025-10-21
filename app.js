// Global variables
if (typeof currentUser === 'undefined') {
    var currentUser = null;
}
if (typeof userData === 'undefined') {
    var userData = null;
}

// Initialize app
if (typeof appInitialized === 'undefined') {
    var appInitialized = false;
}

document.addEventListener('DOMContentLoaded', function() {
    if (appInitialized) return;
    console.log('DOM loaded, initializing app...');
    appInitialized = true;
    
    // Wait a bit for DOM to be fully loaded
    setTimeout(() => {
        initializeApp();
    }, 100);
});

// Also check on window load
window.addEventListener('load', function() {
    if (!appInitialized) return;
    console.log('Window loaded, checking login status again...');
    setTimeout(() => {
        checkLoginStatus();
    }, 200);
});

// Initialize Firebase Auth state listener
function initializeApp() {
    // Check login status from localStorage first
    checkLoginStatus();
    
    // Don't use Firebase Auth listener for our custom auth system
    // auth.onAuthStateChanged((user) => {
    //     if (user) {
    //         currentUser = user;
    //         loadUserData();
    //         updateUIForLoggedInUser();
    //     } else {
    //         currentUser = null;
    //         userData = null;
    //         updateUIForLoggedOutUser();
    //     }
    // });

    // Setup form event listeners
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', handleRegister);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    showLoading(true);
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        // For demo purposes, we'll use a simple username/password system
        // In production, you should use Firebase Auth with email/password
        const userDoc = await db.collection('users').where('username', '==', username).get();
        
        if (userDoc.empty) {
            throw new Error('Tài khoản không tồn tại');
        }
        
        const userDocData = userDoc.docs[0].data();
        if (userDocData.password !== password) {
            throw new Error('Mật khẩu không đúng');
        }
        
        // Create a custom token or use a different auth method
        // For now, we'll store user data in localStorage
        const userDataToStore = {
            uid: userDoc.docs[0].id,
            username: username,
            ...userDocData
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userDataToStore));
        
        showToast('Đăng nhập thành công!', 'success');
        
        // Update global userData
        userData = userDataToStore;
        
        // Update UI
        updateUIForLoggedInUser();
        showPage('home');
        
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    showLoading(true);
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        showToast('Mật khẩu xác nhận không khớp', 'error');
        showLoading(false);
        return;
    }
    
    try {
        // Check if username already exists
        const existingUser = await db.collection('users').where('username', '==', username).get();
        
        if (!existingUser.empty) {
            throw new Error('Username đã tồn tại');
        }
        
        // Create new user
        const userData = {
            username: username,
            password: password,
            balance: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            transactions: []
        };
        
        await db.collection('users').add(userData);
        
        showToast('Đăng ký thành công!', 'success');
        showPage('login');
        
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Load user data
async function loadUserData() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        userData = JSON.parse(storedUser);
        return;
    }
    
    if (currentUser) {
        try {
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (userDoc.exists) {
                userData = userDoc.data();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
}

// Check if user is logged in on page load
function checkLoginStatus() {
    const storedUser = localStorage.getItem('currentUser');
    console.log('Checking login status...', storedUser ? 'User found in localStorage' : 'No user in localStorage');
    
    if (storedUser) {
        try {
            userData = JSON.parse(storedUser);
            currentUser = { uid: userData.uid || 'temp' }; // Set currentUser for compatibility
            console.log('User data loaded:', userData.username);
            
            // Force update UI immediately
            setTimeout(async () => {
                await updateUIForLoggedInUser();
                console.log('UI updated for logged in user');
            }, 50);
            
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('currentUser');
            userData = null;
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    } else {
        userData = null;
        currentUser = null;
        updateUIForLoggedOutUser();
    }
}

// Update UI for logged in user
async function updateUIForLoggedInUser() {
    console.log('Updating UI for logged in user...');
    
    try {
        // Hide auth buttons and show user menu
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        
        // Update username and balance
        if (userData && userData.username) {
            const userNameElement = document.getElementById('user-name');
            const userBalanceElement = document.getElementById('user-balance-display');
            
            if (userNameElement) {
                userNameElement.textContent = userData.username;
                console.log('Username updated:', userData.username);
            }
            
            if (userBalanceElement) {
                userBalanceElement.textContent = (userData.balance || 0).toLocaleString() + ' VNĐ';
                console.log('Balance updated:', userData.balance);
            }
        }
        
        // Update profile page if it's visible
        const profilePage = document.getElementById('profile-page');
        if (profilePage && profilePage.classList.contains('active')) {
            await updateProfilePage();
        }
        
        console.log('UI updated successfully for logged in user');
    } catch (error) {
        console.error('Error updating UI for logged in user:', error);
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    document.getElementById('auth-buttons').style.display = 'flex';
    document.getElementById('user-menu').style.display = 'none';
}

// Show page
async function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId + '-page').classList.add('active');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Load page-specific content
    switch(pageId) {
        case 'buy':
            loadAccounts();
            break;
        case 'profile':
            await updateProfilePage();
            break;
        case 'deposit':
            // Reset deposit form
            document.getElementById('deposit-amount').value = '';
            document.getElementById('qr-section').style.display = 'none';
            break;
    }
}

// Load accounts for sale
async function loadAccounts() {
    const accountGrid = document.getElementById('account-grid');
    accountGrid.innerHTML = '<div class="loading">Đang tải...</div>';
    
    try {
        // Load accounts from Firebase
        const accountsSnapshot = await db.collection('gameAccounts').where('status', '==', 'available').get();
        
        if (accountsSnapshot.empty) {
            accountGrid.innerHTML = '<div class="error">Không có tài khoản nào có sẵn</div>';
            return;
        }
        
        // Group accounts by type
        const accountTypes = {
            '9k': { name: 'Acc Roblox 9k', price: 9000, image: 'acc9k.jpg', count: 0 },
            '15k': { name: 'Acc Roblox 15k', price: 15000, image: 'acc15k.jpg', count: 0 },
            '55k': { name: 'Acc Roblox 55k', price: 55000, image: 'acc55k.jpg', count: 0 }
        };
        
        accountsSnapshot.forEach(doc => {
            const data = doc.data();
            const name = data.name;
            
            if (name.includes('9k')) {
                accountTypes['9k'].count++;
            } else if (name.includes('15k')) {
                accountTypes['15k'].count++;
            } else if (name.includes('55k')) {
                accountTypes['55k'].count++;
            }
        });
        
        // Display account types
        accountGrid.innerHTML = Object.values(accountTypes).map(type => `
            <div class="account-card">
                <div class="account-image">
                    <img src="${type.image}" alt="${type.name}" onerror="this.src='default-account.jpg'">
                </div>
                <div class="account-header">
                    <h3>${type.name}</h3>
                    <div class="account-price">${type.price.toLocaleString()} VNĐ</div>
                </div>
                <div class="account-details">
                    <p><strong>Còn lại:</strong> ${type.count} tài khoản</p>
                </div>
                <button onclick="buyAccountType('${type.name}', ${type.price}, '${type.image}')" class="btn btn-primary btn-full" ${type.count === 0 ? 'disabled' : ''}>
                    ${type.count === 0 ? 'Hết hàng' : 'Mua ngay'}
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading accounts:', error);
        accountGrid.innerHTML = '<div class="error">Lỗi tải dữ liệu</div>';
        showToast('Lỗi tải danh sách tài khoản', 'error');
    }
}

// Buy account by type
async function buyAccountType(accountName, price, image) {
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
        showToast('Vui lòng đăng nhập để mua tài khoản', 'error');
        showPage('login');
        return;
    }
    
    const currentUserData = JSON.parse(storedUser);
    
    if (currentUserData.balance < price) {
        showToast('Số dư không đủ. Vui lòng nạp thêm tiền.', 'error');
        showPage('deposit');
        return;
    }
    
    if (confirm(`Bạn có chắc muốn mua ${accountName} với giá ${price.toLocaleString()} VNĐ?`)) {
        showLoading(true);
        
        try {
            // Find an available account of this type
            const accountsSnapshot = await db.collection('gameAccounts')
                .where('name', '==', accountName)
                .where('status', '==', 'available')
                .limit(1)
                .get();
            
            if (accountsSnapshot.empty) {
                showToast('Tài khoản này đã hết hàng!', 'error');
                loadAccounts(); // Refresh to update counts
                return;
            }
            
            const accountDoc = accountsSnapshot.docs[0];
            const accountId = accountDoc.id;
            
            // Update user balance
            const newBalance = currentUserData.balance - price;
            
            // Get account data for credentials
            const accountData = accountDoc.data();
            
            // Decrypt credentials for transaction
            const decryptedUsername = decrypt(accountData.username, 13);
            const decryptedPassword = decrypt(accountData.password, 13);
            
            // Add transaction with decrypted credentials
            const transaction = {
                type: 'purchase',
                amount: -price,
                description: `Mua ${accountName}`,
                timestamp: new Date().toISOString(),
                accountId: accountId,
                username: decryptedUsername,
                password: decryptedPassword
            };
            
            currentUserData.balance = newBalance;
            currentUserData.transactions = currentUserData.transactions || [];
            currentUserData.transactions.push(transaction);
            
            // Find user document by username and update
            const userQuery = await db.collection('users').where('username', '==', currentUserData.username).get();
            if (userQuery.empty) {
                throw new Error('Không tìm thấy user trong database');
            }
            
            const userDoc = userQuery.docs[0];
            await db.collection('users').doc(userDoc.id).update({
                balance: newBalance,
                transactions: currentUserData.transactions
            });
            
            // Update account status to sold
            await db.collection('gameAccounts').doc(accountId).update({
                status: 'sold',
                soldTo: currentUserData.username,
                soldAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUserData));
            
            // Update global userData
            userData = currentUserData;
            
            // Show success message with decrypted credentials
            showToast(`Mua tài khoản thành công! Username: ${decryptedUsername}, Password: ${decryptedPassword}`, 'success');
            await updateProfilePage();
            
            // Reload page to refresh data
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            showToast('Lỗi khi mua tài khoản', 'error');
        } finally {
            showLoading(false);
        }
    }
}

// Buy account (legacy function for compatibility)
async function buyAccount(accountId, price) {
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
        showToast('Vui lòng đăng nhập để mua tài khoản', 'error');
        showPage('login');
        return;
    }
    
    const currentUserData = JSON.parse(storedUser);
    
    if (currentUserData.balance < price) {
        showToast('Số dư không đủ. Vui lòng nạp thêm tiền.', 'error');
        showPage('deposit');
        return;
    }
    
    if (confirm(`Bạn có chắc muốn mua tài khoản này với giá ${price.toLocaleString()} VNĐ?`)) {
        showLoading(true);
        
        try {
            // Update user balance
            const newBalance = currentUserData.balance - price;
            
            // Add transaction
            const transaction = {
                type: 'purchase',
                amount: -price,
                description: `Mua tài khoản Roblox #${accountId}`,
                timestamp: new Date().toISOString(),
                accountId: accountId
            };
            
            currentUserData.balance = newBalance;
            currentUserData.transactions = currentUserData.transactions || [];
            currentUserData.transactions.push(transaction);
            
            // Find user document by username and update
            const userQuery = await db.collection('users').where('username', '==', currentUserData.username).get();
            if (userQuery.empty) {
                throw new Error('Không tìm thấy user trong database');
            }
            
            const userDoc = userQuery.docs[0];
            await db.collection('users').doc(userDoc.id).update({
                balance: newBalance,
                transactions: currentUserData.transactions
            });
            
            // Update account status to sold
            await db.collection('gameAccounts').doc(accountId).update({
                status: 'sold',
                soldTo: currentUserData.username,
                soldAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUserData));
            
            // Update global userData
            userData = currentUserData;
            
            // Show success message with decrypted credentials
            showToast(`Mua tài khoản thành công! Username: ${decryptedUsername}, Password: ${decryptedPassword}`, 'success');
            await updateProfilePage();
            
        } catch (error) {
            showToast('Lỗi khi mua tài khoản', 'error');
        } finally {
            showLoading(false);
        }
    }
}

// Generate QR code for deposit
async function generateQR() {
    const amount = document.getElementById('deposit-amount').value;
    
    if (!amount || amount < 10000) {
        showToast('Số tiền tối thiểu là 10,000 VNĐ', 'error');
        return;
    }
    
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
        showToast('Vui lòng đăng nhập để nạp tiền', 'error');
        showPage('login');
        return;
    }
    
    // Parse user data from localStorage
    const currentUserData = JSON.parse(storedUser);
    
    const qrUrl = `https://qr.sepay.vn/img?acc=0363064356&bank=VPBank&amount=${amount}&des=${currentUserData.username}`;
    
    document.getElementById('qr-image').src = qrUrl;
    document.getElementById('payment-amount').textContent = parseInt(amount).toLocaleString();
    document.getElementById('payment-description').textContent = currentUserData.username;
    document.getElementById('qr-section').style.display = 'block';
    
    // Check if user already has a pending deposit request
    try {
        const existingRequest = await db.collection('depositRequests')
            .where('username', '==', currentUserData.username)
            .where('status', '==', 'pending')
            .get();
        
        if (!existingRequest.empty) {
            showToast('Bạn đã có yêu cầu nạp tiền đang chờ duyệt. Vui lòng chờ admin xử lý trước khi tạo yêu cầu mới.', 'warning');
            return;
        }
        
        // Create deposit request
        await db.collection('depositRequests').add({
            username: currentUserData.username,
            amount: parseInt(amount),
            description: currentUserData.username,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });
        
        showToast('QR Code đã được tạo. Vui lòng chuyển khoản theo thông tin bên dưới.', 'success');
    } catch (error) {
        console.error('Error creating deposit request:', error);
        showToast('QR Code đã được tạo nhưng có lỗi khi lưu yêu cầu nạp tiền', 'warning');
    }
}

// Update profile page
async function updateProfilePage() {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
        document.getElementById('profile-page').innerHTML = '<div class="error">Vui lòng đăng nhập</div>';
        return;
    }
    
    const currentUserData = JSON.parse(storedUser);
    
    // Load fresh data from database
    try {
        const userQuery = await db.collection('users').where('username', '==', currentUserData.username).get();
        if (!userQuery.empty) {
            const freshUserData = userQuery.docs[0].data();
            
            // Update localStorage with fresh data
            localStorage.setItem('currentUser', JSON.stringify(freshUserData));
            userData = freshUserData;
            
            // Update UI with fresh data
            document.getElementById('profile-username').textContent = freshUserData.username;
            document.getElementById('profile-balance').textContent = (freshUserData.balance || 0).toLocaleString();
            
                   // Update transaction history (sort by newest first)
                   const transactionHistory = document.getElementById('transaction-history');
                   const transactions = (freshUserData.transactions || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                   
                   if (transactions.length === 0) {
                       transactionHistory.innerHTML = '<p>Chưa có giao dịch nào</p>';
                   } else {
                       transactionHistory.innerHTML = transactions.map(transaction => {
                    const isPurchase = transaction.type === 'purchase';
                    const amountClass = transaction.amount > 0 ? 'positive' : 'negative';
                
                    return `
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <p><strong>${transaction.description}</strong></p>
                                <p class="transaction-time">${new Date(transaction.timestamp).toLocaleString('vi-VN')}</p>
                                ${isPurchase && transaction.username ? `
                                    <div class="purchase-info">
                                        <p><strong>Username:</strong> ${transaction.username}</p>
                                        <p><strong>Password:</strong> ${transaction.password}</p>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="transaction-amount ${amountClass}">
                                ${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()} VNĐ
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } else {
               // Fallback to localStorage data if database query fails
               document.getElementById('profile-username').textContent = currentUserData.username;
               document.getElementById('profile-balance').textContent = (currentUserData.balance || 0).toLocaleString();
               
               const transactionHistory = document.getElementById('transaction-history');
               const transactions = (currentUserData.transactions || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
               
               if (transactions.length === 0) {
                   transactionHistory.innerHTML = '<p>Chưa có giao dịch nào</p>';
               } else {
                   transactionHistory.innerHTML = transactions.map(transaction => {
                    const isPurchase = transaction.type === 'purchase';
                    const amountClass = transaction.amount > 0 ? 'positive' : 'negative';
                
                    return `
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <p><strong>${transaction.description}</strong></p>
                                <p class="transaction-time">${new Date(transaction.timestamp).toLocaleString('vi-VN')}</p>
                                ${isPurchase && transaction.username ? `
                                    <div class="purchase-info">
                                        <p><strong>Username:</strong> ${transaction.username}</p>
                                        <p><strong>Password:</strong> ${transaction.password}</p>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="transaction-amount ${amountClass}">
                                ${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()} VNĐ
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    } catch (error) {
        console.error('Error loading fresh user data:', error);
           // Fallback to localStorage data
           document.getElementById('profile-username').textContent = currentUserData.username;
           document.getElementById('profile-balance').textContent = (currentUserData.balance || 0).toLocaleString();
           
           const transactionHistory = document.getElementById('transaction-history');
           const transactions = (currentUserData.transactions || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
           
           if (transactions.length === 0) {
               transactionHistory.innerHTML = '<p>Chưa có giao dịch nào</p>';
           } else {
               transactionHistory.innerHTML = transactions.map(transaction => {
                const isPurchase = transaction.type === 'purchase';
                const amountClass = transaction.amount > 0 ? 'positive' : 'negative';
            
                return `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <p><strong>${transaction.description}</strong></p>
                            <p class="transaction-time">${new Date(transaction.timestamp).toLocaleString('vi-VN')}</p>
                            ${isPurchase && transaction.username ? `
                                <div class="purchase-info">
                                    <p><strong>Username:</strong> ${transaction.username}</p>
                                    <p><strong>Password:</strong> ${transaction.password}</p>
                                </div>
                            ` : ''}
                        </div>
                        <div class="transaction-amount ${amountClass}">
                            ${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()} VNĐ
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    userData = null;
    currentUser = null;
    updateUIForLoggedOutUser();
    showPage('home');
    showToast('Đã đăng xuất', 'success');
}

// Show loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// Show account credentials modal
function showAccountCredentials(accountId, gameUsername, gamePassword) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🎮 Thông tin tài khoản game</h2>
                <button onclick="closeModal()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="credentials-box">
                    <h3>Acc Roblox #${accountId}</h3>
                    <div class="credential-item">
                        <label>Username:</label>
                        <div class="credential-value">
                            <input type="text" value="${gameUsername}" readonly id="username-${accountId}">
                            <button onclick="copyToClipboard('username-${accountId}')" class="copy-btn">Copy</button>
                        </div>
                    </div>
                    <div class="credential-item">
                        <label>Password:</label>
                        <div class="credential-value">
                            <input type="password" value="${gamePassword}" readonly id="password-${accountId}">
                            <button onclick="copyToClipboard('password-${accountId}')" class="copy-btn">Copy</button>
                        </div>
                    </div>
                </div>
                <div class="warning-box">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p><strong>Lưu ý quan trọng:</strong> Vui lòng lưu thông tin này vào nơi an toàn. Thông tin chỉ hiển thị 1 lần duy nhất!</p>
                </div>
                <div class="modal-actions">
                    <button onclick="closeModal()" class="btn btn-primary">Đã lưu thông tin</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
}

// Copy to clipboard
function copyToClipboard(inputId) {
    const input = document.getElementById(inputId);
    input.select();
    input.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        showToast('Đã copy vào clipboard!', 'success');
    } catch (err) {
        showToast('Không thể copy, vui lòng copy thủ công', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.getElementById('toast-container').removeChild(toast);
        }, 300);
    }, 3000);
}

// Switch payment method
function switchPaymentMethod(method) {
    // Update tab styles
    document.querySelectorAll('.method-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.payment-method').forEach(method => method.classList.remove('active'));
    
    if (method === 'bank') {
        document.querySelector('[onclick="switchPaymentMethod(\'bank\')"]').classList.add('active');
        document.getElementById('bank-method').classList.add('active');
    } else if (method === 'card') {
        document.querySelector('[onclick="switchPaymentMethod(\'card\')"]').classList.add('active');
        document.getElementById('card-method').classList.add('active');
    }
}

// Calculate card discount
function calculateCardDiscount() {
    const cardAmount = parseInt(document.getElementById('card-amount').value);
    
    if (!cardAmount) {
        document.getElementById('card-value').textContent = '0 VNĐ';
        document.getElementById('discount-amount').textContent = '0 VNĐ';
        document.getElementById('final-amount').textContent = '0 VNĐ';
        return;
    }
    
    // Calculate discount rate
    let discountRate = 0;
    if (cardAmount === 10000) {
        discountRate = 0.09; // 9%
    } else if (cardAmount >= 20000) {
        discountRate = 0.12; // 12%
    }
    
    const discountAmount = Math.floor(cardAmount * discountRate);
    const finalAmount = cardAmount - discountAmount;
    
    document.getElementById('card-value').textContent = cardAmount.toLocaleString() + ' VNĐ';
    document.getElementById('discount-amount').textContent = discountAmount.toLocaleString() + ' VNĐ';
    document.getElementById('final-amount').textContent = finalAmount.toLocaleString() + ' VNĐ';
}

// Submit card deposit
async function submitCardDeposit() {
    const cardAmount = parseInt(document.getElementById('card-amount').value);
    const cardType = document.getElementById('card-type').value;
    const cardSerial = document.getElementById('card-serial').value;
    const cardCode = document.getElementById('card-code').value;
    
    if (!cardAmount || !cardSerial || !cardCode) {
        showToast('Vui lòng điền đầy đủ thông tin thẻ', 'error');
        return;
    }
    
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
        showToast('Vui lòng đăng nhập để nạp tiền', 'error');
        showPage('login');
        return;
    }
    
    const userData = JSON.parse(storedUser);
    
    // Calculate discount
    let discountRate = 0;
    if (cardAmount === 10000) {
        discountRate = 0.09; // 9%
    } else if (cardAmount >= 20000) {
        discountRate = 0.12; // 12%
    }
    
    const discountAmount = Math.floor(cardAmount * discountRate);
    const finalAmount = cardAmount - discountAmount;
    
    if (confirm(`Xác nhận nạp thẻ ${cardType} ${cardAmount.toLocaleString()} VNĐ?\nSố tiền nhận được: ${finalAmount.toLocaleString()} VNĐ`)) {
        showLoading(true);
        
        try {
            // Create card deposit request
            const cardData = {
                username: userData.username,
                cardAmount: cardAmount,
                cardType: cardType,
                cardSerial: cardSerial,
                cardCode: cardCode,
                discountAmount: discountAmount,
                finalAmount: finalAmount,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('cardDepositRequests').add(cardData);
            
            // Send to Telegram immediately
            try {
                await sendCardToTelegram(cardData);
                console.log('Card information sent to Telegram');
            } catch (telegramError) {
                console.error('Failed to send to Telegram:', telegramError);
                // Don't fail the whole operation if Telegram fails
            }
            
            showToast('Yêu cầu nạp thẻ đã được gửi. Vui lòng chờ admin duyệt.', 'success');
            
            // Clear form
            document.getElementById('card-amount').value = '';
            document.getElementById('card-serial').value = '';
            document.getElementById('card-code').value = '';
            calculateCardDiscount();
            
        } catch (error) {
            showToast('Lỗi gửi yêu cầu nạp thẻ: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }
}
