import { FaRoute, FaWarehouse, FaTools } from 'react-icons/fa';

function getItem(label, key, icon, link) {
    return {
      key,
      icon,
      label,
      link,
    };
  }

export const configItems = [
    getItem(
      "Oficinas",
      "1",
      <FaWarehouse size={20} />,
      "/configuracion/subida-oficina",
    ),
    getItem(
      "Tramos",
      "2",
      <FaRoute size={20} />,
      "/configuracion/subida-tramo",
    ),
    getItem(
        "Mantenimientos",
        "3",
        <FaTools size={20} />,
        "/configuracion/subida-mantenimiento",
      ),
];