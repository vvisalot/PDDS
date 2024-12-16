import { Collapse, Space, Tag, Typography } from 'antd';
import { FaCalendar, FaClock, FaBox } from 'react-icons/fa';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

const { Text, Title } = Typography;

const PedidoCard = ({ pedidoData }) => {
    const { idPedido, fechaHoraEntrega, destino, cantidad, idCliente, entregado } = pedidoData;

    const HeaderContent = () => (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
                <FaBox size={20} color={entregado ? 'green' : 'red'} />
                <Text strong>{idPedido}</Text>
            </Space>
            <Tag color={entregado ? 'green' : 'red'}>
                {entregado ? "Entregado" : "Pendiente"}
            </Tag>
        </Space>
    );

    const Content = () => (
        <Space direction="vertical" style={{ marginTop: 8 }}>
            <Title level={5}>Pedido: {pedidoData.idPedido}</Title>
            <Text>Cliente: {pedidoData.idCliente}</Text>
            <br />
            <Text>Cantidad Total: {pedidoData.cantidadTotal}</Text>
            <br />
            <Text>Destino: {pedidoData.destino}</Text>
            <br />
            <Text type="success">Estado: Entregado</Text>
        </Space>
    );

    return (
        <Collapse defaultActiveKey={['1']} items={[
            {
                key: '1',
                label: <HeaderContent />,
                children: <Content />
            }
        ]} />
    );
};

PedidoCard.propTypes = {
    pedidoData: PropTypes.shape({
        idPedido: PropTypes.string.isRequired,
        fechaHoraEntrega: PropTypes.string.isRequired,
        destino: PropTypes.shape({
            latitud: PropTypes.number.isRequired,
            longitud: PropTypes.number.isRequired
        }).isRequired,
        cantidad: PropTypes.number.isRequired,
        idCliente: PropTypes.string.isRequired,
        entregado: PropTypes.bool.isRequired
    }).isRequired
};

export default PedidoCard;
