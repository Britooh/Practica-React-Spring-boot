import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import PacienteDetalle from './pages/PacienteDetalle';
import Medicos from './pages/Medicos';
import Citas from './pages/Citas';
import Recetas from './pages/Recetas';
import NuevaReceta from './pages/NuevaReceta';
import RecetaImprimir from './pages/RecetaImprimir';
import BaseDatos from './pages/BaseDatos';
import {
  EcgLine,
  IconoDashboard,
  IconoPacientes,
  IconoCitas,
  IconoMedicos,
  IconoRecetas,
  IconoBD,
} from './icons';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell layout-atelier">
        <header className="navbar no-print">
          <div className="brand">
            <div className="brand-icon">
              <EcgLine className="brand-ecg" />
            </div>
            <div>
              <div className="logo">Clínica San Rafael</div>
              <div className="brand-sub">ATELIER MÉDICAL · GESTIÓN INTEGRAL</div>
            </div>
          </div>

          <nav className="nav-links">
            <NavLink to="/" end>
              <IconoDashboard />
              <span>Panorama</span>
            </NavLink>
            <NavLink to="/pacientes">
              <IconoPacientes />
              <span>Pacientes</span>
            </NavLink>
            <NavLink to="/citas">
              <IconoCitas />
              <span>Agenda</span>
            </NavLink>
            <NavLink to="/medicos">
              <IconoMedicos />
              <span>Especialistas</span>
            </NavLink>
            <NavLink to="/recetas">
              <IconoRecetas />
              <span>Recetario</span>
            </NavLink>
            <NavLink to="/base-de-datos">
              <IconoBD />
              <span>Base de Datos</span>
            </NavLink>
          </nav>

          <div className="status-chip">
            <span className="status-led" />
            <span>Red clínica activa</span>
          </div>
        </header>

        <main className="contenedor">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/pacientes/:id" element={<PacienteDetalle />} />
            <Route path="/medicos" element={<Medicos />} />
            <Route path="/citas" element={<Citas />} />
            <Route path="/recetas" element={<Recetas />} />
            <Route path="/recetas/nueva" element={<NuevaReceta />} />
            <Route path="/recetas/:id/imprimir" element={<RecetaImprimir />} />
            <Route path="/base-de-datos" element={<BaseDatos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
