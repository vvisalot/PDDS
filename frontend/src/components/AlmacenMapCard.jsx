import { Card, Empty, Space, Tag, Typography } from 'antd';
import PropTypes from 'prop-types';
import { FaTruck, FaWarehouse } from 'react-icons/fa';

const { Title, Text } = Typography;

const AlmacenMapCard = ({ selectedAlmacen, simulatedTime }) => {
    if (!selectedAlmacen) return null;

    const baseCardStyle = {
        position: "absolute",
        right: "20px",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: "5px",
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: 350,
    };

    const getCapacidadColor = () => {
        const usageRatio = selectedAlmacen.cargaActual / selectedAlmacen.ubigeo;
        if (usageRatio > 0.75) return 'red';
        if (usageRatio > 0.5) return 'orange';
        return 'green';
    };

    const compareTimes = (simulated, arrival) => {
        return new Date(simulated) > new Date(arrival);
    };

    return (
        <>
            {/* Card de Información del Almacén */}
            <Card
                style={{
                    ...baseCardStyle,
                    top: "20px",
                }}
                bodyStyle={{
                    padding: '16px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}
            >
                <div style={{
                    position: 'sticky', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    paddingBottom: '12px', marginBottom: '12px',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Space style={{ justifyContent: 'space-between', width: "100%" }}>
                            <Space>
                                <FaWarehouse size={20} color={getCapacidadColor()} />
                                <Title level={5} style={{ margin: 0 }}>Almacén {selectedAlmacen.id}</Title>
                            </Space>
                            <Tag color={getCapacidadColor()}>
                                {selectedAlmacen.cargaActual}/{selectedAlmacen.ubigeo} kg
                            </Tag>
                        </Space>
                    </Space>
                </div>

                <Space direction="vertical" size={0} style={{ width: "100%" }}>
                    <Text strong>Provincia: {selectedAlmacen.ciudad}</Text>
                    <Text strong>Departamento: {selectedAlmacen.departamento}</Text>
                    <Space style={{ justifyContent: 'space-between', width: "100%" }}>
                        <Text strong>Región: {selectedAlmacen.region}</Text>
                        <Text strong>Ubigeo: {selectedAlmacen.id}</Text>
                    </Space>
                </Space>
            </Card>

            {/* Card de Flujo de Camiones */}
            <Card
                style={{
                    ...baseCardStyle,
                    top: "190px",
                }}
                bodyStyle={{
                    padding: '16px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}
            >
                <div style={{
                    position: 'sticky', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    paddingBottom: '12px', marginBottom: '12px',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <Title level={5} style={{ margin: 0 }}>Flujo de Camiones</Title>
                </div>

                {selectedAlmacen.camiones.length > 0 ? (
                    selectedAlmacen.camiones.map((camion) => {
                        const entregado = compareTimes(simulatedTime, camion.tiempoLlegada);
                        return (
                            <Space
                                key={camion.codigo}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                    marginBottom: 8,
                                }}
                            >
                                <Space>
                                    <FaTruck size={16} />
                                    <Text>Camión {camion.codigo}</Text>
                                </Space>
                                <Space>
                                    <Tag color={entregado ? "green" : "red"}>
                                        {entregado ? "Entregado" : "Pendiente"}
                                    </Tag>
                                    <Tag color="blue">{camion.cantidadPedido} unidades</Tag>
                                </Space>
                            </Space>
                        );
                    })
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No han pasado camiones por esta oficina"
                    />
                )}
            </Card>
        </>
    );
};

AlmacenMapCard.propTypes = {
    selectedAlmacen: PropTypes.object,
    simulatedTime: PropTypes.string,
};

export default AlmacenMapCard;