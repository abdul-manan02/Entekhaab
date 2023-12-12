import jwt from 'jsonwebtoken'

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(401).json({ msg: 'Token not found' })
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Unauthorized' });
    }   
}

export default authMiddleware;