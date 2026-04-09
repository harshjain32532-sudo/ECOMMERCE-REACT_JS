
import {useState} from "react";
import axios from "axios";

function Login(){
 const [d,setD]=useState({email:"",password:""});

 const login=async()=>{
  const res = await axios.post("http://localhost:5000/login",d);
  localStorage.setItem("token",res.data.token);
  alert("Logged in");
 };

 return(
  <div>
   <h1>Login</h1>
   <input placeholder="email" onChange={e=>setD({...d,email:e.target.value})}/>
   <input placeholder="password" type="password" onChange={e=>setD({...d,password:e.target.value})}/>
   <button onClick={login}>Login</button>
  </div>
 )
}
export default Login;
