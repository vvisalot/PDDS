import { Card, Space, Typography } from "antd";
import React from 'react';
import { FaBoxOpen, FaTruck } from 'react-icons/fa';


const LeyendaSim = ({ totalCamionesSimulacion, camionesEnMapa, totalPedidos, pedidosEntregados }) => {
    const cardStyle = {
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: "5px",
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: 350,
        margin: '20px auto'
    };

    return (
        <Card style={cardStyle} bordered>
            <Typography style={{ marginTop: '0px', marginBottom: '10px', fontSize: '17px' }}>
                <strong>Informacion de la simulación:</strong>
            </Typography>

            <div style={{ marginTop: '10px', marginLeft: '0px', fontSize: '14px', lineHeight: '1.6' }}>
                <p> <FaTruck size={17} color="orange" style={{ marginRight: '8px' }} />
                    <strong>Total camiones en simulación:</strong> <span style={{ marginLeft: '13px' }}>{totalCamionesSimulacion}</span>
                </p>
                <p> <FaTruck size={17} color="darkblue" style={{ marginRight: '8px' }} />
                    <strong>Camiones en Mapa:</strong> <span style={{ marginLeft: '85px' }}>{camionesEnMapa}</span>
                </p>
                <p> <FaBoxOpen size={17} color="lightblack" style={{ marginRight: '8px' }} />
                    <strong>Pedidos totales:</strong> <span style={{ marginLeft: '113px' }}>{totalPedidos}</span>
                </p>
                <p> <FaBoxOpen size={17} color="green" style={{ marginRight: '8px' }} />
                    <strong>Pedidos entregados:</strong> <span style={{ marginLeft: '81px' }}>{pedidosEntregados}</span>
                </p>
            </div>

        </Card>
    );
};

export default LeyendaSim;