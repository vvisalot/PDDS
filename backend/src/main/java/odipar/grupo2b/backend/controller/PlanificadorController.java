package odipar.grupo2b.backend.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import odipar.grupo2b.backend.algorithm.GrafoTramos;
import odipar.grupo2b.backend.dto.Paquete;
import odipar.grupo2b.backend.dto.Solucion;
import odipar.grupo2b.backend.model.Bloqueo;
import odipar.grupo2b.backend.model.Camion;
import odipar.grupo2b.backend.model.Oficina;
import odipar.grupo2b.backend.model.Tramo;
import odipar.grupo2b.backend.model.Venta;
import odipar.grupo2b.backend.service.AlgoritmoService;
import odipar.grupo2b.backend.service.SimulacionDataService;
import odipar.grupo2b.backend.service.VentaService;
import odipar.grupo2b.backend.utils.LeerDatos;
import odipar.grupo2b.backend.utils.RelojSimulado;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/planificador")
public class PlanificadorController {
    private final SimulacionDataService simulacionDataService;
	private final AlgoritmoService algoritmoService;
    private final VentaService ventaService;

	public PlanificadorController(SimulacionDataService simulacionDataService, AlgoritmoService algoritmoService, VentaService ventaService) {
		this.simulacionDataService = simulacionDataService;
        this.algoritmoService = algoritmoService;
        this.ventaService = ventaService;
	}

    @GetMapping
    public ResponseEntity<List<Solucion>> planificar(@RequestParam("fechaHora") 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHora){
        var camiones = simulacionDataService.getCamiones();
        var ventas = ventaService.listar();
        var almacenesPrincipales = simulacionDataService.getAlmacenesPrincipales();
        var grafoTramos = simulacionDataService.getGrafoTramos();
        var soluciones = algoritmoService.simular(camiones, ventas, almacenesPrincipales, grafoTramos, fechaHora);
		for (Solucion solucion : soluciones) {
            for (Paquete paquete : solucion.camion().paquetes()) {
                ventaService.actualizarCantidades(paquete.cantidadTotal() - paquete.cantidadEntregada(), paquete.codigo());
            }
        }
        return new ResponseEntity<>(soluciones,HttpStatus.OK);
	}

    @GetMapping("/reset")
    public String resetSimulacionDataService() {
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
        var datosTramos = LeerDatos.leerTramosDesdeArchivo(filePathTramos, mapaOficinas, mapaBloqueos);
        var listaTramos = datosTramos.first();
        var mapaTramos = datosTramos.second();

        // Agregar los tramos al grafo
        for (Tramo tramo : listaTramos) {
            grafoTramos.agregarArista(tramo, mapaTramos.get(tramo.getDestino().getCodigo()));
        }

        String archivoMantenimientos = "mantenimientos.txt";
        var mapaMantenimientos = new HashMap<Camion, List<LocalDateTime>>();
        LeerDatos.leerMantenimientos(archivoMantenimientos, mapaMantenimientos);
        //Inicialización de camiones
        List<Camion> camiones = Camion.inicializarCamiones(almacenesPrincipales.get(2), almacenesPrincipales.get(0), almacenesPrincipales.get(1), mapaMantenimientos);

        var reloj = RelojSimulado.getInstance();
        simulacionDataService.reset(camiones, reloj, almacenesPrincipales, grafoTramos);
        return "SimulacionDataService has been reset!";
    }
}
