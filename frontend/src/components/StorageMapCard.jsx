import { CloseOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Space, Typography } from 'antd';
import PropTypes from 'prop-types';
import { FaTruck } from 'react-icons/fa';

const { Title } = Typography;

const StorageMapCard = ({ selectedTruck, onClose }) => {
    if (!selectedTruck) return null;
    // console.log(selectedTruck);

    const cardStyle = {
        position: "absolute",
        top: "310px",
        right: "20px",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: "5px",
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: 350,
        margin: '20px auto'
    };

    return (
        <Card
            title={
                <Space>
                    <FaTruck size={20} />
                    <Title level={5} style={{ margin: 0 }}>
                        Camión {selectedTruck.camion.codigo}
                    </Title>
                </Space>
            }
            extra={
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={onClose}
                />
            }
            style={cardStyle}
        >
            <Descriptions column={1}>
                <Descriptions.Item label="Capacidad">{selectedTruck.camion.capacidad} kg</Descriptions.Item>
                <Descriptions.Item label="Carga Actual">{selectedTruck.camion.cargaActual} kg</Descriptions.Item>
                <Descriptions.Item label="Total Órdenes">{selectedTruck.camion.paquetes.length}</Descriptions.Item>
                <Descriptions.Item label="Estado">En ruta</Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

StorageMapCard.propTypes = {
    selectedTruck: PropTypes.shape({
        camion: PropTypes.shape({
            codigo: PropTypes.string.isRequired,
            capacidad: PropTypes.number.isRequired,
            cargaActual: PropTypes.number.isRequired,
            paquetes: PropTypes.arrayOf(PropTypes.shape({
                codigo: PropTypes.string.isRequired
            })).isRequired
        }).isRequired
    }),
    onClose: PropTypes.func.isRequired
};


export default StorageMapCard;