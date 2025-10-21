// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAiD-pBWfSwvmIsWmHI9cCp3wn93CqshQE",
    authDomain: "randomacc-96218.firebaseapp.com",
    projectId: "randomacc-96218",
    storageBucket: "randomacc-96218.firebasestorage.app",
    messagingSenderId: "113176272821",
    appId: "1:113176272821:web:1eabdc70e688db379203fc",
    measurementId: "G-TPQH4G05C2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');
const login = document.getElementById('login');
const register = document.getElementById('register');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');
const generateQRBtn = document.getElementById('generateQRBtn');
const qrContainer = document.getElementById('qrContainer');
const qrCode = document.getElementById('qrCode');
const qrAmount = document.getElementById('qrAmount');
const qrDescription = document.getElementById('qrDescription');
const userEmail = document.getElementById('userEmail');
const balance = document.getElementById('balance');
const amountInput = document.getElementById('amount');
const checkPaymentBtn = document.getElementById('checkPaymentBtn');
const checkStatus = document.getElementById('checkStatus');
const transactionList = document.getElementById('transactionList');

let currentUser = null;

// Event listeners
login.addEventListener('submit', handleLogin);
register.addEventListener('submit', handleRegister);
showRegister.addEventListener('click', showRegisterForm);
showLogin.addEventListener('click', showLoginForm);
logoutBtn.addEventListener('click', handleLogout);
generateQRBtn.addEventListener('click', generateQRCode);
checkPaymentBtn.addEventListener('click', checkPaymentStatus);

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        showDashboard();
        loadUserData();
    } else {
        showLoginForm();
    }
});

// Show login form
function showLoginForm() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    dashboard.style.display = 'none';
}

// Show register form
function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    dashboard.style.display = 'none';
}

// Show dashboard
function showDashboard() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    dashboard.style.display = 'block';
    userEmail.textContent = currentUser.email;
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showMessage('Đăng nhập thành công!', 'success');
    } catch (error) {
        showMessage('Lỗi đăng nhập: ' + error.message, 'error');
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showMessage('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Lấy username từ email
        const username = email.split('@')[0];
        
        // Lưu thông tin user vào Firestore
        await db.collection('users').doc(user.uid).set({
            email: email,
            username: username,
            balance: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showMessage('Đăng ký thành công!', 'success');
    } catch (error) {
        showMessage('Lỗi đăng ký: ' + error.message, 'error');
    }
}

// Handle logout
function handleLogout() {
    auth.signOut();
    showMessage('Đã đăng xuất!', 'success');
}

// Load user data
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            balance.textContent = userData.balance.toLocaleString('vi-VN');
        }
        
        // Load transaction history
        await loadTransactionHistory();
    } catch (error) {
        console.error('Lỗi tải dữ liệu user:', error);
    }
}

// Load transaction history
async function loadTransactionHistory() {
    if (!currentUser) return;
    
    try {
        const transactionsSnapshot = await db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        if (transactionsSnapshot.empty) {
            transactionList.innerHTML = '<p>Chưa có giao dịch nào</p>';
            return;
        }
        
        let html = '';
        transactionsSnapshot.forEach(doc => {
            const transaction = doc.data();
            const isPositive = transaction.amount > 0;
            const sign = isPositive ? '+' : '';
            
            html += `
                <div class="transaction-item ${isPositive ? '' : 'negative'}">
                    <div>
                        <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                            ${sign}${transaction.amount.toLocaleString('vi-VN')} VNĐ
                        </div>
                        <div class="transaction-details">
                            ${transaction.description} - ${new Date(transaction.createdAt.toDate()).toLocaleString('vi-VN')}
                        </div>
                    </div>
                </div>
            `;
        });
        
        transactionList.innerHTML = html;
    } catch (error) {
        console.error('Lỗi tải lịch sử giao dịch:', error);
        transactionList.innerHTML = '<p>Lỗi tải lịch sử giao dịch</p>';
    }
}

