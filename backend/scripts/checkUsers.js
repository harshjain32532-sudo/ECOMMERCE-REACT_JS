import mongoose from 'mongoose';

const run = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
        const userSchema = new mongoose.Schema({ email: String, role: String }, { collection: 'users' });
        const User = mongoose.model('User', userSchema);
        const users = await User.find().lean();
        console.log('users', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('error', e.message);
    } finally {
        await mongoose.disconnect();
    }
};

run();