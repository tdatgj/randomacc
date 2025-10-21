// Vercel API route để nhận WebHook từ SePay
// File: api/webhook.js

// Import Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin (cần cấu hình service account)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: "randomacc-96218",
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            databaseURL: `https://randomacc-96218.firebaseio.com`
        });
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

const db = admin.firestore();

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sepay-signature');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Chỉ cho phép POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('WebHook received from SePay:', JSON.stringify(req.body, null, 2));
        
        // Xác thực WebHook signature (nếu SePay cung cấp)
        const signature = req.headers['x-sepay-signature'];
        const payload = JSON.stringify(req.body);
        
        // TODO: Verify signature với secret key từ SePay
        // const expectedSignature = crypto
        //     .createHmac('sha256', process.env.SEPAY_WEBHOOK_SECRET)
        //     .update(payload)
        //     .digest('hex');
        
        const transactionData = req.body;
        
        // Xử lý giao dịch
        if (transactionData.status === 'success' && transactionData.amount > 0) {
            console.log('Processing successful transaction:', {
                amount: transactionData.amount,
                description: transactionData.description,
                transactionId: transactionData.transaction_id
            });
            
            // Tìm user dựa trên username (description field)
            const username = transactionData.description;
            if (username) {
                console.log(`Tìm user với username: ${username}`);
                console.log(`Số tiền: ${transactionData.amount} VNĐ`);
                
                try {
                    // Tìm user trong Firestore với username = description
                    const usersSnapshot = await db.collection('users')
                        .where('username', '==', username)
                        .limit(1)
                        .get();
                    
                    if (!usersSnapshot.empty) {
                        const userDoc = usersSnapshot.docs[0];
                        const userId = userDoc.id;
                        const userData = userDoc.data();
                        
                        console.log(`Tìm thấy user: ${userId}`, userData);
                        
                        // Cộng tiền vào tài khoản
                        const userRef = db.collection('users').doc(userId);
                        await db.runTransaction(async (transaction) => {
                            const userDoc = await transaction.get(userRef);
                            const currentBalance = userDoc.exists ? userDoc.data().balance : 0;
                            const newBalance = currentBalance + transactionData.amount;
                            
                            transaction.update(userRef, {
                                balance: newBalance,
                                updatedAt: admin.firestore.FieldValue.serverTimestamp()
                            });
                            
                            // Ghi log giao dịch
                            const transactionRef = db.collection('transactions').doc();
                            transaction.set(transactionRef, {
                                userId: userId,
                                amount: transactionData.amount,
                                description: `Nạp tiền tự động - ${username}`,
                                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                type: 'recharge',
                                transactionId: transactionData.transaction_id,
                                bankCode: transactionData.bank_code,
                                accountNumber: transactionData.account_number
                            });
                        });
                        
                        console.log(`Đã cộng ${transactionData.amount} VNĐ vào tài khoản ${username}`);
                    } else {
                        console.log(`Không tìm thấy user với username: ${username}`);
                    }
                } catch (firebaseError) {
                    console.error('Lỗi xử lý Firebase:', firebaseError);
                }
            }
        }
        
        // Trả về response thành công
        res.status(200).json({ 
            success: true, 
            message: 'WebHook processed successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error processing WebHook:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message
        });
    }
}
