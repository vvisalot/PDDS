import React from 'react';
import { Col, Typography, Upload, Button } from "antd";
import { FaUpload } from 'react-icons/fa';
const { Title } = Typography;
const { Dragger } = Upload;

const SubidaMantenimiento = () => {
    const props = {
        name: "file",
        showUploadList: false,
    
        beforeUpload: (file) => {
          setErrorMessages([]); // Clear error messages
          setIsSaveButtonDisabled(false);
    
          const isCsv = file.type === "text/csv";
          if (!isCsv) {
            message.error("Solo se puede subir archivos CSV");
          } else {
            setFileName(file.name); // Guarda el nombre del archivo
            // debugger
    
        Papa.parse(file, {
          header: true,
          encoding: "unicode-1-1-utf-8",
          complete: function (results) {
            const filteredData = results.data.filter(row => {
              return !Object.values(row).every(x => (x === null || x === ''));
            });

            const errorTypes = new Set();
            const validationErrors = [];
            const validData = [];//para los datos que estan correctos
           
            console.log("INFO VALIDA",validData);
            console.log("USUARIOS EN PRUEBA",results);
            filteredData.forEach(usuario => {
              let isValido = true;
              // Validar campos requeridos, si alcanza tiempo
              
              if (isValido) {
                console.log("is valido 3",isValido);
                console.log("Usuario VALIDADO",usuario);
                validData.push(usuario); // Agregar fila válida a validData
              }
            });
            
              
            console.log("data valida",validData);
            setTableData(filteredData);
            setValidTableData(validData); // Guardar datos válidos en el estado
            setErrorMessages(validationErrors);
            setIsModalVisible(true);
            setIsSaveButtonDisabled(validationErrors.length > 0);
          },
          error: function (error) {
            console.error("Error parsing CSV: ", error);
          }
        });
        
          // Evita que se suba el archivo
          return false;
        }
      }
    };

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
                    > Seleccione el archivo en modo csv que desea subir.
                </p>
            </Col>

            <div>
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
            </div>
        </div>
    );
};

export default SubidaMantenimiento;