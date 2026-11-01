
import './App.css';
import { useState } from 'react';

function App() {

const [texto,setTexto] = useState('');

function cambiarTexto(e){
  setTexto(e.target.value);
}
  return (
    <div>
      <p>
        <textarea value={texto} onChange={ cambiarTexto } cols="100" rows="5"></textarea>
      </p>
      <p>
        <textarea value={texto} cols="100" rows="5"></textarea>
      </p>
      <p>Cantidad de caracteres ingresados : { texto.length }</p>
    </div>
    
  );
}

export default App;
