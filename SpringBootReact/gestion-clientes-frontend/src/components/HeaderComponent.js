import React from "react";

export const HeaderComponent = () => {
    return(
        <div>
            <header>
                <nav className='navbar navbar/expand-md navbar-dark bg-dark'></nav>
                <div>
                    <a href='/' className='navbar-brand'>Gestion de Clientes</a>
                </div>
            </header>
        </div>
    )
}