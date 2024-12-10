package odipar.grupo2b.backend.service;

import java.util.List;

import odipar.grupo2b.backend.algorithm.GrafoTramos;
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

    public SimulacionDataService(List<Camion> camiones, RelojSimulado reloj, List<Venta> ventas,
            List<Oficina> almacenesPrincipales, GrafoTramos grafoTramos) {
        this.camiones = camiones;
        this.reloj = reloj;
        this.ventas = ventas;
        this.almacenesPrincipales = almacenesPrincipales;
        this.grafoTramos = grafoTramos;
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
    
    public void reset(List<Camion> camiones, RelojSimulado reloj, List<Venta> ventas,
            List<Oficina> almacenesPrincipales, GrafoTramos grafoTramos) {
        this.camiones = camiones;
        this.reloj = reloj;
        this.ventas = ventas;
        this.almacenesPrincipales = almacenesPrincipales;
        this.grafoTramos = grafoTramos;
    }

    public void reset(List<Camion> camiones, RelojSimulado reloj,
            List<Oficina> almacenesPrincipales, GrafoTramos grafoTramos) {
        this.camiones = camiones;
        this.reloj = reloj;
        this.almacenesPrincipales = almacenesPrincipales;
        this.grafoTramos = grafoTramos;
    }
}
