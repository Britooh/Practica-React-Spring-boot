import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function App() {

  const [numero,setNumero] = useState('');

  function cambiarNumero(event){
    const entrada = event.target.value;
    console.log(entrada.length);
    let cant = 0;

    for(let x = 0;x < entrada.length;x++){
      if(entrada[x] == '0' || entrada[x] == '1'){
        cant ++
      }
      if(cant == entrada.length){
        setNumero(entrada);
      }
    }
  }

  return (
    <div>
      <p>Ingrese su numero binario :</p>
      <input type='text' value={numero} onChange={cambiarNumero}/>
    </div>
  );
}

export default App;
