const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JSON ফাইল পাথ
const subscribersFile = path.join(__dirname, 'subscribers.json');

// JSON ফাইল না থাকলে তৈরি করা
if (!fs.existsSync(subscribersFile)) {
    fs.writeFileSync(subscribersFile, JSON.stringify([], null, 2));
}

// নিউজলেটার সাবস্ক্রাইব এন্ডপয়েন্ট
app.post('/subscribe', (req, res) => {
    const { email } = req.body;

    // ইমেইল ভ্যালিডেশন
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // বর্তমান সাবস্ক্রাইবার লিস্ট পড়া
    let subscribers = [];
    try {
        const data = fs.readFileSync(subscribersFile, 'utf8');
        subscribers = JSON.parse(data);
    } catch (error) {
        console.error('Error reading file:', error);
        return res.status(500).json({ message: 'Server error' });
    }

    // ইমেইল ইতিমধ্যে আছে কিনা চেক
    if (subscribers.includes(email)) {
        return res.status(400).json({ message: 'Email already subscribed' });
    }

    // নতুন ইমেইল অ্যাড করা
    subscribers.push(email);
    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));

    // সফল রেসপন্স
    res.status(200).json({ message: 'Subscribed successfully' });
    
    // কনসোলে লগ
    console.log(`📧 New subscriber: ${email}`);
    console.log(`📋 Total subscribers: ${subscribers.length}`);
});

// সব সাবস্ক্রাইবার দেখার এন্ডপয়েন্ট (অ্যাডমিন কাজে)
app.get('/subscribers', (req, res) => {
    try {
        const data = fs.readFileSync(subscribersFile, 'utf8');
        const subscribers = JSON.parse(data);
        res.status(200).json({ subscribers });
    } catch (error) {
        res.status(500).json({ message: 'Error reading subscribers' });
    }
});

// সার্ভার চালু
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📩 Subscribe endpoint: POST http://localhost:${PORT}/subscribe`);
});
