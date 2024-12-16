import { CloseOutlined } from '@ant-design/icons';
import { Button, Card, Divider, List, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { FaBox, FaTruck } from 'react-icons/fa';

const { Title, Text } = Typography;

const TruckMapCard = ({ selectedTruck, onClose, simulatedTime, truckPositions }) => {
	if (!selectedTruck) return null;

	const cardStyle = {
		position: "absolute",
		top: "350px",
		right: "20px",
		zIndex: 1000,
		backgroundColor: "white",
		borderRadius: "8px",
		boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
		width: 350,
		maxHeight: '60vh',
		overflowY: 'auto'
	};

	const bodyStyle = {
		maxHeight: 'calc(70vh - 55px)', // 55px es aproximadamente el alto del título
		overflowY: 'auto',
	};

	const currentPosition = truckPositions[selectedTruck.camion.codigo];
	const currentTimeObj = dayjs(simulatedTime);

	// Verificar estado de cada pedido
	const getPedidoStatus = (pedido) => {
		const destino = pedido.destino;
		const tramoEntrega = selectedTruck.tramos.find(tramo =>
			tramo.seDejaraElPaquete &&
			tramo.destino.latitud === destino.latitud &&
			tramo.destino.longitud === destino.longitud
		);

		if (!tramoEntrega) return 'pendiente';
		return currentTimeObj.isAfter(dayjs(tramoEntrega.tiempoLlegada)) ? 'entregado' : 'pendiente';
	};

	// Encontrar tramo actual
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

	return (
		<Card
			title={
				<Space style={{ width: '100%', justifyContent: 'space-between' }}>
					<Space>
						<FaTruck size={20} />
						<Text strong>Camión {selectedTruck.camion.codigo}</Text>
					</Space>
					<Tag color="blue">
						<FaBox size={12} style={{ marginRight: 4 }} />
						{selectedTruck.camion.cargaActual}/{selectedTruck.camion.capacidad}
					</Tag>
					{currentPosition && (
						<div>
							<Text type="secondary">
								{currentPosition.lat.toFixed(2)}, {currentPosition.lng.toFixed(2)}
							</Text>
						</div>
					)}

				</Space>
			}
			// extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
			style={cardStyle}
		>

			{/* Información básica */}
			<Space direction="vertical" style={{ width: '100%' }}>
				{/* Lista de pedidos */}
				<Typography orientation="left">Lista de pedidos</Typography>
				<List
					size="small"
					dataSource={selectedTruck.camion.paquetes}
					renderItem={paquete => {
						const status = getPedidoStatus(paquete);
						return (
							<List.Item>
								<Space>
									<FaBox />
									<Text>{paquete.cantidadTotal} kg</Text>
									<Tag color={status === 'entregado' ? 'success' : 'processing'}>
										{status}
									</Tag>
								</Space>
								<div>
									<Text type="secondary">
										Registro: {dayjs(paquete.fechaHoraPedido).format('DD/MM/YY')}
									</Text>
								</div>
							</List.Item>
						);
					}}
				/>

				{/* Ruta actual */}
				<Typography orientation="left">Ruta tomada</Typography>
				{currentTramo && (
					<Space direction="vertical" style={{ width: '100%' }}>
						<Text>
							{currentTramo.status === 'waiting' ? 'En espera' : 'En camino'}
						</Text>
						<Space direction="vertical" style={{ paddingLeft: 20 }}>
							<Text type="secondary">
								Origen: {currentTramo.tramo.nombreOrigen} ({dayjs(currentTramo.tramo.tiempoSalida).format('HH:mm')})
							</Text>
							<Text type="secondary">
								Destino: {currentTramo.tramo.nombreDestino} ({dayjs(currentTramo.tramo.tiempoLlegada).format('HH:mm')})
							</Text>
						</Space>
					</Space>
				)}
			</Space>
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
				codigo: PropTypes.string.isRequired,
				cantidadTotal: PropTypes.number.isRequired,
				cantidadEntregada: PropTypes.number.isRequired,
				fechaHoraPedido: PropTypes.string.isRequired,
				destino: PropTypes.shape({
					latitud: PropTypes.number.isRequired,
					longitud: PropTypes.number.isRequired
				}).isRequired
			})).isRequired
		}).isRequired,
		tramos: PropTypes.arrayOf(PropTypes.shape({
			nombreOrigen: PropTypes.string.isRequired,
			nombreDestino: PropTypes.string.isRequired,
			tiempoSalida: PropTypes.string.isRequired,
			tiempoLlegada: PropTypes.string.isRequired,
			seDejaraElPaquete: PropTypes.bool.isRequired
		})).isRequired
	}).isRequired,
	onClose: PropTypes.func.isRequired,
	simulatedTime: PropTypes.string.isRequired,
	truckPositions: PropTypes.object.isRequired
};

export default TruckMapCard;