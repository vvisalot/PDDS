import { Layout, Menu } from "antd";
import { Link, Routes, Route } from "react-router-dom";
import { configItems } from "../utils/menuItemConf";
import SubidaOficina from "./SubidaOficina.jsx";
import SubidaTramo from "./SubidaTramo.jsx";

const { Sider, Content } = Layout;

const Configuracion = () => {
    return (
      <Layout style={{ height: "100vh" }}>
        {/* Menú lateral */}
        <Sider
          theme="dark"
          style={{
            backgroundColor: "#1f2937", // Gris oscuro
          }}
        >
          <Menu
            theme="dark"
            mode="inline"
            items={configItem.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: <Link to={item.link}>{item.label}</Link>,
            }))}
          />
        </Sider>
  
        {/* Contenido dinámico */}
        <Content style={{ padding: "16px", backgroundColor: "#f5f5f5" }}>
          <Routes>
            <Route path="subida-oficina" element={<SubidaOficina />} />
            <Route path="subida-tramo" element={<SubidaTramo />} />
          </Routes>
        </Content>
      </Layout>
    );
};

export default Configuracion;