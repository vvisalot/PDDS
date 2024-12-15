package odipar.grupo2b.backend.config;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import odipar.grupo2b.backend.algorithm.GrafoTramos;
import odipar.grupo2b.backend.model.Bloqueo;
import odipar.grupo2b.backend.model.Camion;
import odipar.grupo2b.backend.model.Oficina;
import odipar.grupo2b.backend.model.Tramo;
import odipar.grupo2b.backend.model.Venta;
import odipar.grupo2b.backend.service.SimulacionDataService;
import odipar.grupo2b.backend.utils.LeerDatos;
import odipar.grupo2b.backend.utils.RelojSimulado;

@Configuration
public class AppConfig {

    @Bean
    public SimulacionDataService inicializarDatos(){
		String archivoOficinas = "oficinas.txt";
        Map<String, Oficina> mapaOficinas = LeerDatos.leerOficinasDesdeArchivo(archivoOficinas);

        // Filtrar almacenes principales
        List<Oficina> almacenesPrincipales = mapaOficinas.values().stream()
                .filter(oficina -> oficina.getCodigo().equals("150101")  // Lima
                        || oficina.getCodigo().equals("130101")  // Trujillo
                        || oficina.getCodigo().equals("040101")) // Arequipa
                .toList();

        //Leer bloqueos
        var mapaBloqueos = new HashMap<Tramo, List<Bloqueo>>();
        for (int i = 1; i <= 12; i++) {
            String filePathBloqueos = String.format("bloqueos/bloqueo%02d.txt", i);
            LeerDatos.leerBloqueos(filePathBloqueos, mapaBloqueos);
        }

        GrafoTramos grafoTramos = GrafoTramos.getInstance();
        String filePathTramos = "tramos.txt";  // Cambia esta ruta por la correcta
        var mapaBloqueosPorTiempo = new HashMap<LocalDateTime, List<odipar.grupo2b.backend.dto.Bloqueo>>();
        var datosTramos = LeerDatos.leerTramosDesdeArchivo(filePathTramos, mapaOficinas, mapaBloqueos, mapaBloqueosPorTiempo);
        var listaTramos = datosTramos.first();
        var mapaTramos = datosTramos.second();

        // Agregar los tramos al grafo
        for (Tramo tramo : listaTramos) {
            grafoTramos.agregarArista(tramo, mapaTramos.get(tramo.getDestino().getCodigo()));
        }

        //Lectura de ventas
        var archivosVenta = new String[]{
            "ventas.historico.proyectado/c.1inf54.ventas202406.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202407.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202408.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202409.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202410.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202411.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202412.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202501.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202502.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202503.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202504.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202505.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202506.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202507.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202508.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202509.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202510.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202511.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202512.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202601.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202602.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202603.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202604.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202605.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202606.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202607.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202608.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202609.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202610.txt",
            "ventas.historico.proyectado/c.1inf54.ventas202611.txt"
        };
        var ventas = new ArrayList<Venta>();
        for(String archivoVentas : archivosVenta){
            List<Venta> ventasAux = LeerDatos.leerVentasDesdeArchivo(archivoVentas, mapaOficinas);
            ventas.addAll(ventasAux);
        }

        String archivoMantenimientos = "mantenimientos.txt";
        var mapaMantenimientos = new HashMap<Camion, List<LocalDateTime>>();
        LeerDatos.leerMantenimientos(archivoMantenimientos, mapaMantenimientos);
        //Inicialización de camiones
        List<Camion> camiones = Camion.inicializarCamiones(almacenesPrincipales.get(2), almacenesPrincipales.get(0), almacenesPrincipales.get(1), mapaMantenimientos);

        var reloj = RelojSimulado.getInstance();
        return new SimulacionDataService(camiones, reloj, ventas, almacenesPrincipales, grafoTramos, mapaBloqueosPorTiempo);
    }
}
