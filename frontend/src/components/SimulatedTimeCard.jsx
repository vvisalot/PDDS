import { Card, Typography } from 'antd';
import PropTypes from 'prop-types';

const SimulatedTimeCard = ({ simulatedTime, elapsedTime }) => {
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
        <b>  Tiempo simulado: </b>
        {simulatedTime || "No iniciado"}
      </Typography>
      <Typography style={{ marginTop: 16 }}>
        <b>Tiempo transcurrido: </b>
        {elapsedTime || "No iniciado"}
      </Typography>
    </Card >
  );
};

SimulatedTimeCard.propTypes = {
  simulatedTime: PropTypes.string.isRequired,
  elapsedTime: PropTypes.string.isRequired,
};

export default SimulatedTimeCard;
