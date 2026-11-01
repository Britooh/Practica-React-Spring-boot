import { useState } from 'react';
import './App.css';
import Contador from './Contador';


function App() {
  /*
    function generarValor(){
      return Math.trunc(Math.random()*6)+1;
    }

    function tirar(){
      setValor1(generarValor());
      setValor2(generarValor());
      setValor3(generarValor());
    }

  const [valor1,setValor1] = useState(0); 
  const [valor2,setValor2] = useState(0); 
  const [valor3,setValor3] = useState(0); 
  */
function realizarConteo(){
    setNumero (numero + 1);
}

  const [numero,setNumero] = useState(0);
  return (
    <div>
    <Contador valor= {numero}/>
    <br></br>
    <button onClick={ realizarConteo }>+</button>
    </div>
  );
}

export default App;
