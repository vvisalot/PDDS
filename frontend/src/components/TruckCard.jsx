import { Collapse, Space, Tag, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FaBox, FaCalendar, FaChevronDown, FaChevronUp, FaClock, FaTruck } from 'react-icons/fa';

const { Text } = Typography;

const TruckCard = ({ camionData, isSelected, currentTime }) => {
    const { camion, tramos } = camionData;
    const currentTimeObj = dayjs(currentTime);
    const [isCompletedSectionsOpen, setIsCompletedSectionsOpen] = useState(false);

    const calcularCargaActual = () => {
        const cargaInicial = camion.paquetes.reduce((total, paquete) => total + paquete.cantidadTotal, 0);
        let cargaEntregada = 0;
        for (const tramo of tramos) {
            if (currentTimeObj.isAfter(dayjs(tramo.tiempoLlegada)) && tramo.seDejaraElPaquete) {
                const entregaEnDestino = camion.paquetes
                    .filter(paquete =>
                        paquete.destino.latitud === tramo.destino.latitud &&
                        paquete.destino.longitud === tramo.destino.longitud
                    ).reduce((total, paquete) => total + paquete.cantidadEntregada, 0);
                cargaEntregada += entregaEnDestino;
            }
        }
        return cargaInicial - cargaEntregada;
    };

    const cargaActual = Math.min(calcularCargaActual(), camion.capacidad);

    const HeaderContent = () => (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
                <FaTruck
                    size={20}
                    color={isSelected ? '#f5222d' : '#1890ff'}
                />
                <Text strong>{camion.codigo}</Text>
            </Space>
            <Tag color="blue">
                <FaBox size={12} style={{ marginRight: 4 }} />
                {cargaActual}/{camion.capacidad}
            </Tag>
        </Space>
    );

    const TimeTag = ({ time }) => (
        <Tag style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>
            <Space direction="vertical" size={2}>
                <Space>
                    <FaClock size={12} />
                    <span>{time.format('HH:mm')}</span>
                </Space>
                <Space>
                    <FaCalendar size={12} />
                    <span>{time.format('DD/MM')}</span>
                </Space>
            </Space>
        </Tag>
    );

    const renderTramoContent = (tramo, index) => {
        const startTime = dayjs(tramo.tiempoSalida);
        const endTime = dayjs(tramo.tiempoLlegada);
        const entregasEnDestino = camion.paquetes
            .filter(paquete =>
                paquete.destino.latitud === tramo.destino.latitud &&
                paquete.destino.longitud === tramo.destino.longitud
            )
            .reduce((total, paquete) => total + paquete.cantidadEntregada, 0);

        return (
            <Space direction="vertical" size={12}>
                <Space>
                    <TimeTag time={startTime} />
                    <Text>
                        {index === 0
                            ? `Salió del almacén principal ubicado en ${tramo.nombreOrigen} con ${camion.paquetes.length} órdenes`
                            : `Continuó ruta desde ${tramo.nombreOrigen}`
                        }
                    </Text>
                </Space>
                <Space>
                    <TimeTag time={endTime} />
                    <Text>
                        {tramo.seDejaraElPaquete
                            ? `Entregó ${entregasEnDestino} pedido(s) en ${tramo.nombreDestino}`
                            : index === tramos.length - 1
                                ? `Volvió al almacén principal ${tramo.nombreDestino}`
                                : `Pasó por ${tramo.nombreDestino}`
                        }
                    </Text>
                </Space>
            </Space>
        );
    };

    const RouteTimeline = () => {
        const getCurrentTramoInfo = () => {
            for (let i = 0; i < tramos.length; i++) {
                const startTime = dayjs(tramos[i].tiempoSalida);
                const endTime = dayjs(tramos[i].tiempoLlegada);

                if (currentTimeObj.isBefore(startTime)) {
                    return { index: i, status: 'waiting', tramo: tramos[i] };
                }

                if (currentTimeObj.isBefore(endTime)) {
                    return { index: i, status: 'traveling', tramo: tramos[i] };
                }
            }
            return null;
        };

        const currentTramoInfo = getCurrentTramoInfo();
        const completedTramos = tramos.slice(0, currentTramoInfo ? currentTramoInfo.index : tramos.length);
        const currentAndFutureTramos = tramos.slice(currentTramoInfo ? currentTramoInfo.index : tramos.length);

        return (
            <Space direction="vertical" style={{ width: '100%' }}>
                {completedTramos.length > 0 && (
                    <div>
                        <div
                            onClick={() => setIsCompletedSectionsOpen(!isCompletedSectionsOpen)}
                            style={{ cursor: 'pointer', marginBottom: '8px' }}
                        >
                            <Space>
                                {isCompletedSectionsOpen ? <FaChevronUp /> : <FaChevronDown />}
                                <Text strong>Secciones completadas</Text>
                            </Space>
                        </div>
                        {isCompletedSectionsOpen && (
                            <Timeline
                                items={completedTramos.map((tramo, index) => ({
                                    color: tramo.seDejaraElPaquete ? 'green' : 'blue',
                                    children: renderTramoContent(tramo, index)
                                }))}
                            />
                        )}
                    </div>
                )}
                <Timeline
                    style={{ marginTop: 8 }}
                    items={currentAndFutureTramos.map((tramo, index) => {
                        const actualIndex = index + completedTramos.length;
                        const startTime = dayjs(tramo.tiempoSalida);

                        let content;
                        if (currentTramoInfo && actualIndex === currentTramoInfo.index) {
                            if (currentTramoInfo.status === 'waiting') {
                                content = (
                                    <Text type="secondary" italic>
                                        Esperando hasta las {startTime.format('HH:mm')} para {actualIndex === 0 ? 'salir' : 'continuar'} de {tramo.nombreOrigen}
                                    </Text>
                                );
                            } else {
                                content = renderTramoContent(tramo, actualIndex);
                            }
                        } else if (currentTimeObj.isBefore(startTime)) {
                            content = (
                                <Text type="secondary">
                                    Próxima parada: {tramo.nombreDestino}
                                </Text>
                            );
                        }

                        return {
                            color: tramo.seDejaraElPaquete ? 'green' : 'blue',
                            children: content
                        };
                    }).filter(Boolean)}
                />
            </Space>
        );
    };

    return (
        <Collapse
            defaultActiveKey={['1']}
            items={[{
                key: '1',
                label: <HeaderContent />,
                children: <RouteTimeline />
            }]}
            style={{
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
    isSelected: PropTypes.bool,
    currentTime: PropTypes.string.isRequired
};

export default TruckCard;