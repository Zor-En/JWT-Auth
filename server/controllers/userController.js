const db = require('../models/database')
const bcrypt= require("bcryptjs");
const jwt = require("jsonwebtoken");

const userController = {}

userController.createUser = async (req, res, next )=> {
    const {username, password} = req.body
    try {
            const params = [username]
            let userQuery = `SELECT * FROM users WHERE username = $1`
            let existingUser = await db.query( userQuery, params)
        if (existingUser.rows.length > 0) {
            return res.status(500).json({message: 'user exists'})
        }
            const passwordHash = await bcrypt.hash(password, 10)
            const newUserParams = [username, passwordHash];
            const newUserQuery = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`;
            const newUser = await db.query(newUserQuery, newUserParams);
        if (newUser) {
            res.locals.user = newUser.rows[0]
            res.status(200).json({message: 'new user'})
            return next()
        }
    } catch (error) {

    }
}

userController.loginUser = async (req,res,next)=> {
    const {username, password} = req.body
    try {   
        const params = [username]
        let userQuery = `SELECT * FROM users WHERE username = $1`
        let existingUser = await db.query( userQuery, params)
        if (existingUser.rows.length > 0) { 
           let hashedPassword = await bcrypt.compare(password, existingUser.rows[0].password)
          if (hashedPassword) {
            const accessToken = jwt.sign({username: existingUser.rows[0].username},'secret', {expiresIn: "30s"})
            const refreshToken = jwt.sign({username: existingUser.rows[0].username},'secret', {expiresIn: "2m"})
    
             //insert refresh token into db
            const insertQuery = 'UPDATE users SET refreshToken = $1 WHERE username = $2';
            const insertParams = [refreshToken, username]
            await db.query(insertQuery, insertParams)

            res.cookie('JWT', refreshToken, {httpOnly: true, maxAge: 300000})
            return res.json({ accessToken })
          }
        }
    } catch (error) {

    }
}

userController.verifyJWT = (req,res,next) => {
    const authHeader = req.headers['authorization']
    if(!authHeader) return res.sendStatus(401)
    console.log("authHeader:", authHeader) //Bearer token

    const token = authHeader.split(' ')[1]
    console.log("token after splitting authheader:", token)

    jwt.verify(token, 'secret', (err, data)=> {
        if (err) return res.sendStatus(403) //forbidden
        req.user = data.username
        next()
    })
}

userController.verifyRefreshToken = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.JWT) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log('cookies jwt, in sendRefresh token:', cookies.JWT);
        const refreshToken = [cookies.JWT];

        let refreshTokenQuery = 'SELECT * FROM users WHERE refreshToken = $1';
        let existingRefreshToken = await db.query(refreshTokenQuery, refreshToken);
   
        if (!existingRefreshToken.rows[0].refreshtoken) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const refreshTokenInDB = existingRefreshToken.rows[0].refreshtoken
        console.log('refreshTokenInDB', refreshTokenInDB)
        jwt.verify(refreshTokenInDB, 'secret', (err, data) => {
            if (err) { return res.sendStatus(403)}
            jwt.sign({"username": data.username}, 'secret', {expiresIn: '30s'}) //signs refresh token
            return next()
        });
      
        } catch (error) {
    }
};

userController.logoutUser = async (req,res,next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.JWT) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log('cookies jwt, in sendRefresh token:', cookies.JWT);
        const refreshToken = [cookies.JWT];
    
        //delete refresh tokens
        let deleteTokenQuery = 'UPDATE users SET refreshToken = NULL WHERE refreshToken = $1'
        let deleteRefreshToken = await db.query(deleteTokenQuery, refreshToken)
        if (!deleteRefreshToken.rows[0]) {
            res.clearCookie('JWT', {httpOnly:true, maxAge: 300000}) //same as res.cookie on login
            res.json("deleted cookie")
            // status(204)
        }

        //deltes token if no users
        // let refreshTokenQuery = 'SELECT * FROM users WHERE refreshToken = $1';
        // let existingRefreshToken = await db.query(refreshTokenQuery, refreshToken);
        // if (!existingRefreshToken.rows[0].refreshtoken || !existingRefreshToken.rows[0].username) {
        //     res.clearCookie('JWT',{httpOnly:true, maxAge: 300000}) //same as res.cookie on login
        //     return res.status(204)
        // }
        } catch (error) {
    }
}

module.exports = userController

