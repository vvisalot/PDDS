import { Table } from "antd";

const columnasFlota = [
    { title: "ID", dataIndex: "codigo", key: "codigo" },
    { title: "Tipo", dataIndex: "tipo", key: "tipo" },
    { title: "Capacidad", dataIndex: "capacidad", key: "capacidad" },
    { title: "Carga Actual", dataIndex: "cargaActual", key: "cargaActual" }
];

const TablaFlota = ({ data }) => {
    const formattedData = data.map((item) => ({
        key: item.camion.codigo,
        codigo: item.camion.codigo,
        tipo: item.camion.tipo,
        capacidad: item.camion.capacidad,
        cargaActual: item.camion.cargaActual
    }));

    return (
        <Table
            dataSource={formattedData}
            columns={columnasFlota}
            pagination={{ pageSize: 7 }}
        />)
};

export default TablaFlota;
