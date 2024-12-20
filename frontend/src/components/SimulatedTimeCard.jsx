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
        position: 'absolute',
        top: "10px ",
        left: "10px",
        zIndex: 1000,
        borderRadius: "5px",
        width: 280,
      }}
      bordered
    >
      <b>  Fecha y hora simuladas </b>
      <p style={{ marginBottom: '2px' }}>{simulatedTime || "No iniciado"}</p>
      <b>Tiempo simulado transcurrido </b>
      <p style={{ marginBottom: '2px' }}> {elapsedTime || "No iniciado"}</p>
      <b>Tiempo real transcurrido </b>
      <p >{elapsedRealTime ? formatRealTime(elapsedRealTime) : "No iniciado"} </p>
    </Card >
  );
};


export default SimulatedTimeCard;
