import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, message } from "antd";
import dayjs from "dayjs";
import Papa from 'papaparse';
import { useEffect, useState } from "react";
import { registrarVentaUnica } from "../service/planificador";

const { Option } = Select;

const ModalVenta = ({ isVisible, onCancel, onSuccess }) => {
    const [ubicaciones, setUbicaciones] = useState([]);

    const oficinasPrincipales = [
        '130101', // TRUJILLO
        '150101', // LIMA
        '040101'  // AREQUIPA
    ];


    useEffect(() => {
        const cargarUbicaciones = async () => {
            try {
                const response = await fetch('/oficinas.csv'); // El archivo está en public
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const ubicacionesFiltradas = results.data
                            .filter(ubicacion => !oficinasPrincipales.includes(ubicacion.id))
                            .sort((a, b) => {
                                if (a.departamento === b.departamento) {
                                    return a.ciudad.localeCompare(b.ciudad);
                                }
                                return a.departamento.localeCompare(b.departamento);
                            });
                        setUbicaciones(ubicacionesFiltradas);
                    },
                });
            } catch (error) {
                console.error("Error al cargar ubicaciones:", error);
                message.error("Error al cargar las ubicaciones disponibles");
            }
        };
        cargarUbicaciones();
    }, []);


    const handleAddSale = async (values) => {
        try {
            const ventaData = {
                fechaHora: dayjs(values.fechaHora).format('YYYY-MM-DDTHH:mm:ss'),
                destino: values.destino.toString(),
                cantidad: values.cantidad,
                idCliente: values.idCliente.toString()
            };

            await registrarVentaUnica(ventaData);
            message.success("Venta registrada exitosamente");
            onSuccess(); // Para actualizar la tabla de ventas
            onCancel(); // Para cerrar el modal

        } catch (error) {
            console.error("Error al registrar venta:", error);
            message.error("No se pudo registrar la venta");
        }
    };

    return (
        <Modal
            title="Registrar Nueva Venta"
            open={isVisible}
            onCancel={onCancel}
            footer={null}
        >
            <Form
                name="addSaleForm"
                onFinish={handleAddSale}
                layout="vertical"
            >
                <Form.Item
                    name="fechaHora"
                    label="Fecha y Hora"
                    rules={[{ required: true, message: 'Por favor seleccione una fecha y hora' }]}
                >
                    <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        disabledDate={(current) => {
                            const startDate = dayjs("2024-06-01");
                            const endDate = dayjs("2026-11-30");
                            return current && (current.isBefore(startDate, "day") || current.isAfter(endDate, "day"));
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="destino"
                    label="Destino"
                    rules={[{ required: true, message: 'Por favor seleccione un destino' }]}
                >
                    <Select
                        showSearch
                        placeholder="Seleccione un destino"
                        style={{ width: '100%' }}
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                            // Permitir búsqueda en cualquier parte del texto
                            return option?.searchValue?.toLowerCase().includes(input.toLowerCase());
                        }}
                    >
                        {ubicaciones.map(ubi => (
                            <Option
                                key={ubi.id}
                                value={ubi.id}
                                searchValue={`${ubi.ciudad} ${ubi.departamento} ${ubi.id}`}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{ubi.ciudad}, {ubi.departamento}</span>
                                    <span style={{ color: '#888' }}>{ubi.id}</span>

                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="cantidad"
                    label="Cantidad"
                    rules={[
                        { required: true, message: 'Por favor ingrese la cantidad' },
                        { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0' }
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Cantidad de paquetes"
                        min={1}
                    />
                </Form.Item>
                <Form.Item
                    name="idCliente"
                    label="ID Cliente"
                    rules={[
                        { required: true, message: 'Por favor ingrese el ID del cliente' },
                        {
                            validator: (_, value) => {
                                if (!value) {
                                    return Promise.reject('El ID del cliente es requerido');
                                }
                                if (!/^\d{6}$/.test(value)) {
                                    return Promise.reject('El ID del cliente debe tener exactamente 6 dígitos');
                                }
                                if (Number.parseInt(value) === 0) {
                                    return Promise.reject('El ID del cliente no puede ser cero');
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        style={{ width: '100%' }}
                        placeholder="ID del cliente"
                        maxLength={6}
                        onKeyPress={(e) => {
                            const charCode = e.which ? e.which : e.keyCode;
                            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                e.preventDefault();
                            }
                        }}
                    />
                </Form.Item>
                <Form.Item alignItems="center">
                    <Button type="default" onClick={onCancel} style={{ marginLeft: '90px' }}>
                        Cancelar venta
                    </Button>
                    <Button type="primary" htmlType="submit" style={{ marginLeft: '40px' }}>
                        Registrar Venta
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalVenta;