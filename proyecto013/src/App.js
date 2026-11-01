import './App.css';
import { useState } from 'react';

function App() {

  const [anime,setAnime] = useState('Dragon Ball')

  function cambiaAnime(e){
    setAnime(e.target.value);
  }
  return (
    <div>
      <p> Cual es tu anime Favorito?
        <select value={anime} onChange={ cambiaAnime }>
        <option>Dragon Ball</option>
        <option>Bleach</option>
        <option>Naruto</option>
        <option>One Piece</option>
        <option>Jojo's Bizarre Adventure</option>
        <option>Hunter x Hunter</option>
        <option>Black Clover</option>
        </select>
        </p> 
        <p>Tu eleccion es : { anime }</p>
    </div> 
    
  );
}

export default App;
