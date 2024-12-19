import { Button, Modal } from 'antd';
// src/pages/ResumenSimulacion.jsx
import React from 'react';

const ResumenSimu = ({ open, onClose, resumen }) => {
  const { camionesModal, pedidosModal, tiempoRealModal, tiempoSimuladoModal, fechaInicialModal ,fechaFinalModal, ultimaDataModal,tipoSimulacion } = resumen;

  const bloqueosLenght = ultimaDataModal?.current?.bloqueos?.length ?? 0;
  const rutas = ultimaDataModal?.current?.rutas || [];
  const tiempoRealMinutos = Math.floor(tiempoRealModal / 60);
  const diasSimulados = Math.floor(tiempoSimuladoModal / 24);
  const horasSimuladas = Math.floor(tiempoSimuladoModal % 24);
  const minutosSimulados = Math.floor((tiempoSimuladoModal * 60) % 60);
  const rangofinalfecha = new Date(fechaFinalModal);
  const rangoiniciofecha = new Date(fechaInicialModal);
  
  // Función para descargar el contenido como archivo
  const handleDownload = () => {
    const contenido = `
    Resumen de la Simulación
    ========================
    Rango de Fechas Simuladas: ${rangoiniciofecha.toLocaleDateString()} - ${rangofinalfecha.toLocaleDateString()}
    Camiones Completados: ${camionesModal}
    Pedidos Completados: ${pedidosModal}
    Tiempo Real Transcurrido: ${tiempoRealMinutos} minutos
    Tiempo Simulado: ${diasSimulados} días, ${horasSimuladas} horas, ${minutosSimulados} minutos

    Ultima Simulación de Pedidos Exitosa:
    ====================================
    Cantidad de tramos bloqueados: ${bloqueosLenght}
    Rutas: ${rutas.length}
    ${rutas
      .map((ruta, index) => {
        const origen = ruta.tramos[0]?.nombreOrigen || 'Origen no disponible';
        const destino = ruta.tramos[ruta.tramos.length - 1]?.nombreOrigen || 'Destino no disponible';
        return `Ruta ${index + 1}: Camión: ${ruta.camion.codigo}, Capacidad: ${ruta.camion.capacidad}, Carga Actual: ${ruta.camion.cargaActual}, Origen: ${origen}, Destino: ${destino}`
      })
      .join('\n')}
    `;

    // Crear un blob y un enlace de descarga
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = 'resumen_simulacion.txt';
    enlace.click();
  };

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
        <Button key="descargar" type="default" onClick={handleDownload}>
          Descargar
        </Button>,
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
      {rutas.map((ruta, index) => {
          const origen = ruta.tramos[0]?.nombreOrigen || 'Origen no disponible';
          const destino = ruta.tramos[ruta.tramos.length - 1]?.nombreOrigen || 'Destino no disponible';
          return (
            <li key={index}>
              <b>Camión:</b> {ruta.camion.codigo}, 
              <b> Capacidad:</b> {ruta.camion.capacidad}, 
              <b> Carga Actual:</b> {ruta.camion.cargaActual}, 
              <b> Origen:</b> {origen}, 
              <b> Destino:</b> {destino}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
};

export default ResumenSimu;