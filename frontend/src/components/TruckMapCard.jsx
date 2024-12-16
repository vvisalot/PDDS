import { CloseOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, List, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { FaBox, FaTruck } from 'react-icons/fa';

const { Title, Text } = Typography;
const { Panel } = Collapse;

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
		maxHeight: 'calc(70vh - 55px)',
		overflowY: 'auto',
	};

	const currentPosition = truckPositions[selectedTruck.camion.codigo];
	const currentTimeObj = dayjs(simulatedTime);

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
							Destino: {tramoEntrega?.nombreDestino || 'Por definir'}
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

	const renderCurrentRoute = () => (
		currentTramo && (
			<Space direction="vertical" style={{ width: '100%' }}>
				<Text>
					{currentTramo.status === 'waiting' ? 'En espera' : 'En camino'}
				</Text>
				<Space direction="vertical">
					<Text type="secondary">
						Origen: {currentTramo.tramo.nombreOrigen} ({dayjs(currentTramo.tramo.tiempoSalida).format('HH:mm')})
					</Text>
					<Text type="secondary">
						Destino: {currentTramo.tramo.nombreDestino} ({dayjs(currentTramo.tramo.tiempoLlegada).format('HH:mm')})
					</Text>
				</Space>
			</Space>
		)
	);

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
								[{currentPosition.lat.toFixed(2)}, {currentPosition.lng.toFixed(2)}]
							</Text>
						</div>
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

				<Panel header={<Text strong>Ruta tomada</Text>} key="2">
					{renderCurrentRoute()}
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