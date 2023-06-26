import express from 'express';
import mongoose from 'mongoose'
import session from "express-session";
import cors from "cors";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();
import path from 'path';


const PORT = process.env.PORT||3000

mongoose.connect(`mongodb+srv://kioken:${process.env.PASSWORD}@cluster0.0gedaos.mongodb.net/todoProj`)


const app = express(); 
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({extended:true}));
app.use(
  session({
    secret: 'xdfbhfgxbf', // Replace with your own secret key
    resave: false,
    saveUninitialized: true
  })
  );
  // defining the collection for user data and schema 
  app.use(express.static(path.join(__dirname,'./frontend/dist')));



  app.get('*',function(req,res){
    res.sendFile(path.join(__dirname,'./client/dist/index.html'))
  })
  

/////// making the collection for the user 
const User = mongoose.model("User",new mongoose.Schema({
  userName:String,
  password:String,
  EntryItem:[{
      heading:String,
      subheading:String,
      date:String
  }],
  id:String
}))




/////////////////////////////////////////////////////
//////////////////// Reginster Routes



app.post('/register', async (req,res)=>{
  const user_result =await User.findOne({userName:req.body.userName}).then((user)=>{
    return user;
  })
  
    if(!user_result){
      const pwd =  bcrypt.hash(req.body.password,10,(err,hash)=>{
        return hash;
      })
      const info = new User({
        userName:req.body.userName,
        password:pwd,
        id:req.sessionID,
      })
      await info.save();
      res.send({stat:1});
    }
    else{
      res.send({stat:0})
    }
    

    

})




/////////////////////////////////////////////////////
//////////////////// Login Routes

app.post('/login',async (req,res)=>{

// console.log(req.body);

 const user = await User.findOne({userName:req.body.userName}).then(async (user)=>{
  // console.log(user,"hello");
  const pwd =  bcrypt.hash(req.body.password,10,(err,hash)=>{
    return hash;
  })
  if(!user|| pwd!= user.password){
    if(!user){
      res.send({
        stat:0
      })
    }
    else{
      res.send({
        stat:-1
      })
    }
  }
  else{
    await User.updateOne({userName:req.body.userName},{
      id:req.sessionID
    })
    res.send({
      stat:req.sessionID
    })
   
  }
 })
})


/////////////////////////////////////////////////////
//////////////////// Dashboard Routes

app.post('/dashboard',async (req,res)=>{
const user_result =await User.findOne({id:req.body.location});
if(user_result){
  res.send({
    data:{
      username:user_result.userName,
      list:user_result.EntryItem
    }
  })
}
else{
  res.send({
    data:"no"
  })
}
})

app.patch("/dashboard",async (req,res)=>{
  
  const user_result = await User.findOneAndUpdate(
    {id:req.body.id},{$push:{EntryItem:{heading:req.body.subheading,subheading:req.body.subheading,date:req.body.date}}})

})
app.put("/dashboard",async (req,res)=>{
  
  const user_result = await User.findOneAndUpdate(
    {id:req.body.id},{$pull:{EntryItem:{heading:req.body.subheading,subheading:req.body.subheading}}})

})



app.listen(PORT,()=>{
    console.log("connected to port",3000)
})