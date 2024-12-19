// src/pages/ResumenSimulacion.jsx
import React from 'react';
import { Modal, Button } from 'antd';

const ResumenSimu = ({ open, onClose, resumen }) => {
  const { camionesModal, pedidosModal, tiempoRealModal, tiempoSimuladoModal, fechaFinalModal, ultimaDataModal } = resumen;

  const bloqueosLenght = ultimaDataModal?.current?.bloqueos.length || 0;
  const colapso = ultimaDataModal?.current?.colapso;
  const rutas = ultimaDataModal?.current?.rutas || [];
  const tiempoTotal = ultimaDataModal?.current?.tiempoTotal;

  return (
    <Modal
      title="Resumen de la Simulación"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="finalizar" type="primary" onClick={onClose}>
          Finalizar
        </Button>,
      ]}
    >
      <p><b>Camiones Completados:</b> {camionesModal}</p>
      <p><b>Pedidos Completados:</b> {pedidosModal}</p>
      <p><b>Tiempo Real Transcurrido:</b> {tiempoRealModal} segundos</p>
      <p><b>Tiempo Simulado:</b> {tiempoSimuladoModal} horas</p>
      <p><b>Fecha Final:</b> {fechaFinalModal}</p>

      {/* Mostramos los datos de ultimaDataModal */}
      <p><b>===============================================</b></p>
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
            <b>Camión:</b> {ruta.camion.codigo}, 
            <b> Capacidad:</b> {ruta.camion.capacidad}, 
            <b> Carga Actual:</b> {ruta.camion.cargaActual}
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default ResumenSimu;
