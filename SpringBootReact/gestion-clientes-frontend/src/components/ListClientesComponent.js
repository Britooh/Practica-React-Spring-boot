import React, { useEffect, useState } from 'react'
import ClienteService from '../services/ClienteService';
import { Link } from 'react-router-dom';

const ListClientesComponent = () => {

    const [clientes,setClientes] = useState([]);


    useEffect(() => {
        listarClientes()
    },[])   
    
    const listarClientes = () => {
         ClienteService.getAllClientes().then(response => {
            setClientes(response.data);
            console.log(response.data);
        }).catch(error => {
                console.log(error);
        })
    }

    const deleteCliente = (clienteId) => {
        ClienteService.deleteCliente(clienteId).then((response) => {
            listarClientes();
        }).catch(error => {
            console.log(error);
        })
    }
          
  return (
    <div className='container'>
     <h2 className='text-center'>Lista de clientes</h2>
     <Link to='/add-cliente' className='btn btn-primary mb-2'>Agregar cliente</Link>
     <table className='table table-bordered table-striped'>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {
            clientes.map(
                (cliente, index) =>                      
                    <tr key= { cliente.id }>
                        <td>{ index + 1 }</td>           
                        <td>{ cliente.nombre}</td>
                        <td>{ cliente.apellido}</td>
                        <td>{ cliente.email}</td>
                        <td>
                            <Link className='btn btn-info' to={ `/edit-cliente/${cliente.id}` }>Actualizar</Link>
                            <button style={{ marginLeft:"10px" }} className='btn btn-danger' onClick={() => deleteCliente(cliente.id)}>Eliminar</button>
                        </td>
                    </tr>
                )
            }
        </tbody>
     </table>
    </div>
  )
}

export default ListClientesComponent