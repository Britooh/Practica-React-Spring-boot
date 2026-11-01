import React, { useState } from 'react';
import './App.css';

function App() {

  function eliminarUltimaFila(){
    if(articulos.length > 0){
      const temp = Array.from(articulos);
      temp.pop();
      setArticulos(temp);
    }
  }
  
  const [articulos,setArticulos] = useState([
    {
      codigo : 1,
      descripcion: 'Yaroa',
      precio: 399.99
    },
    {
      codigo : 2,
      descripcion: 'Salchipapa',
      precio: 250
    },
    {
      codigo : 3,
      descripcion: 'Chimi',
      precio: 62.20
    }
  ]);
  
  return (
    <div>
      <table border="1">
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Descripcion</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {articulos.map(art => {
            return (
              <tr key = {art.codigo}>
                <td>{art.codigo}</td>
                 <td>{art.descripcion}</td>
                  <td>{art.precio}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button onClick={ eliminarUltimaFila }>Eliminar fila</button>
    </div>
  );
}

export default App;
