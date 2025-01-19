import express from 'express'
import connectDB from './db.js'
import User from './Model/userModel.js'
import cors from 'cors'
import jwt from 'jsonwebtoken'
const app = express()

let port=process.env.PORT;

app.use(express.json());
app.use(cors())

console.log('MONGO_URI:', process.env.MONGO_URI);

connectDB()

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/api/signup', async (req, res) => {
  try {
   const {name,email,password,yearOfStudy,studentId}=req.body
 
  let emailExists= await User.findOne({ email: email })
  let studentIdExists= await User.findOne({ studentId: studentId })

  
  if(studentIdExists){

    return  res.status(400).json({ message: "Student Id allready exists" });
  }
  
  if(emailExists)
  {
  return  res.status(400).json({status:"failure", message: "Email allready exists",data:null });
  }
  
   if(!name ||!email||!password||!yearOfStudy||!studentId )
   {
   return  res.status(400).json({status:"failure", message: "All Fields are required",data:null });
   }

   

   let userData={
    name:name,
    email:email,
    password:password,
    yearOfStudy:yearOfStudy,
    studentId:studentId
   }

    const user = await User.create(userData);
    res.status(201).json({status:"success",message:"user added sucessfully",data:user});
  } catch (error) {
    res.status(400).json({status:"failure", message: error.message,data:null });
  }
});




app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: "failure",
        message: "Email and password are required",
        data: null,
      });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "failure",
        message: "User not found",
        data: null,
      });
    }

 
    if (user.password !== password) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid credentials",
        data: null,
      });
    }

   
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      "your_jwt_secret_key", // Replace with a secure secret key
      { expiresIn: "1h" } // Token expiration time
    );

    // Send a success response with the token
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: { token,user},
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "failure",
      message: "Internal server error",
      data: null,
    });
  }
});




app.listen(port, () => {
  console.log(`Example app listening on port ${port|| 3000}`)
})
      