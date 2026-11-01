import './App.css';
import {useState} from 'react'  
import React from 'react';

function App() {
  const [datos,setDatos] = useState({
    nombre: '',
    edad: '',
    estudios:false
  })

  function cambiarNombre(e){
    setDatos((valores) => ({
      ...valores,
      nombre: e.target.value
    }))
  }

  function cambiarEdad(e){
    setDatos((valores) => ({
      ...valores,
      edad: e.target.value
    }))
  }

  function cambiarEstudio(e){
    setDatos((valores) => ({
      ...valores,
      estudios: !datos.estudios
    }))
  }

  function procesar(e){
    e.preventDefault();
    alert('Datos cargados' + datos.nombre + ' ' + datos.edad + ' ' + datos.estudios);
  }

  return (
    <div>
    <form onSubmit={ procesar }>
      <p>Ingrese su nombre:
        <input type='text' value={ datos.nombre } onChange={ cambiarNombre}/>
      </p>
      <p>Ingrese su edad:
        <input type='number' value={ datos.edad } onChange={ cambiarEdad}/>
      </p>
      <p>Estudias?:
        <input type='checkbox' value={ datos.estudios } onChange={ cambiarEstudio}/>
      </p>
      <p><input type='submit'/></p>
    </form>
      <hr/>
      <h3>Datos incorporados: </h3>
      <p>Nombre : {datos.nombre}</p>
      <p>Edad : {datos.edad}</p>
      <p>Estudios : {datos.estudios ? 'Con estudios' : 'Sin estudios'}</p>
    </div>
  );
}

export default App;
