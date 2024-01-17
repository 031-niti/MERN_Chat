const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const User = require('./models/User');


//.env
require('dotenv').config()
const PORT = process.env.PORT;
const URL = process.env.MONGODB_CONNECT_URL
const CLIENT_URL = process.env.CLIENT_URL

mongoose.Promise = global.Promise;
// Fix DeprecationWarning
mongoose.set('strictQuery', false);
// connect
mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Successfully connect to MongoDB.");
    })
    .catch((error) => {
        console.log("Connection error", error)
        process.exit();
    })

//middleware server
const app = express();
app.use(cors({ credentials: true, origin: CLIENT_URL }));
app.use(express.json()); //ให้อ่าน json ได้
app.use(cookieParser()); //ให้อ่าน cookieParser ได้
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(__dirname +'/uploads')); //set static(public) folder

app.get('/', (req, res) => {
    res.send('<h1>Hello Wellcome To MERN_Chat</h1>')
});

//Register
const salt = bcrypt.genSaltSync(10)
app.post("/register",async (req,res)=>{
    // Destructuring Object
    const {username,password} = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc)
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
})

//Login
const secret = process.env.SECRET
app.post("/login",async (req, res) => {
    //เป็นการ Destructuring Object
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (userDoc){
        const isMatchedPassword = bcrypt.compareSync(password, userDoc.password);
        if (isMatchedPassword) {
            //logged in
            jwt.sign({ username, userId: userDoc._id }, secret, {}, (err, token)=>{
                if (err) throw err;
                //cookie อยู่ที่ res
                res.cookie("token", token).json({
                    userId:userDoc._id,
                    username,
                    password,
                })
            })
        } else {
            res.status(400).json("wrong credentials")
        }
    }else{
        res.status(404).json("user not found")
    }
})

// logout
app.post("/logout", (req, res) => {
    res.clearCookie("token").json("ok");
});

app.get("/profile",(req,res)=>{
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, secret, {}, (err,userData)=>{
            if (err) throw err;
            res.json(userData);
        })
    }else{
        res.status(400).json("no token");
    }
})

app.listen(PORT, () => {
    console.log("Server is runing on http://localhost:" + PORT);
});