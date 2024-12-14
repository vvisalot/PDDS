import { Collapse, Space, Tag, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import { FaBox, FaClock, FaTruck } from 'react-icons/fa';

const { Text } = Typography;

const TruckCard = ({ camionData, isSelected }) => {
    const { camion, tramos } = camionData;

    const HeaderContent = () => (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
                <FaTruck
                    size={20}
                    color={isSelected ? '#f5222d' : '#1890ff'}
                />
                <Text strong>{camion.codigo}</Text>
            </Space>
            <Text>Capacidad: {camion.cargaActual}/{camion.capacidad}</Text>
        </Space>
    );

    const RouteTimeline = () => (
        <Timeline
            style={{ marginTop: 8 }}
            items={tramos.map((tramo, index) => ({
                color: tramo.seDejaraElPaquete ? 'green' : 'blue',
                children: (
                    <>
                        {/* Salida */}
                        <Space direction="vertical" size={12} style={{ marginBottom: 8, width: "100%" }}>
                            <Space>
                                <FaClock size={12} />
                                <Text>{dayjs(tramo.tiempoSalida).format('HH:mm')}</Text>
                                <Text >
                                    {index === 0 ?
                                        `Salió de ${tramo.nombreOrigen} con ${camion.paquetes.length} órdenes` :
                                        `Continuó ruta desde ${tramo.nombreOrigen}`
                                    }
                                </Text>
                            </Space>
                        </Space>

                        {/* Llegada */}
                        <Space direction="vertical" size={1} style={{ width: "100%" }}>
                            <Space>
                                <FaClock size={12} />
                                <Text>{dayjs(tramo.tiempoLlegada).format('HH:mm')}</Text>
                                <Text>
                                    {tramo.seDejaraElPaquete ? (
                                        `Entregó ${camion.paquetes.filter(paquete =>
                                            paquete.destino.latitud === tramo.destino.latitud &&
                                            paquete.destino.longitud === tramo.destino.longitud
                                        ).length} orden en ${tramo.nombreDestino}`
                                    ) : (
                                        `Llegó a ${tramo.nombreDestino}`
                                    )}
                                </Text>
                            </Space>

                            {/* Paquetes entregados */}
                            {tramo.seDejaraElPaquete && (
                                <Text type="secondary" style={{ paddingLeft: 20 }}>
                                    {camion.paquetes
                                        .filter(paquete =>
                                            paquete.destino.latitud === tramo.destino.latitud &&
                                            paquete.destino.longitud === tramo.destino.longitud
                                        )
                                        .map(paquete => paquete.cantidadEntregada)
                                        .join(' + ')} paquetes
                                </Text>
                            )}
                        </Space>
                    </>
                )
            }))}
        />
    );

    return (
        <Collapse
            defaultActiveKey={isSelected ? ['1'] : []}
            items={[{
                key: '1',
                label: <HeaderContent />,
                children: <RouteTimeline />
            }]}
            style={{
                marginBottom: 8,
                backgroundColor: isSelected ? '#fafafa' : '#fff'
            }}
        />
    );
};

TruckCard.propTypes = {
    camionData: PropTypes.shape({
        camion: PropTypes.shape({
            codigo: PropTypes.string.isRequired,
            capacidad: PropTypes.number.isRequired,
            cargaActual: PropTypes.number.isRequired,
            paquetes: PropTypes.arrayOf(PropTypes.shape({
                codigo: PropTypes.string.isRequired,
                destino: PropTypes.shape({
                    latitud: PropTypes.number.isRequired,
                    longitud: PropTypes.number.isRequired
                }).isRequired,
                cantidadEntregada: PropTypes.number.isRequired
            })).isRequired
        }).isRequired,
        tramos: PropTypes.arrayOf(PropTypes.shape({
            nombreOrigen: PropTypes.string.isRequired,
            nombreDestino: PropTypes.string.isRequired,
            tiempoSalida: PropTypes.string.isRequired,
            tiempoLlegada: PropTypes.string.isRequired,
            tiempoEspera: PropTypes.number.isRequired,
            seDejaraElPaquete: PropTypes.bool.isRequired,
            destino: PropTypes.shape({
                latitud: PropTypes.number.isRequired,
                longitud: PropTypes.number.isRequired
            }).isRequired
        })).isRequired
    }).isRequired,
    isSelected: PropTypes.bool
};

export default TruckCard;