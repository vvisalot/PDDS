import { Collapse, Space, Tag, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import { FaBox, FaCalendar, FaClock, FaTruck } from 'react-icons/fa';

const { Text } = Typography;

const TruckCard = ({ camionData, isSelected, currentTime }) => {
    const { camion, tramos } = camionData;
    const currentTimeObj = dayjs(currentTime);

    const calcularCargaActual = () => {
        // Carga inicial: suma de todos los paquetes
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

    const cargaActual = calcularCargaActual()

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


    const RouteTimeline = () => {
        // Encontrar el tramo actual basado en el tiempo simulado
        const getCurrentTramoInfo = () => {
            for (let i = 0; i < tramos.length; i++) {
                const startTime = dayjs(tramos[i].tiempoSalida);
                const endTime = dayjs(tramos[i].tiempoLlegada);

                if (currentTimeObj.isBefore(startTime)) {
                    // Esperando para empezar este tramo
                    return {
                        index: i,
                        status: 'waiting',
                        tramo: tramos[i]
                    };
                }

                if (currentTimeObj.isBefore(endTime)) {
                    // En medio de este tramo
                    return {
                        index: i,
                        status: 'traveling',
                        tramo: tramos[i]
                    };
                }
            }
            return null; // Todos los tramos completados
        };

        const currentTramoInfo = getCurrentTramoInfo();

        return (
            <Timeline
                style={{ marginTop: 8 }}
                items={tramos.map((tramo, index) => {
                    const startTime = dayjs(tramo.tiempoSalida);
                    const endTime = dayjs(tramo.tiempoLlegada);

                    // Solo mostrar tramos hasta el actual
                    if (currentTramoInfo && index > currentTramoInfo.index) {
                        return null;
                    }

                    // Determinar el estado de este tramo
                    let content;
                    if (currentTramoInfo && index === currentTramoInfo.index) {
                        if (currentTramoInfo.status === 'waiting') {
                            content = (
                                <Text type="secondary" italic>
                                    Esperando hasta las {startTime.format('HH:mm')} para {index === 0 ? 'salir' : 'continuar'} de {tramo.nombreOrigen}
                                </Text>
                            );
                        } else { // traveling
                            if (index === 0) {
                                // Primera vez que se mueve, justo después de esperar
                                content = (
                                    <Space direction="vertical" size={12}>
                                        <Space>
                                            <Tag style={{
                                                padding: '4px 8px',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                <Space direction="vertical" size={2}>
                                                    <Space>
                                                        <FaClock size={12} />
                                                        <span>{startTime.format('HH:mm')}</span>
                                                    </Space>
                                                    <Space>
                                                        <FaCalendar size={12} />
                                                        <span>{startTime.format('DD/MM')}</span>
                                                    </Space>
                                                </Space>
                                            </Tag>
                                            <Text>
                                                Salió del almacén principal ubicado en {tramo.nombreOrigen} con {camion.paquetes.length} órdenes
                                            </Text>
                                        </Space>
                                        <Space>
                                            <Tag style={{
                                                padding: '4px 8px',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                <Space direction="vertical" size={2}>
                                                    <Space>
                                                        <FaClock size={12} />
                                                        <span>{startTime.format('HH:mm')}</span>
                                                    </Space>
                                                    <Space>
                                                        <FaCalendar size={12} />
                                                        <span>{startTime.format('DD/MM')}</span>
                                                    </Space>
                                                </Space>
                                            </Tag>
                                            <Text>
                                                {tramo.seDejaraElPaquete
                                                    ? `Viajando a ${tramo.nombreDestino} para entregar`
                                                    : `Viajando a ${tramo.nombreDestino}`
                                                }
                                            </Text>
                                        </Space>
                                    </Space>
                                );
                            } else {
                                // Viajes normales
                                content = (
                                    <Space>
                                        <Tag style={{
                                            padding: '4px 8px',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            <Space direction="vertical" size={2}>
                                                <Space>
                                                    <FaClock size={12} />
                                                    <span>{startTime.format('HH:mm')}</span>
                                                </Space>
                                                <Space>
                                                    <FaCalendar size={12} />
                                                    <span>{startTime.format('DD/MM')}</span>
                                                </Space>
                                            </Space>
                                        </Tag>
                                        <Text>
                                            {index === tramos.length - 1
                                                ? `Viajando de regreso al almacén principal ${tramo.nombreDestino}`
                                                : tramo.seDejaraElPaquete
                                                    ? `Viajando a ${tramo.nombreDestino} para entregar`
                                                    : `Viajando a ${tramo.nombreDestino}`
                                            }
                                        </Text>
                                    </Space>
                                );
                            }
                        }
                    } else if (currentTimeObj.isAfter(endTime)) {
                        // Tramo completado
                        const entregasEnDestino = camion.paquetes
                            .filter(paquete =>
                                paquete.destino.latitud === tramo.destino.latitud &&
                                paquete.destino.longitud === tramo.destino.longitud
                            )
                            .reduce((total, paquete) => total + paquete.cantidadEntregada, 0);

                        content = (
                            <Space direction="vertical" size={12}>
                                <Space>
                                    <Tag style={{
                                        padding: '4px 8px',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        <Space direction="vertical" size={2}>
                                            <Space>
                                                <FaClock size={12} />
                                                <span>{startTime.format('HH:mm')}</span>
                                            </Space>
                                            <Space>
                                                <FaCalendar size={12} />
                                                <span>{startTime.format('DD/MM')}</span>
                                            </Space>
                                        </Space>
                                    </Tag>
                                    <Text>
                                        {index === 0
                                            ? `Salió del almacén principal ubicado en ${tramo.nombreOrigen} con ${camion.paquetes.length} órdenes`
                                            : index === tramos.length - 1
                                                ? `Continuó ruta volviendo al almacén principal ${tramo.nombreOrigen}`
                                                : `Continuó ruta desde ${tramo.nombreOrigen}`
                                        }
                                    </Text>
                                </Space>
                                <Space>
                                    <Tag style={{
                                        padding: '4px 8px',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        <Space direction="vertical" size={2}>
                                            <Space>
                                                <FaClock size={12} />
                                                <span>{endTime.format('HH:mm')}</span>
                                            </Space>
                                            <Space>
                                                <FaCalendar size={12} />
                                                <span>{endTime.format('DD/MM')}</span>
                                            </Space>
                                        </Space>
                                    </Tag>
                                    <Text>
                                        {tramo.seDejaraElPaquete
                                            ? `Entregó ${entregasEnDestino} pedido(s) en ${tramo.nombreDestino}`
                                            : index === tramos.length - 1
                                                ? `Volviendo al almacén principal ${tramo.nombreDestino}`
                                                : `Pasó por ${tramo.nombreDestino}`
                                        }
                                    </Text>
                                </Space>
                            </Space>
                        );
                    }

                    return {
                        color: tramo.seDejaraElPaquete && currentTimeObj.isAfter(endTime) ? 'green' : 'blue',
                        children: content
                    };
                }).filter(Boolean)} // Remover items null
            />
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