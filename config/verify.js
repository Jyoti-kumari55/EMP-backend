const jwt = require('jsonwebtoken');

const isAuthenticated = async (req, res, next) => {
    //console.log("Cookies:", req.cookies); 
 //   const token = req.header("Authorization")?.split(" ")[1];
    const token = req.cookies.token || req.headers["authorization"];;
    if(!token){
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decoded.userId;
        next();
    } catch (error) {          
        console.error(error);
        return res.status(401).json({ error: "Token is not valid or has expired." });
    }
}

module.exports = isAuthenticated;