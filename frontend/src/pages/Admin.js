
import {useState} from "react";
import axios from "axios";

function Admin(){
 const [p,setP]=useState({name:"",price:"",image:"",description:""});

 const submit=async()=>{
  await axios.post("http://localhost:5000/products",p);
  alert("Added");
 };

 return(
  <div>
   <h1>Admin</h1>
   <input placeholder="name" onChange={e=>setP({...p,name:e.target.value})}/>
   <input placeholder="price" onChange={e=>setP({...p,price:e.target.value})}/>
   <input placeholder="image" onChange={e=>setP({...p,image:e.target.value})}/>
   <textarea onChange={e=>setP({...p,description:e.target.value})}/>
   <button onClick={submit}>Add</button>
  </div>
 )
}
export default Admin;
