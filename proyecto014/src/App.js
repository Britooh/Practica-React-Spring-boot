import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function App() {

  const [liceyCampeon, setLiceyCampeon] = useState('Licey Campeon')

  function cambiarEquipo(e){
    setLiceyCampeon(e.target.value)
  }
  return (
    <div>
      <p>
        <input type='radio' value='El mejor equipo que existe' checked={ liceyCampeon == 'El mejor equipo que existe'} onChange={cambiarEquipo}/>
        La para del Licey     
      </p>
      <p>
        <input type='radio' value='No te da verguenza?' checked={ liceyCampeon == 'No te da verguenza?'} onChange={cambiarEquipo}/>
        El basura de las Aguilas
      </p>
      <p>
        <input type='radio' value='No sirven' checked={ liceyCampeon == 'No sirven'} onChange={cambiarEquipo}/>
        El trapo del Escogido
      </p>
      <p>
        <input type='radio' value='Ay no, fo' checked={ liceyCampeon == 'Ay no, fo'} onChange={cambiarEquipo}/>
        Los ridiculos de los Toros
      </p>
      <p>
        <input type='radio' value='Y ustedes siguen vivos?' checked={ liceyCampeon == 'Y ustedes siguen vivos?'} onChange={cambiarEquipo}/>
        El diparate de Estrellas
      </p>
      <p>
        <input type='radio' value='Yo creo que ni tu te respetas' checked={ liceyCampeon == 'Yo creo que ni tu te respetas'} onChange={cambiarEquipo}/>
        Los pequeños Gigantes
      </p>
      <p>
        Equipo seleccionado: {liceyCampeon}
      </p>
    </div>
  );
}

export default App;
