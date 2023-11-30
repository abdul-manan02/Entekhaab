import 'dotenv/config';
import jwt from 'jsonwebtoken'

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(401).json({ msg: 'Token not found' })
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        console.log("User ID in AuthMiddleware: ",req.userId)
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Unauthorized' });
    }   
}

export default authenticateToken