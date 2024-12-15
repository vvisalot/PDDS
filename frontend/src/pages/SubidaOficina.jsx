import {useState} from 'react'; 
import { Col, Typography, Upload, Button, Table, message } from "antd";
import { FaUpload } from 'react-icons/fa';
import Papa from "papaparse";
const { Title } = Typography;
const { Dragger } = Upload;

const SubidaOficina = () => {
  const [validTableData, setValidTableData] = useState([]); // Datos válidos
  const [invalidTableData, setInvalidTableData] = useState([]); // Datos inválidos
  const [errorMessages, setErrorMessages] = useState([]); // Mensajes de error

  const requiredColumns = ["id", "departamento", "ciudad", "lat", "lng", "region", "ubigeo"];

  const props = {
    name: "file",
    showUploadList: false,
    accept: ".csv",

    beforeUpload: (file) => {
      setErrorMessages([]);
      setValidTableData([]);
      setInvalidTableData([]);

      const isCsv = file.type === "text/csv";
      if (!isCsv) {
        message.error("Solo se puede subir archivos CSV");
        return false;
      }

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const validData = [];
          const invalidData = [];
          const errors = [];

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

            // Validar campos lat y lng como numéricos
            if (isNaN(row.lat) || isNaN(row.lng)) {
              isValid = false;
              rowErrors.push(`Fila ${index + 1}: Los campos "lat" y "lng" deben ser numéricos.`);
            }

            if (isValid) {
              validData.push(row);
            } else {
              invalidData.push({ ...row, error: rowErrors.join("; ") });
              errors.push(...rowErrors);
            }
          });

          setValidTableData(validData);
          setInvalidTableData(invalidData);
          setErrorMessages(errors);

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

      return false; // Prevenir la carga automática del archivo
    },
  };


  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Departamento", dataIndex: "departamento", key: "departamento" },
    { title: "Ciudad", dataIndex: "ciudad", key: "ciudad" },
    { title: "Latitud", dataIndex: "lat", key: "lat" },
    { title: "Longitud", dataIndex: "lng", key: "lng" },
    { title: "Región", dataIndex: "region", key: "region" },
    { title: "Ubigeo", dataIndex: "ubigeo", key: "ubigeo" },
  ];

  // Columnas para la tabla de datos inválidos
  const invalidColumns = [
    ...columns,
    { title: "Error", dataIndex: "error", key: "error" },
  ];


    return (
        <div>
            <Col>
                <Title
                className="font-semibold"
                style={{
                    color: "black",
                    textAlign: "left",
                    marginBottom: "20px",
                }}
                >
                Registro de Oficinas
                </Title>
                <p style={{ textAlign: "left", marginBottom: "20px" }}
                    > Seleccione el archivo CSV con las columnas requeridas: id, 
                      departamento, ciudad, lat, lng, region, ubigeo.
                </p>
            </Col>

            <Dragger
                  {...props}
                  accept=".csv"
                  style={{ width: "95%", margin: "0 auto" }}
                  >
                  <p className="ant-upload-drag-icon">
                      <FaUpload size={80} style={{ height: "30px", width: "30px" }} />
                  </p>
                  <p className="ant-upload-text">
                      Seleccione su archivo o arrastre y suéltelo aquí
                  </p>
                  <p className="ant-upload-hint">
                      CSV,el archivo no puede superar los 50 MB.
                  </p>
                  <Button
                      size="large"
                      style={{
                      display: "flex",
                      alignItems: "center",
                      margin: "20px auto 0",
                      color: "#0884FC",
                      borderColor: "#0884FC",
                      }}
                  >
                      Elegir archivos
                  </Button>
            </Dragger>

            <div style={{ marginTop: "30px" }}>
              <Title level={4}>Datos Válidos</Title>
              <Table dataSource={validTableData} columns={columns} rowKey="id" pagination={false} />

              <Title level={4} style={{ marginTop: "20px" }}>
                Datos Inválidos
              </Title>
              <Table
                dataSource={invalidTableData}
                columns={invalidColumns}
                rowKey="id"
                pagination={false}
              />

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

export default SubidaOficina;