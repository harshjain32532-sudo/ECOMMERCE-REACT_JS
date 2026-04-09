
import {useEffect,useState} from "react";
import axios from "axios";

function Home(){
 const [products,setProducts]=useState([]);

 useEffect(()=>{
  axios.get("http://localhost:5000/products")
  .then(res=>setProducts(res.data));
 },[]);

 return(
  <div>
   <h1>Products</h1>
   {products.map(p=>(
    <div key={p._id}>
     <img src={p.image} width="100"/>
     <h3>{p.name}</h3>
     <p>₹{p.price}</p>
    </div>
   ))}
  </div>
 )
}
export default Home;
