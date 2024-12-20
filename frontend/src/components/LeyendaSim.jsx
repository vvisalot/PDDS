import { Card } from "antd";
import React from 'react';
import { FaBoxOpen, FaTruck } from 'react-icons/fa';

const LeyendaSim = ({ totalCamionesSimulacion, camionesEnMapa, totalPedidos, pedidosEntregados }) => {
    const cardStyle = {
        position: "absolute",
        top: "250px",
        left: "10px",
        zIndex: 1000,
        borderRadius: "5px",
        width: 280,
    };

    const totalTrucks = 88;
    const fleetUsagePercentage = ((camionesEnMapa / totalTrucks) * 100).toFixed(2);

    return (
      <Card style={cardStyle} bordered>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p> <FaTruck size={17} color="orange" style={{ marginRight: '8px' }} />
                  <strong>Total camiones utilizados:</strong>
                  <span style={{ marginLeft: '10px' }}>{totalCamionesSimulacion}</span>
              </p>
              <p> <FaTruck size={17} color="darkblue" style={{ marginRight: '8px' }} />
                  <strong>Camiones en mapa:</strong>
                  <span style={{ marginLeft: '10px' }}>{camionesEnMapa}</span>
              </p>
              <p> <FaTruck size={17} color="purple" style={{ marginRight: '8px' }} />
                  <strong>Porcentaje de uso de la flota:</strong>
                  <span style={{ marginLeft: '10px' }}>{fleetUsagePercentage}%</span>
              </p>
              <p> <FaBoxOpen size={17} color="lightblack" style={{ marginRight: '8px' }} />
                  <strong>Pedidos totales:</strong>
                  <span style={{ marginLeft: '10px' }}>{totalPedidos}</span>
              </p>
              <p> <FaBoxOpen size={17} color="green" style={{ marginRight: '8px' }} />
                  <strong>Pedidos entregados:</strong>
                  <span style={{ marginLeft: '10px' }}>{pedidosEntregados}</span>
              </p>
          </div>
      </Card>
    );
};

export default LeyendaSim;