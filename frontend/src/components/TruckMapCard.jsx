import { Card, Collapse, List, Space, Tag, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { FaBox, FaTruck } from 'react-icons/fa';

const { Text } = Typography;
const { Panel } = Collapse;

const TruckMapCard = ({ selectedTruck, simulatedTime, truckPositions }) => {
	if (!selectedTruck) return null;

	const getCapacityColor = () => {
		const capacidad = selectedTruck.camion.capacidad;
		const cargaActual = selectedTruck.camion.cargaActual;
		const percentage = (cargaActual / capacidad) * 100;

		if (percentage <= 25) return "success";     // Verde normal de Antd
		if (percentage <= 50) return "lime";        // Verde amarillento
		if (percentage <= 75) return "warning";     // Amarillo
		if (percentage <= 90) return "orange";      // Naranja
		return "error";                             // Rojo
	};

	const getCapacityIconColor = () => {
		const capacidad = selectedTruck.camion.capacidad;
		const cargaActual = selectedTruck.camion.cargaActual;
		const percentage = (cargaActual / capacidad) * 100;

		if (percentage <= 25) return "#22c55e";     // Verde
		if (percentage <= 50) return "#84cc16";     // Verde amarillento
		if (percentage <= 75) return "#eab308";     // Amarillo
		if (percentage <= 90) return "#f97316";     // Naranja
		return "#ef4444";                           // Rojo
	};

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
		maxHeight: 'calc(70vh - 55px)',
		overflowY: 'auto',
	};

	const currentPosition = truckPositions[selectedTruck.camion.codigo];
	const currentTimeObj = dayjs(simulatedTime);

	const formatLocation = (location) => {
		const toCamelCase = (str) => {
			return str.split(', ').map(part =>
				part.split(' ').map(word =>
					word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
				).join(' ')
			).join(', ');
		};
		return toCamelCase(location);
	};

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

	const renderPedidosList = () => (
		<List
			size="small"
			dataSource={selectedTruck.camion.paquetes}
			renderItem={paquete => {
				const status = getPedidoStatus(paquete);
				const tramoEntrega = selectedTruck.tramos.find(tramo =>
					tramo.seDejaraElPaquete &&
					tramo.destino.latitud === paquete.destino.latitud &&
					tramo.destino.longitud === paquete.destino.longitud
				);

				return (
					<List.Item style={{
						flexDirection: 'column',
						alignItems: 'flex-start',
					}}>
						<Space align='center' style={{ width: '100%', justifyContent: 'space-between' }}>
							<div>
								<FaBox style={{ marginRight: '2px' }} /> <Text>{paquete.cantidadTotal} unidades</Text>
							</div>
							<Tag color={status === 'entregado' ? 'success' : 'processing'}>
								{status}
							</Tag>
						</Space>

						<div>
							<Text type="secondary">
								Registro: {dayjs(paquete.fechaHoraPedido).format('DD/MM/YYYY, hh:mm A')}
							</Text>
						</div>

						<Text type="secondary">
							Destino: {tramoEntrega?.nombreDestino ? formatLocation(tramoEntrega.nombreDestino) : 'Por definir'}
						</Text>

						{status === 'entregado' && tramoEntrega && (
							<Text type="secondary">
								Entrega: {dayjs(tramoEntrega.tiempoLlegada).format('DD/MM/YYYY, hh:mm A')}
							</Text>
						)}
					</List.Item>
				);
			}}
		/>
	);

	const renderRouteHistory = () => {
		const getTramoStatus = (tramo) => {
			const startTime = dayjs(tramo.tiempoSalida);
			const endTime = dayjs(tramo.tiempoLlegada);

			if (currentTimeObj.isBefore(startTime)) {
				return 'wait';
			}
			if (currentTimeObj.isBefore(endTime)) {
				return 'process';
			}
			return 'finish';
		};

		return (
			<Space direction="vertical" style={{ width: '100%' }}>
				<Timeline>
					{selectedTruck.tramos.map((tramo, index) => {
						const status = getTramoStatus(tramo);
						return (
							<Timeline.Item
								key={index}
								color={status === 'wait' ? 'gray' : status === 'process' ? 'blue' : 'green'}
							>
								<Space direction="vertical" size={1}>
									<Text strong>{formatLocation(tramo.nombreOrigen)} → {formatLocation(tramo.nombreDestino)}</Text>
									<Space direction="vertical" size={0}>
										<Text type="secondary">
											Salida: {dayjs(tramo.tiempoSalida).format('DD/MM/YYYY, HH:mm')}
										</Text>
										<Text type="secondary">
											Llegada: {dayjs(tramo.tiempoLlegada).format('DD/MM/YYYY, HH:mm')}
										</Text>
										{tramo.seDejaraElPaquete && (
											<Tag color="success" style={{ marginTop: '4px' }}>
												Punto de entrega
											</Tag>
										)}
									</Space>
								</Space>
							</Timeline.Item>
						);
					})}
				</Timeline>
			</Space>
		);
	};

	return (
		<Card
			title={
				<Space direction="vertical" style={{ width: '100%', marginTop: '10px', marginBottom: '10px' }}>
					<Space style={{ width: '100%', justifyContent: 'space-between' }}>
						<Space>
							<FaTruck size={20} color={getCapacityIconColor()} />
							<Text strong>Camión {selectedTruck.camion.codigo}</Text>
						</Space>
						<Tag color={getCapacityColor()}>
							<FaBox size={12} style={{ marginRight: 4 }} />
							Capacidad: {selectedTruck.camion.cargaActual}/{selectedTruck.camion.capacidad}
						</Tag>
					</Space>
					{currentPosition && (
						<Text type="secondary">
							Posicion actual: ({currentPosition.lat.toFixed(3)}, {currentPosition.lng.toFixed(3)})
						</Text>
					)}
				</Space>
			}
			style={cardStyle}
		>
			<Collapse defaultActiveKey={['1', '2']}>
				<Panel
					header={
						<Space style={{ width: '100%', justifyContent: 'space-between' }}>
							<Text strong>Lista de pedidos</Text>
							<Tag>Total: {selectedTruck.camion.paquetes.length}</Tag>
						</Space>
					}
					key="1"
				>
					{renderPedidosList()}
				</Panel>

				<Panel
					header={
						<Space style={{ width: '100%', justifyContent: 'space-between' }}>
							<Text strong>Ruta tomada</Text>
							<Tag>Tramos: {selectedTruck.tramos.length}</Tag>
						</Space>
					}
					key="2"
				>
					{renderRouteHistory()}
				</Panel>
			</Collapse>
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