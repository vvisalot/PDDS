import { Card, Empty, Space, Tag, Typography } from 'antd';
import PropTypes from 'prop-types';
import { FaTruck, FaWarehouse } from 'react-icons/fa';

const { Title, Text } = Typography;

const oficinasPrincipales = [
    { id: '130101', departamento: 'LA LIBERTAD', ciudad: 'TRUJILLO', lat: -8.11176389, lng: -79.02868652, region: 'COSTA', ubigeo: 54 },
    { id: '150101', departamento: 'LIMA', ciudad: 'LIMA', lat: -12.04591952, lng: -77.03049615, region: 'COSTA', ubigeo: 100 },
    { id: '040101', departamento: 'AREQUIPA', ciudad: 'AREQUIPA', lat: -16.39881421, lng: -71.537019649, region: 'COSTA', ubigeo: 177 },
];

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
        // Si es oficina principal, siempre verde
        if (oficinasPrincipales.some(op => op.id === selectedAlmacen.id)) {
            return 'green';
        }
        const usageRatio = selectedAlmacen.cargaActual / selectedAlmacen.ubigeo;
        if (usageRatio > 0.75) return 'red';
        if (usageRatio > 0.5) return 'orange';
        return 'green';
    };

    const compareTimes = (simulated, arrival) => {
        return new Date(simulated) > new Date(arrival);
    };

    const isOficinaPrincipal = oficinasPrincipales.some(op => op.id === selectedAlmacen.id);

    const renderCapacidadTag = () => {
        if (isOficinaPrincipal) {
            return (
                <Tag color="green">
                    Ilimitado
                </Tag>
            );
        }
        return (
            <Tag color={getCapacidadColor()}>
                {selectedAlmacen.cargaActual}/{selectedAlmacen.ubigeo} pedidos
            </Tag>
        );
    };

    const renderCamionesCard = () => {
        if (isOficinaPrincipal) {
            return (
                <>
                    <Title level={5} style={{ margin: 0 }}>Camiones Despachados</Title>
                    {selectedAlmacen.camiones?.length > 0 ? (
                        selectedAlmacen.camiones.map((camion) => {
                            const enRuta = compareTimes(simulatedTime, camion.tiempoSalida);
                            const porcentajeUso = ((camion.cargaActual / camion.capacidad) * 100).toFixed(1);

                            return (
                                <Space
                                    key={camion.codigo}
                                    direction="vertical"
                                    style={{
                                        width: "100%",
                                        marginBottom: 16,
                                        padding: 8,
                                        border: '1px solid #f0f0f0',
                                        borderRadius: 4
                                    }}
                                >
                                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                                        <Space>
                                            <FaTruck size={16} />
                                            <Text strong>Camión {camion.codigo}</Text>
                                        </Space>
                                        <Tag color={enRuta ? "green" : "orange"}>
                                            {enRuta ? "En ruta" : "Por salir"}
                                        </Tag>
                                    </Space>

                                    <Space direction="vertical" size={0} style={{ width: "100%" }}>
                                        <Text>
                                            Destino: {camion.destino.ciudad}, {camion.destino.departamento}
                                        </Text>
                                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                                            <Text type="secondary">
                                                Paquetes: {camion.paquetes}
                                            </Text>
                                            <Tag color="blue">
                                                Capacidad: {porcentajeUso}%
                                            </Tag>
                                        </Space>
                                        {enRuta && (
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                Salió: {new Date(camion.tiempoSalida).toLocaleTimeString()}
                                            </Text>
                                        )}
                                    </Space>
                                </Space>
                            );
                        })
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No hay camiones despachados desde esta oficina"
                        />
                    )}
                </>
            );
        }

        // Renderizado para almacenes normales
        return (
            <>
                <Title level={5} style={{ margin: 0 }}>Flujo de Camiones</Title>
                {selectedAlmacen.camiones?.length > 0 ? (
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
            </>
        );
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
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    paddingBottom: '12px',
                    marginBottom: '12px',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Space style={{ justifyContent: 'space-between', width: "100%" }}>
                            <Space>
                                <FaWarehouse
                                    size={20}
                                    color={isOficinaPrincipal ? "darkgreen" : getCapacidadColor()}
                                />
                                <Title level={5} style={{ margin: 0 }}>
                                    {isOficinaPrincipal ? "Oficina Principal" : "Almacén"} {selectedAlmacen.id}
                                </Title>
                            </Space>
                            {renderCapacidadTag()}
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
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}
            >
                <div style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    paddingBottom: '12px',
                    marginBottom: '12px',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    {renderCamionesCard()}
                </div>
            </Card>
        </>
    );
};

AlmacenMapCard.propTypes = {
    selectedAlmacen: PropTypes.object,
    simulatedTime: PropTypes.string,
};

export default AlmacenMapCard;