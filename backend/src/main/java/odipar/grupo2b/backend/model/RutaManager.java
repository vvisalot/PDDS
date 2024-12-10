package odipar.grupo2b.backend.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class RutaManager {
    private static List<Paquete> paquetesAEntregar = new ArrayList<>();
    public static Map<String, Integer> prioridadRegion;

    static {        
        prioridadRegion = new HashMap<>();
        prioridadRegion.put("COSTA", 1);
        prioridadRegion.put("SIERRA", 2);
        prioridadRegion.put("SELVA", 3);
    }

    public static void agregarPaquete(Paquete paquete){
        paquetesAEntregar.add(paquete);
    }

    public static Paquete obtenerPaquete(int index){
        return paquetesAEntregar.get(index);
    }

    public static List<Paquete> obtenerPaquetes(){
        return paquetesAEntregar;
    }

    public static void setPaquetesAEntregar(List<Paquete> paquetes){
        paquetesAEntregar = paquetes;
    }

    public static int cantidadPaquetes(){
        return paquetesAEntregar.size();
    }

    public static void limpiarPaquetes(){
        paquetesAEntregar = new ArrayList<>();
    }

    public static void agregarPuntoInicial(Paquete paquete){
        paquetesAEntregar.add(0,paquete);
    }
}
