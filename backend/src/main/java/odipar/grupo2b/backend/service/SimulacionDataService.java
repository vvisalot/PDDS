package odipar.grupo2b.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import odipar.grupo2b.backend.algorithm.GrafoTramos;
import odipar.grupo2b.backend.dto.BloqueoResponse;
import odipar.grupo2b.backend.model.Camion;
import odipar.grupo2b.backend.model.Oficina;
import odipar.grupo2b.backend.model.Venta;
import odipar.grupo2b.backend.utils.RelojSimulado;

public class SimulacionDataService {
    private List<Camion> camiones;
    private RelojSimulado reloj;
    private List<Venta> ventas;
    private List<Oficina> almacenesPrincipales;
    private GrafoTramos grafoTramos;
    private Map<LocalDateTime, List<BloqueoResponse>> mapaBloqueos;
    private Map<String, Oficina> mapaOficinas;
    //Segunda caché
    // private Map<String, Oficina> mapaOficinasExtra;
    
    public SimulacionDataService(List<Camion> camiones, RelojSimulado reloj, List<Venta> ventas,
            List<Oficina> almacenesPrincipales, GrafoTramos grafoTramos, Map<LocalDateTime, List<BloqueoResponse>> mapaBloqueos, Map<String, Oficina> mapaOficinas) {
        this.camiones = camiones;
        this.reloj = reloj;
        this.ventas = ventas;
        this.almacenesPrincipales = almacenesPrincipales;
        this.grafoTramos = grafoTramos;
        this.mapaBloqueos = mapaBloqueos;
        this.mapaOficinas = mapaOficinas;
    }

    public List<Camion> getCamiones() {
        return camiones;
    }

    public RelojSimulado getReloj() {
        return reloj;
    }

    public List<Venta> getVentas() {
        return ventas;
    }

    public List<Oficina> getAlmacenesPrincipales() {
        return almacenesPrincipales;
    }

    public GrafoTramos getGrafoTramos() {
        return grafoTramos;
    }
    
    public Map<LocalDateTime, List<BloqueoResponse>> getMapaBloqueos() {
        return mapaBloqueos;
    }

    public void setMapaBloqueos(Map<LocalDateTime, List<BloqueoResponse>> mapaBloqueos) {
        this.mapaBloqueos = mapaBloqueos;
    }

    public Map<String, Oficina> getMapaOficinas() {
        return mapaOficinas;
    }

    public void setMapaOficinas(Map<String, Oficina> mapaOficinas) {
        this.mapaOficinas = mapaOficinas;
    }

    public void reset(List<Camion> camiones, RelojSimulado reloj, List<Venta> ventas,
            List<Oficina> almacenesPrincipales, GrafoTramos grafoTramos, Map<LocalDateTime, List<BloqueoResponse>> mapaBloqueos, Map<String, Oficina> mapaOficinas) {
        this.camiones = camiones;
        this.reloj = reloj;
        this.ventas = ventas;
        this.almacenesPrincipales = almacenesPrincipales;
        this.grafoTramos = grafoTramos;
        this.mapaBloqueos = mapaBloqueos;
        this.mapaOficinas = mapaOficinas;
    }

    public void reset(List<Camion> camiones, RelojSimulado reloj,
            List<Oficina> almacenesPrincipales, GrafoTramos grafoTramos, Map<LocalDateTime, List<BloqueoResponse>> mapaBloqueos, Map<String, Oficina> mapaOficinas) {
        this.camiones = camiones;
        this.reloj = reloj;
        this.almacenesPrincipales = almacenesPrincipales;
        this.grafoTramos = grafoTramos;
        this.mapaBloqueos = mapaBloqueos;
        this.mapaOficinas = mapaOficinas;
    }
}
