import { Card, List, Space, Tag, Timeline, Typography } from 'antd';
import Item from 'antd/es/list/Item';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { FaBox, FaTruck } from 'react-icons/fa';

const { Text } = Typography;

const TruckMapCard = ({ selectedTruck, simulatedTime, truckPositions, onClose }) => {
	if (!selectedTruck) return null;

	const currentPosition = truckPositions[selectedTruck.camion.codigo];
	const currentTimeObj = dayjs(simulatedTime);

	const getCapacityColor = () => {
		const capacidad = selectedTruck.camion.capacidad;
		const cargaActual = selectedTruck.camion.cargaActual;
		const percentage = (cargaActual / capacidad) * 100;

		if (percentage <= 25) return "success";
		if (percentage <= 50) return "lime";
		if (percentage <= 75) return "warning";
		if (percentage <= 90) return "orange";
		return "error";
	};

	const getCapacityIconColor = () => {
		const capacidad = selectedTruck.camion.capacidad;
		const cargaActual = selectedTruck.camion.cargaActual;
		const percentage = (cargaActual / capacidad) * 100;

		if (percentage <= 25) return "#22c55e";
		if (percentage <= 50) return "#84cc16";
		if (percentage <= 75) return "#eab308";
		if (percentage <= 90) return "#f97316";
		return "#ef4444";
	};

	const formatLocation = (location) => {
		return location.split(', ').map(part =>
			part.split(' ').map(word =>
				word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
			).join(' ')
		).join(', ');
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
						padding: '12px 0',
						borderBottom: '1px solid #f0f0f0'
					}}>
						<Space align='center' style={{ width: '100%', justifyContent: 'space-between' }}>
							<div>
								<FaBox style={{ marginRight: '8px' }} />
								<Text>{paquete.cantidadTotal} unidades</Text>
							</div>
							<Tag color={status === 'entregado' ? 'success' : 'processing'}>
								{status}
							</Tag>
						</Space>

						<Text type="secondary" style={{ marginTop: '4px' }}>
							Registro: {dayjs(paquete.fechaHoraPedido).format('DD/MM/YYYY, hh:mm A')}
						</Text>

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

			if (currentTimeObj.isBefore(startTime)) return 'wait';
			if (currentTimeObj.isBefore(endTime)) return 'process';
			return 'finish';
		};

		return (
			<Timeline>
				{selectedTruck.tramos.map((tramo, index) => {
					const status = getTramoStatus(tramo);
					return (
						<Item
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
						</Item>
					);
				})}
			</Timeline>
		);
	};

	const cardContainerStyle = {
		position: "absolute",
		top: "20px",
		right: "20px",
		zIndex: 1000,
		width: 350,
		display: 'flex',
		flexDirection: 'column',
		gap: '8px'
	};

	const baseCardStyle = {
		width: '100%',
		boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
	};

	return (
		<div style={cardContainerStyle}>
			{/* Card Principal - Info del Camión */}
			<Card style={baseCardStyle}>
				<Space direction="vertical" style={{ width: '100%' }}>
					<Space style={{ width: '100%', justifyContent: 'space-between' }}>
						<Space>
							<FaTruck size={20} color={getCapacityIconColor()} />
							<Text strong>Camión {selectedTruck.camion.codigo}</Text>
						</Space>
						<Tag color={getCapacityColor()}>
							<FaBox size={12} style={{ marginRight: 4 }} />
							{selectedTruck.camion.cargaActual}/{selectedTruck.camion.capacidad}
						</Tag>
					</Space>
					{currentPosition && (
						<Text type="secondary">
							Posición actual: ({currentPosition.lat.toFixed(3)}, {currentPosition.lng.toFixed(3)})
						</Text>
					)}
				</Space>
			</Card>

			{/* Card de Pedidos */}
			<Card
				style={{
					...baseCardStyle,
					maxHeight: 300,
					overflow: 'hidden'
				}}
				title={
					<Space style={{ width: '100%', justifyContent: 'space-between' }}>
						<Text strong>Lista de pedidos</Text>
						<Tag>Total: {selectedTruck.camion.paquetes.length}</Tag>
					</Space>
				}
				bodyStyle={{
					maxHeight: 240,
					overflowY: 'auto',
					padding: '0 24px'
				}}
			>
				{renderPedidosList()}
			</Card>

			{/* Card de Ruta */}
			<Card
				style={{
					...baseCardStyle,
					maxHeight: 400,
					overflow: 'hidden'
				}}
				title={
					<Space style={{ width: '100%', justifyContent: 'space-between' }}>
						<Text strong>Ruta tomada</Text>
						<Tag>Tramos: {selectedTruck.tramos.length}</Tag>
					</Space>
				}
				bodyStyle={{
					maxHeight: 340,
					overflowY: 'auto',
					padding: '24px'
				}}
			>
				{renderRouteHistory()}
			</Card>
		</div>
	);
};

export default TruckMapCard;