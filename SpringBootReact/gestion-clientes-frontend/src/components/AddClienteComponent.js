import React, { useEffect, useState } from 'react'
import ClienteService from '../services/ClienteService';
import { Link, useNavigate, useParams } from 'react-router-dom';

const AddClienteComponent = () => {

    const [nombre,setNombre] = useState('');
    const [apellido,setApellido] = useState('');
    const [email,setEmail] = useState('');
    const navigate = useNavigate();
    const {id} = useParams();

    const saveOrUpdate = (e) => {
        e.preventDefault();
        const cliente = {nombre, apellido, email};

        if(id){

            ClienteService.updateCliente(id, cliente).then((response) => {
            console.log(response.data);
            navigate('/clientes');

        }).catch(error => {
            console.log(error)
        })

        }

        else{
        ClienteService.createCliente(cliente).then((response) => {
            console.log(response.data);
            navigate('/clientes');

        }).catch(error => {
            console.log(error)
        })
    }
    }

    useEffect(() => {
        if (!id) {
            setNombre('');
            setApellido('');
            setEmail('');
            return;
        }

        ClienteService.getClienteById(id).then((response) => {
            setNombre(response.data.nombre);
            setApellido(response.data.apellido);
            setEmail(response.data.email);
        }).catch(error => {
            console.log(error);
        })
    }, [id])

    const title = () => {
        if(id){
            return <h2 className='texte-center'>Actualizar cliente</h2>
        }
        else{
            return <h2 className='texte-center'>Agregar cliente</h2>
        }
    }
  return (
    <div>
      <div className='container'>
        <div className='row'>
        <div className='card col-md-6 offset-md-3 offset-md-3'>
            <h2 className='text-center'>
                {

                title()

                }
            </h2>
            <div className='card-body'>
                <form>
                    <div className='form-group mb-2'>
                        <label className='form-label'>Nombre</label>
                        <input
                            type='text'
                            placeholder='Digite su nombre'
                            name='nombre'
                            value={ nombre }
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>
                     <div className='form-group mb-2'>
                        <label className='form-label'>Apellido</label>
                        <input
                            type='text'
                            placeholder='Digite su apellido'
                            name='apellido'
                            value={ apellido }
                            onChange={(e) => setApellido(e.target.value)}
                        />
                    </div>
                     <div className='form-group mb-2'>
                        <label className='form-label'>Email</label>
                        <input
                            type='text'
                            placeholder='Digite su email'
                            name='email'
                            value={ email }
                            onChange={(e) => setEmail (e.target.value)}
                        />
                    </div>
                    <button className='btn btn-success' onClick={ (e) => saveOrUpdate(e) }>Guardar</button>
                    &nbsp;&nbsp;
                    <Link to='/clientes' className='btn btn-danger'>Cancelar</Link>
                </form>
            </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default AddClienteComponent;