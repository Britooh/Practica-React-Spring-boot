import './App.css';
import { useEffect, useState } from 'react';

function App() {
 
    const [texto,setTexto] = useState('');

    useEffect(() => { document.title = texto}, [texto])

    function cambiar(e){
      setTexto(e.target.value)
    }

  return (
    <div>
      <p>
        <input type='text' onChange = { cambiar }/>
        <p> { texto } </p>
      </p>
    </div>
  );
}

export default App;
