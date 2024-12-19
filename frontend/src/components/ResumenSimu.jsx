// src/pages/ResumenSimulacion.jsx
import React from 'react';
import { Modal, Button } from 'antd';

const ResumenSimu = ({ open, onClose, resumen }) => {
  const { camionesModal, pedidosModal, tiempoRealModal, tiempoSimuladoModal, fechaFinalModal, ultimaDataModal } = resumen;

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
    </Modal>
  );
};

export default ResumenSimu;