// Generate QR code for payment
function generateQRCode() {
    const amount = amountInput.value;
    
    if (!amount || amount < 1000) {
        showMessage('Vui lòng nhập số tiền tối thiểu 1,000 VNĐ!', 'error');
        return;
    }
    
    if (!currentUser) {
        showMessage('Vui lòng đăng nhập trước!', 'error');
        return;
    }
    
    // Lấy username từ email (phần trước @)
    const username = currentUser.email.split('@')[0];
    
    // Tạo URL QR code với username làm nội dung chuyển khoản
    const qrUrl = `https://qr.sepay.vn/img?acc=0363064356&bank=VPBank&amount=${amount}&des=${encodeURIComponent(username)}`;
    
    // Hiển thị QR code
    qrCode.innerHTML = `<img src="${qrUrl}" alt="QR Code" />`;
    qrAmount.textContent = parseInt(amount).toLocaleString('vi-VN');
    qrDescription.textContent = username;
    qrContainer.style.display = 'block';
    
    showMessage(`QR Code đã được tạo! Nội dung chuyển khoản: ${username}`, 'success');
}

// Show message
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.error, .success');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    
    // Insert message at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    // Auto remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Check payment status (simulate WebHook check)
async function checkPaymentStatus() {
    if (!currentUser) return;
    
    checkStatus.textContent = 'Đang kiểm tra...';
    checkStatus.className = 'check-status checking';
    
    try {
        // Simulate checking for new transactions
        // In real implementation, this would check SePay API or database
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate finding a transaction (for demo purposes)
        const hasNewTransaction = Math.random() > 0.7; // 30% chance of finding transaction
        
        if (hasNewTransaction) {
            // Simulate adding money
            const amount = Math.floor(Math.random() * 500000) + 50000; // Random amount 50k-550k
            await addTransaction(amount, 'Nạp tiền tự động qua QR');
            checkStatus.textContent = `Đã nhận được ${amount.toLocaleString('vi-VN')} VNĐ!`;
            checkStatus.className = 'check-status success';
        } else {
            checkStatus.textContent = 'Chưa có giao dịch mới';
            checkStatus.className = 'check-status error';
        }
    } catch (error) {
        checkStatus.textContent = 'Lỗi kiểm tra giao dịch';
        checkStatus.className = 'check-status error';
        console.error('Lỗi kiểm tra giao dịch:', error);
    }
}


// Add transaction and update balance
async function addTransaction(amount, description, userId = null) {
    const targetUserId = userId || currentUser?.uid;
    if (!targetUserId) return;
    
    try {
        // Update user balance
        const userRef = db.collection('users').doc(targetUserId);
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            const currentBalance = userDoc.exists ? userDoc.data().balance : 0;
            const newBalance = currentBalance + amount;
            
            transaction.update(userRef, {
                balance: newBalance,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Add transaction record
            const transactionRef = db.collection('transactions').doc();
            transaction.set(transactionRef, {
                userId: targetUserId,
                amount: amount,
                description: description,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                type: 'recharge'
            });
        });
        
        // Update UI if it's current user
        if (targetUserId === currentUser?.uid) {
            await loadUserData();
        }
        
    } catch (error) {
        console.error('Lỗi thêm giao dịch:', error);
        throw error;
    }
}

// WebHook endpoint simulation (for demo)
// In production, this would be a server endpoint
function simulateWebHook(transactionData) {
    console.log('WebHook received:', transactionData);
    
    // In real implementation, you would:
    // 1. Verify the WebHook signature
    // 2. Check if transaction is valid
    // 3. Find the user by username (description field)
    // 4. Add money to their account
    
    if (transactionData.amount > 0 && transactionData.description) {
        // Tìm user dựa trên username (description)
        findUserByUsername(transactionData.description).then(user => {
            if (user) {
                addTransaction(transactionData.amount, `Nạp tiền tự động - ${transactionData.description}`, user.uid);
            }
        });
    }
}

// Find user by username (description from SePay)
async function findUserByUsername(username) {
    try {
        const usersSnapshot = await db.collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();
        
        if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            return { uid: userDoc.id, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Lỗi tìm user:', error);
        return null;
    }
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
