// src/pages/ResumenSimulacion.jsx
import React from 'react';
import { Modal, Button } from 'antd';

const ResumenSimu = ({ open, onClose, resumen }) => {
  const { camionesModal, pedidosModal, tiempoRealModal, tiempoSimuladoModal, fechaFinalModal, ultimaDataModal } = resumen;

  const bloqueosLenght = ultimaDataModal?.current?.bloqueos.length || 0;
  const colapso = ultimaDataModal?.current?.colapso;
  const rutas = ultimaDataModal?.current?.rutas || [];
  const tiempoTotal = ultimaDataModal?.current?.tiempoTotal;
  const tiempoRealMinutos = Math.floor(tiempoRealModal / 60);
  const diasSimulados = Math.floor(tiempoSimuladoModal / 24);
  const horasSimuladas = Math.floor(tiempoSimuladoModal % 24);
  const minutosSimulados = Math.floor((tiempoSimuladoModal * 60) % 60);
  const rangofinalfecha = new Date(fechaFinalModal);
  rangofinalfecha.setDate(rangofinalfecha.getDate() + 7);
  const rangoiniciofecha = new Date(fechaFinalModal);
  

  return (
    <Modal
      title={
        <div style={{ fontSize: '20px', textAlign: 'center' }}
          >Resumen de la Simulación
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="finalizar" type="primary" onClick={onClose}>
          Finalizar
        </Button>,
      ]}
    >
      <p><b>Rango de Fechas simuladas:</b> {rangoiniciofecha.toLocaleDateString()} - {rangofinalfecha.toLocaleDateString()}</p>
      <p><b>Camiones Completados:</b> {camionesModal}</p>
      <p><b>Pedidos Completados:</b> {pedidosModal}</p>
      <p><b>Tiempo Real Transcurrido:</b> {tiempoRealMinutos} minutos</p>
      <p><b>Tiempo Simulado:</b> {diasSimulados} días, {horasSimuladas} horas, {minutosSimulados} minutos</p>

      {/* Mostramos los datos de ultimaDataModal */}
      <p><b>==============================================</b></p>
      <div
        style={{
          fontSize: '15px',
          fontWeight: 'bold',
          marginBottom: '8px',
          marginTop: '15px',
          textAlign: 'center',
        }}
      >
        Ultima Simulación de Pedidos Exitosa:
      </div>
      <p><b>Cantidad de tramos bloqueados:</b> {bloqueosLenght}</p>
      {/* <p><b>Bloqueos:</b> {bloqueos.length}</p> */}
      {/* <ul>
        {bloqueos.map((bloqueo, index) => (
          <li key={index}>Detalle del bloqueo #{index + 1}</li>
        ))}
      </ul> */}
      <p><b>Rutas:</b> {rutas.length}</p>
      <ul>
        {rutas.map((ruta, index) => (
          <li key={index}>
            <b>   Camión:</b> {ruta.camion.codigo}, 
            <b>   Capacidad:</b> {ruta.camion.capacidad}, 
            <b>   Carga Actual:</b> {ruta.camion.cargaActual}
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default ResumenSimu;
