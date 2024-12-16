import { CloseOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Space, Tag, Typography } from 'antd';
import PropTypes from 'prop-types';
import { FaWarehouse, FaTruck } from 'react-icons/fa';

const { Title, Text } = Typography;

const AlmacenMapCard = ({ selectedAlmacen, onClose, simulatedTime }) => {
    if (!selectedAlmacen) return null;

    const cardStyle = {
        position: "absolute",
        top: "310px",
        right: "20px",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: "5px",
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: 350,
        margin: '20px auto',
    };

    const getCapacidadColor = () => {
        const usageRatio = selectedAlmacen.cargaActual / selectedAlmacen.ubigeo;
        if (usageRatio > 0.75) return 'red';  // Alto uso
        if (usageRatio > 0.5) return 'orange';  // Uso medio
        return 'green';  // Bajo uso
    };

    return (
        <Card
            title={
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
                    <Space direction="vertical" size={0}>
                        <Text strong>Provincia: {selectedAlmacen.ciudad}</Text>
                        <Text strong>Departamento: {selectedAlmacen.departamento}</Text>
                        <Text strong>Región: {selectedAlmacen.region}</Text>
                        <Text strong>Ubigeo: {selectedAlmacen.id}</Text>
                    </Space>
                </Space>
            }
            extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
            style={cardStyle}
        >
            <Collapse>
                <Collapse.Panel header={<Title level={5}>Flujo Camión</Title>} key="1">
                    {selectedAlmacen.camiones.map((camion) => (
                        <Space
                            key={camion.codigo}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 8,
                            }}
                        >
                            <Space>
                                <FaTruck size={16} />
                                <Text>Camión {camion.codigo}</Text>
                            </Space>
                            <Tag color="blue">{camion.cantidadPedido} unidades</Tag>
                        </Space>
                    ))}
                </Collapse.Panel>
            </Collapse>
        </Card>
    );
};

AlmacenMapCard.propTypes = {
    selectedAlmacen: PropTypes.shape({
        id: PropTypes.string.isRequired,
        ciudad: PropTypes.string.isRequired,
        departamento: PropTypes.string.isRequired,
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
        region: PropTypes.string.isRequired,
        ubigeo: PropTypes.number.isRequired,
        cargaActual: PropTypes.number.isRequired,
        camiones: PropTypes.arrayOf(PropTypes.shape({
            codigo: PropTypes.string.isRequired,
            cantidadPedido: PropTypes.number.isRequired
        })).isRequired
    }),
    onClose: PropTypes.func.isRequired,
    simulatedTime: PropTypes.string.isRequired
};

export default AlmacenMapCard;