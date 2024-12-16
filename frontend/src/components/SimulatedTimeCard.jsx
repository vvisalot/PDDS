import { Card, Typography } from 'antd';
import PropTypes from 'prop-types';

const SimulatedTimeCard = ({ simulatedTime, elapsedTime, elapsedRealTime }) => {

  // Formatear tiempo real transcurrido en minutos y segundos
  const formatRealTime = (elapsedSeconds) => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = Math.floor(elapsedSeconds % 60);
    return `${minutes}m ${seconds}s`;
  };
  
  
  return (
    <Card
      style={{
        width: 350,
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
      bordered
    >
      <Typography>
        <b>  Fecha y Hora de la simulación: </b>
        {simulatedTime || "No iniciado"}
      </Typography>
      <Typography style={{ marginTop: 16 }}>
        <b>Tiempo simulado transcurrido: </b>
        {elapsedTime || "No iniciado"}
      </Typography>
      <Typography style={{ marginTop: 16 }}>
        <b>Tiempo real transcurrido: </b>
        {elapsedRealTime ? formatRealTime(elapsedRealTime) : "No iniciado"}
      </Typography>
    </Card >
  );
};

SimulatedTimeCard.propTypes = {
  simulatedTime: PropTypes.string.isRequired,
  elapsedTime: PropTypes.string.isRequired,
  elapsedRealTime: PropTypes.number,
};

export default SimulatedTimeCard;
