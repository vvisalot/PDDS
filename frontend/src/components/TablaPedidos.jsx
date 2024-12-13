import { Table } from "antd";

const columnasPedidos = [
    { title: "Fecha", dataIndex: "fecha", key: "fecha" },
    { title: "Hora", dataIndex: "hora", key: "hora" },
    { title: "ID Cliente", dataIndex: "idCliente", key: "idCliente" },
    { title: "Cantidad Total", dataIndex: "cantidadTotal", key: "cantidadTotal" }
];

const TablaPedidos = ({ data }) => {
    let keyCounter = 0;
    const formattedData = data.flatMap((item) =>
        item.camion.paquetes.map((pedido) => {
            const fechaHora = new Date(pedido.fechaHoraPedido);
            const fecha = fechaHora.toLocaleDateString(); // Obtiene la fecha en formato local (dd/mm/aaaa o mm/dd/aaaa)
            const hora = fechaHora.toLocaleTimeString(); // Obtiene la hora en formato local (hh:mm:ss)

            return {
                key: keyCounter++,
                codigo: pedido.codigo,
                fecha: fecha,
                hora: hora,
                idCliente: pedido.idCliente,
                cantidadTotal: pedido.cantidadTotal
            };
        })
    );

    return (
        <Table
            dataSource={formattedData}
            pagination={{ pageSize: 4 }}
            columns={columnasPedidos}
        />
    )
};

export default TablaPedidos;
