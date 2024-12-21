import { Button, Modal, Table, Typography, message } from "antd";
import React, { useState } from "react";
import { registrarVentaArchivo } from "../service/planificador";

const { Title } = Typography;

const SubirVentas = ({ isVisible, onCancel, onSuccess, requiredFields = ["fechaHora", "destino", "cantidad", "idCliente"] }) => {
  const [previewData, setPreviewData] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      message.error("Solo se puede subir archivos JSON.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        const validData = [];
        const errors = [];

        jsonData.forEach((row, index) => {
          let isValid = true;
          const rowErrors = [];

          requiredFields.forEach((field) => {
            if (!row[field] || row[field].toString().trim() === "") {
              isValid = false;
              rowErrors.push(`Fila ${index + 1}: El campo "${field}" está vacío o ausente.`);
            }
          });

          if (isValid) validData.push(row);
          else errors.push(...rowErrors);
        });

        setPreviewData(validData);
        setErrorMessages(errors);

        if (validData.length === 0) {
          message.warning("El archivo no contiene datos válidos.");
        }
      } catch (error) {
        console.error("Error al procesar el archivo JSON:", error);
        message.error("El archivo JSON tiene un formato inválido.");
      }
    };

    reader.readAsText(file);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await registrarVentaArchivo(previewData);
      message.success("Datos enviados correctamente.");
      setPreviewData([]);
      onSuccess();
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      message.error("Error al enviar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPreviewData([]); // Limpiar los datos al cancelar
    setErrorMessages([]); // Limpiar los errores
    onCancel(); // Llamar a la función onCancel proporcionada por las props
  };

  const columns = [
    { title: "Fecha y Hora", dataIndex: "fechaHora", key: "fechaHora" },
    { title: "Destino", dataIndex: "destino", key: "destino" },
    { title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
    { title: "ID Cliente", dataIndex: "idCliente", key: "idCliente" },
  ];

  return (
    <Modal
      title="Subir archivo de Ventas"
      open={isVisible}
      onOk={handleConfirm}
      confirmLoading={loading}
      onCancel={handleCancel}
      okText="Confirmar y Enviar"
      cancelText="Cancelar"
      width={800}
    >
      <Button type="primary" style={{ marginBottom: 16 }}>
        <label htmlFor="file-upload" style={{ cursor: "pointer", color: 'white' }}>
          Seleccionar archivo JSON
        </label>
      </Button>
      <input
        id="file-upload"
        type="file"
        accept="application/json"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      {previewData.length > 0 && (
        <>
          <Title level={5} style={{ marginTop: 16 }}>Vista previa de datos:</Title>
          <Table
            dataSource={previewData}
            columns={columns}
            rowKey="fechaHora"
            pagination={{ pageSize: 4 }}
          />
        </>
      )}

      {errorMessages.length > 0 && (
        <div style={{ marginTop: 20, color: "red" }}>
          <Title level={5}>Errores Encontrados:</Title>
          <ul>
            {errorMessages.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
};

export default SubirVentas;