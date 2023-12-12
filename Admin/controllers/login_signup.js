import Admin from '../models/adminCredentials.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const signup = async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingAdmin = await Admin.findOne({ username });

        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await Admin.create({ username, password: hashedPassword });

        res.status(200).json({result});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingAdmin = await Admin.findOne({ username });

        if (!existingAdmin) {
            return res.status(404).json({ message: "Admin doesn't exist" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingAdmin.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: existingAdmin._id }, process.env.JWT_KEY, { expiresIn: '24h' });

        res.status(200).json({ result: existingAdmin, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export{
    login,
    signup
}