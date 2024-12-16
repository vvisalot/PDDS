import React from 'react';
import { Card, Space, Typography } from "antd";
import { FaBoxOpen, FaTruck } from 'react-icons/fa';


const LeyendaPlanif = ({totalCamionesSimulacion, camionesEnMapa, totalPedidos, pedidosEntregados}) => {
    const cardStyle = {
        position: "absolute",
        bottom: "8px",
        left: "20px",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "10px",
        borderRadius: "5px",
        //boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
        //no se estos van
        maxWidth: 500,
        margin: '20px auto'
    };

    return (
        <Card style={cardStyle}>
            <Typography style={{ marginTop: '0px', marginBottom: '10px', fontSize: '17px' }}>
                <strong>Información de la Planificacion</strong>
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

export default LeyendaPlanif;