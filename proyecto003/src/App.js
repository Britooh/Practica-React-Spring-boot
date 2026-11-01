import logo from './logo.svg';
import './App.css';

function realizarOperacion(e){
  e.preventDefault();
  const v1 = parseInt(e.target.valor1.value);
  const v2 = parseInt(e.target.valor2.value);
  const suma = v1 + v2;
  alert('La suma es : ' + suma);
}

function App() {
  return (
   <div>
    <form onSubmit={realizarOperacion}>
      <p>Ingrese primer Valor :
        <input type="number" name="valor1"/>
      </p>
      <p>Ingrese segundo Valor :
        <input type="number" name="valor2"/>
      </p>
      <p>El total es: 
        <input type="submit" name="sumar"/>
      </p>
    </form>
   </div>
  );
}

export default App;
