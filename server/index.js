const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const Message = require("./models/Message");
const ws = require('ws')
const fs = require('fs');


//.env
require('dotenv').config()
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
app.use('/uploads', express.static(__dirname + '/uploads')); //set static(public) folder

app.get('/', (req, res) => {
    res.send('<h1>Hello Wellcome To MERN_Chat</h1>')
});

//Register
const salt = bcrypt.genSaltSync(10)
app.post("/register", async (req, res) => {
    // Destructuring Object
    const { username, password } = req.body;
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
app.post("/login", async (req, res) => {
    //เป็นการ Destructuring Object
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (userDoc) {
        const isMatchedPassword = bcrypt.compareSync(password, userDoc.password);
        if (isMatchedPassword) {
            //logged in
            jwt.sign({ username, userId: userDoc._id }, secret, {}, (err, token) => {
                if (err) throw err;
                //cookie อยู่ที่ res
                res.cookie("token", token).json({
                    userId: userDoc._id,
                    username,
                    password,
                })
            })
        } else {
            res.status(400).json("wrong credentials")
        }
    } else {
        res.status(404).json("user not found")
    }
})

// logout
app.post("/logout", (req, res) => {
    res.clearCookie("token").json("ok");
});

// profile
app.get("/profile", (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, secret, {}, (err, userData) => {
            if (err) throw err;
            res.json(userData);
        })
    } else {
        res.status(400).json("no token");
    }
})

app.get("/people", async (req, res) => {
    const user = await User.find({}, { _id: 1, username: 1 });
    res.json(user);
});

const getUserDataFromRequest = (req) => {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token;
        if (token) {
            jwt.verify(token, secret, {}, (err, userData) => {
                if (err) throw err;
                resolve(userData);
            })
        } else {
            reject('no token');
        }
    })
}
app.get("/message/:userId", async (req, res) => {
    const { userId } = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const message = await Message.find({
        sender: { $in: [userId, ourUserId] },
        recipient: { $in: [userId, ourUserId] },
    }).sort({ createAt: 1 });
    res.json(message);
});

//Run server
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log("Server is runing on http://localhost:" + PORT);
});

//web socket server
const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {
    const notifyAboutOnlinePeople = () => {
        [...wss.clients].forEach((client) => {
            client.send(
                JSON.stringify({
                    online: [...wss.clients].map((c) => ({
                        userId: c.userId,
                        username: c.username,
                    })),
                })
            );
        });
    };
    connection.isAlive = true;
    connection.timer = setInterval(() => {
        connection.ping();
        connection.deadTimer = setTimeout(() => {
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyAboutOnlinePeople();
            console.log('dead');
        }, 1000);
    }, 5000);

    connection.on('pong', () => {
        clearTimeout(connection.deadTimer);
    });

    //read username and id from the cookie for this connection
    const cookie = req.headers.cookie;
    if (cookie) {
        const tokenCookieString = cookie.split(";").find(str => str.startsWith("token="))
        if (tokenCookieString) {
            const token = tokenCookieString.split("=")[1]
            if (token) {
                jwt.verify(token, secret, {}, (err, userData) => {
                    if (err) throw err;
                    const { userId, username } = userData;
                    connection.userId = userId;
                    connection.username = username;
                });
            }
        }
    }
    connection.on("message", async (message) => {
        const messageData = JSON.parse(message.toString());
        const { recipient, sender, text, file } = messageData;
        let filename = null;
        if (file) {
            const parts = file.name.split(".");
            const ext = parts[parts.length - 1];
            filename = Date.now() + "." + ext;
            const path = __dirname + "/uploads/" + filename;
            fs.writeFile(path, file.data.split(",")[1], "base64", () => {
              console.log("file saved" + path);
            });
        }
        if (recipient && (text || file)) {
            // save to database
            const messageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text,
                file: file ? filename : null,
            });
            [...wss.clients].filter(c => c.userId === recipient).forEach(c => c.send(JSON.stringify({
                sender: connection.userId,
                recipient,
                text,
                file: file ? filename : null,
                _id: messageDoc._id
            })))
        }
    })
    notifyAboutOnlinePeople();
});

