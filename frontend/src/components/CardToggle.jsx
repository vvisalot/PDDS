import { Switch, Typography } from 'antd';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const { Title } = Typography;

const CardToggle = ({ onToggleChange }) => {
    const [isToggled, setIsToggled] = useState(false);

    const handleToggle = (checked) => {
        setIsToggled(checked);
        if (onToggleChange) onToggleChange(checked);
    };

    return (
        <div style={styles.card}>
            <div style={styles.switchContainer}>
                <Switch checked={isToggled} onChange={handleToggle} />
                <span style={styles.text}>Bloqueos</span>
            </div>
        </div>
    );
};


const styles = {
    card: {
        position: 'absolute',
        bottom: "8px",
        right: "20px",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "20px", // Aumentado para más espacio
        border: '1px solid #ccc',
        borderRadius: '12px', // Más redondeada
        maxWidth: '250px', // Más ancha
        textAlign: 'center',
        margin: '20px auto',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Sombra para diseño limpio
    },
    title: {
        fontSize: '16px',
        fontWeight: '650',
        marginBottom: '16px',
        color: '#333',
    },
    switchContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px', // Espacio entre el Switch y el texto
    },
    text: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#555',
    },
};


CardToggle.propTypes = {
    onToggleChange: PropTypes.func,
};

export default CardToggle;