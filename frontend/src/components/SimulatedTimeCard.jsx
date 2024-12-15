import { Card, Statistic } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

const SimulatedTimeCard = ({ simulatedTime, elapsedTime }) => {
  return (
    <Card
      style={{
        width: 240,
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
      title="Tiempo de la Simulación"
      bordered
    >
      <Statistic title="Reloj Simulado" value={simulatedTime || "No iniciado"} />
      <Statistic
        title="Tiempo Transcurrido"
        value={elapsedTime}
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

SimulatedTimeCard.propTypes = {
  simulatedTime: PropTypes.string.isRequired,
  elapsedTime: PropTypes.string.isRequired,
};

export default SimulatedTimeCard;
