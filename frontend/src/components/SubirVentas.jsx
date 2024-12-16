import React, { useState } from "react";
import { Button, Table, message, Typography } from "antd";
import Papa from "papaparse";

const { Title } = Typography;

const SubirVentas = ({ requiredColumns = ["fechaHora", "destino", "cantidad", "idCliente"], onValidData, onInvalidData }) => {
  const [validTableData, setValidTableData] = useState([]);
  const [invalidTableData, setInvalidTableData] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      message.error("Solo se puede subir archivos CSV.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const validData = [];
        const invalidData = [];
        const errors = [];

        console.log("Datos parseados del archivo CSV:", results.data);

        // Verificar si las columnas requeridas están presentes
        const fileColumns = results.meta.fields || [];
        const missingColumns = requiredColumns.filter((col) => !fileColumns.includes(col));
        if (missingColumns.length > 0) {
          message.error(`Faltan columnas requeridas: ${missingColumns.join(", ")}`);
          return;
        }

        results.data.forEach((row, index) => {
          let isValid = true;
          const rowErrors = [];

          // Validar que cada campo requerido no esté vacío
          requiredColumns.forEach((field) => {
            if (!row[field] || row[field].trim() === "") {
              isValid = false;
              rowErrors.push(`Fila ${index + 1}: El campo "${field}" está vacío.`);
            }
          });

          // Validar `fechaHora` como una fecha válida
          if (!Date.parse(row.fechaHora)) {
            isValid = false;
            rowErrors.push(`Fila ${index + 1}: El campo "fechaHora" debe ser una fecha válida en formato ISO.`);
          }

          // Validar `destino` como un código numérico de 6 caracteres
          if (!/^\d{6}$/.test(row.destino)) {
            isValid = false;
            rowErrors.push(`Fila ${index + 1}: El campo "destino" debe ser un código numérico de 6 dígitos.`);
          }

          // Validar `cantidad` como un entero positivo
          if (!Number.isInteger(Number(row.cantidad)) || Number(row.cantidad) <= 0) {
            isValid = false;
            rowErrors.push(`Fila ${index + 1}: El campo "cantidad" debe ser un número entero positivo.`);
          }

          // Validar `idCliente` como un número entero de al menos 6 caracteres
          if (!/^\d{6,}$/.test(row.idCliente)) {
            isValid = false;
            rowErrors.push(`Fila ${index + 1}: El campo "idCliente" debe ser un número entero de al menos 6 dígitos.`);
          }

          if (isValid) {
            validData.push(row);
          } else {
            invalidData.push({ ...row, error: rowErrors.join("; ") });
            errors.push(...rowErrors);
          }
        });

        console.log("Datos válidos:", validData);
        console.log("Datos inválidos:", invalidData);
        console.log("Errores encontrados:", errors);

        setValidTableData(validData);
        setInvalidTableData(invalidData);
        setErrorMessages(errors);

        if (onValidData) onValidData(validData);
        if (onInvalidData) onInvalidData(invalidData);

        if (errors.length > 0) {
          message.warning("Se encontraron errores en el archivo.");
        } else {
          message.success("Archivo cargado y validado correctamente.");
        }
      },
      error: function (error) {
        console.error("Error parsing CSV: ", error);
        message.error("Error al procesar el archivo CSV.");
      },
    });
  };

  const columns = [
    { title: "Fecha y Hora", dataIndex: "fechaHora", key: "fechaHora" },
    { title: "Destino", dataIndex: "destino", key: "destino" },
    { title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
    { title: "ID Cliente", dataIndex: "idCliente", key: "idCliente" },
  ];

  const invalidColumns = [
    ...columns,
    { title: "Error", dataIndex: "error", key: "error" },
  ];

  return (
    <div>
      <Button type="primary" style={{ marginBottom: "10px" }}>
        <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
          Subir Archivo
        </label>
      </Button>
      <input
        id="file-upload"
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      <div style={{ marginTop: "30px" }}>
        <Title level={4}>Datos Válidos</Title>
        <Table dataSource={validTableData} columns={columns} rowKey="fechaHora" pagination={false} />

        {errorMessages.length > 0 && (
          <div style={{ marginTop: "20px", color: "red" }}>
            <Title level={5}>Errores Encontrados:</Title>
            <ul>
              {errorMessages.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubirVentas;