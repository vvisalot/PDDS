import { CloseOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { FaTruck } from 'react-icons/fa';

const { Title, Text } = Typography;

const TruckMapCard = ({ selectedTruck, onClose, simulatedTime }) => {
	if (!selectedTruck) return null;

	const currentTimeObj = dayjs(simulatedTime);

	// Encontrar el tramo actual
	const getCurrentTramo = () => {
		for (const tramo of selectedTruck.tramos) {
			const startTime = dayjs(tramo.tiempoSalida);
			const endTime = dayjs(tramo.tiempoLlegada);

			if (currentTimeObj.isBefore(startTime)) {
				return { tramo, status: 'waiting' };
			}
			if (currentTimeObj.isBefore(endTime)) {
				return { tramo, status: 'traveling' };
			}
		}
		return null;
	};

	const currentTramo = getCurrentTramo();

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

	const getEstadoActual = () => {
		if (!currentTramo) return "En espera";

		switch (currentTramo.status) {
			case 'waiting':
				return `Esperando para ${currentTramo.tramo.seDejaraElPaquete ? 'entregar en' : 'partir hacia'} ${currentTramo.tramo.nombreDestino}`;
			case 'traveling':
				return currentTramo.tramo.seDejaraElPaquete
					? `Viajando a ${currentTramo.tramo.nombreDestino} para entregar`
					: `Viajando a ${currentTramo.tramo.nombreDestino}`;
			default:
				return "En ruta";
		}
	};

	return (
		<Card
			title={
				<Space>
					<FaTruck size={20} />
					<Title level={5} style={{ margin: 0 }}>Camión {selectedTruck.camion.codigo}</Title>
					<Tag color="blue">{selectedTruck.camion.capacidad} kg</Tag>
				</Space>
			}
			extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
			style={cardStyle}
		>
			<Descriptions column={1}>
				<Descriptions.Item label="Carga Actual">{selectedTruck.camion.cargaActual} kg</Descriptions.Item>
				<Descriptions.Item label="Estado Actual">{getEstadoActual()}</Descriptions.Item>
				{currentTramo && (
					<>
						<Descriptions.Item label="Origen">{currentTramo.tramo.nombreOrigen}</Descriptions.Item>
						<Descriptions.Item label="Destino">{currentTramo.tramo.nombreDestino}</Descriptions.Item>
						<Descriptions.Item label="Hora Llegada">
							{dayjs(currentTramo.tramo.tiempoLlegada).format('HH:mm')}
						</Descriptions.Item>
					</>
				)}
				<Descriptions.Item label="Órdenes a entregar">{selectedTruck.camion.paquetes.length}</Descriptions.Item>
			</Descriptions>
		</Card>
	);
};

TruckMapCard.propTypes = {
	selectedTruck: PropTypes.shape({
		camion: PropTypes.shape({
			codigo: PropTypes.string.isRequired,
			capacidad: PropTypes.number.isRequired,
			cargaActual: PropTypes.number.isRequired,
			paquetes: PropTypes.arrayOf(PropTypes.shape({
				codigo: PropTypes.string.isRequired
			})).isRequired
		}).isRequired,
		tramos: PropTypes.arrayOf(PropTypes.shape({
			nombreOrigen: PropTypes.string.isRequired,
			nombreDestino: PropTypes.string.isRequired,
			tiempoSalida: PropTypes.string.isRequired,
			tiempoLlegada: PropTypes.string.isRequired,
			seDejaraElPaquete: PropTypes.bool.isRequired
		})).isRequired
	}),
	onClose: PropTypes.func.isRequired,
	simulatedTime: PropTypes.string.isRequired
};

export default TruckMapCard;