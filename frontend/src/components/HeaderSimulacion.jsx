import { DownOutlined } from "@ant-design/icons";
import { Button, ConfigProvider, DatePicker, Dropdown, Menu, Typography } from "antd";
import locale from "antd/locale/es_ES";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import React, { useEffect, useState } from "react";
import "dayjs/locale/es";

dayjs.extend(localeData);
dayjs.locale("es");

const { Title, Text } = Typography;

const HeaderSimulacion = ({ onDateChange, isFetching, handleStart, handleStop, dtpValue, disabledDate, onDropdownChange }) => {
  const [currentTime, setCurrentTime] = useState(dayjs().format("dddd, DD [de] MMMM [del] YYYY - hh:mm:ss"));
  const [dropdownValue, setDropdownValue] = useState("Semanal");

  // Actualiza el tiempo actual cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs().format("dddd, DD [de] MMMM [del] YYYY - hh:mm:ss"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = (e) => {
    setDropdownValue(e.key);
    if (onDropdownChange) onDropdownChange(e.key);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="Semanal">Semanal</Menu.Item>
      <Menu.Item key="Colapso">Colapso</Menu.Item>
    </Menu>
  );

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      borderBottom: "1px solid #ddd",
    }}>

      {/* Contenedor de Título y Reloj */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}>
        <Title level={3}>Simulaciones</Title>
        <Text style={{
          fontSize: "14px",
          color: "#aaa",
        }}>
          {currentTime.charAt(0).toUpperCase() + currentTime.slice(1)} {/* Capitalizar */}
        </Text>
      </div>

      {/* Contenedor de DatePicker y Botón */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Dropdown */}
        <Dropdown overlay={menu} trigger={['click']}>
          <Button size="small" style={{
            height: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
          }}>
            {dropdownValue}
            <DownOutlined />
          </Button>
        </Dropdown>

        <ConfigProvider locale={locale}>
          <DatePicker
            showTime
            defaultPickerValue={dayjs('2024-06-01', 'YYYY-MM-DD')}
            disabled={isFetching}
            onChange={onDateChange}
            disabledDate={disabledDate}
          />
        </ConfigProvider>

        <Button
          type="primary"
          onClick={isFetching ? handleStop : handleStart}
          disabled={!dtpValue && !isFetching}
        >
          {isFetching ? "Parar" : "Iniciar"}
        </Button>
      </div>
    </div>
  );
};

export default HeaderSimulacion;
