function FormularioNumeros(props){
    return(
        <form onSubmit={props.onSumar}>
        <p>Ingrese su primer Valor:
          <input type='text' name='valor1'/>
        </p>
         <p>Ingrese su segundo Valor:
          <input type='text' name='valor2'/>
        </p>
         <input type='submit' name='sumar'/>
      </form>
    );
}

export default FormularioNumeros;