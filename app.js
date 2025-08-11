const express = require('express');
const cookieparser = require('cookie-parser');
const path = require('path');
const app = express();
const userModel = require('./models/user.model.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')


app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieparser());

app.get('/',(req, res)=>{
    res.render('login.ejs');
});

app.get('/index.ejs',(req,res)=>{
    res.render('index.ejs')
})

app.post('/create',(req, res)=>{
    let {username, email, password, age} = req.body;

    bcrypt.genSalt(10,(err, salt)=>{
        bcrypt.hash(password, salt, async(err, hash) =>{
        let createdUser = await userModel.create({
        username,
        email,
        password:hash,
        age
    })
    let token = jwt.sign({email},"shhhh");
    res.cookie("token",token);
    res.send(createdUser);
        })
        
    })   
});
app.get("/login",(req,res)=>{
    res.render('login')
})

app.post("/login", async function(req,res){
    let user = await userModel.findOne({email: req.body.email});
    if(!user) return res.send("something went wrong");

    bcrypt.compare(req.body.password, user.password, (err, result)=>{
        if(result){ 
            let token = jwt.sign({email: user.email},"shhhh");
            res.cookie("token",token);
            res.render('home');
        }
        else res.send("something is wrong")
    })
});

app.get("/logout", (req,res)=>{
    res.cookie("token","");
    res.redirect("/");
})

app.listen(5000,()=>{
    console.log("server started...!");
});