import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    supabaseId: String,
    email: String,
    credits: { type: Number, default: 0 },
    isLifetime: { type: Boolean, default: false },
    subscriptionExpiry: Date
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const transactionSchema = new mongoose.Schema({
    transactionId: { type: String, unique: true },
    userId: String,
    amount: Number,
    content: String,
    createdAt: { type: Date, default: Date.now, expires: '30d' }
});
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, amount, transferAmount, code, id } = body;
        const transactionId = id || code;
        const receivedAmount = parseFloat(transferAmount || amount);
        const trimmedContent = (content || "").trim();

        if (!transactionId || isNaN(receivedAmount) || receivedAmount <= 0) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            return NextResponse.json({ error: 'Database MONGODB_URI not configured in Vercel' }, { status: 500 });
        }

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
        }

        // Check duplicate
        const existingTx = await Transaction.findOne({ transactionId });
        if (existingTx) {
            return NextResponse.json({ success: true, message: 'Already processed' });
        }

        // ID Scanning
        const potentialIds = trimmedContent.match(/[a-f0-9]{8}/gi) || [];
        let user = null;

        for (const pid of potentialIds) {
            const foundUser = await User.findOne({ supabaseId: { $regex: new RegExp(`^${pid.toLowerCase()}`) } });
            if (foundUser) {
                user = foundUser;
                break;
            }
        }

        if (!user) {
            return NextResponse.json({ error: 'Invalid content format', received: trimmedContent }, { status: 400 });
        }

        // Plan Detection
        let planType = 'CREDITS';
        if (/WEEK|TUAN|7NGAY/i.test(trimmedContent)) planType = 'WEEK';
        else if (/MONTH|THANG|30NGAY/i.test(trimmedContent)) planType = 'MONTH';
        else if (/LIFE|VV|VINHVIEN|999999/i.test(trimmedContent)) planType = 'LIFE';

        const now = new Date();
        const currentExpiry = (user.subscriptionExpiry && user.subscriptionExpiry > now) ? new Date(user.subscriptionExpiry) : now;

        if (planType === 'WEEK') {
            currentExpiry.setDate(currentExpiry.getDate() + 7);
            user.subscriptionExpiry = currentExpiry;
            user.credits = Math.max(user.credits || 0, 999999);
        } else if (planType === 'MONTH') {
            currentExpiry.setMonth(currentExpiry.getMonth() + 1);
            user.subscriptionExpiry = currentExpiry;
            user.credits = Math.max(user.credits || 0, 999999);
        } else if (planType === 'LIFE') {
            user.isLifetime = true;
            user.credits = Math.max(user.credits || 0, 999999);
        } else {
            user.credits = (user.credits || 0) + Math.floor(receivedAmount / 5000);
        }

        await user.save();
        await Transaction.create({ transactionId, amount: receivedAmount, content: trimmedContent, userId: user.supabaseId });

        return NextResponse.json({ success: true, plan: planType });

    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
