package odipar.grupo2b.backend.model;

//OPTIMIZAR ESTA WBD, SON DATOS FIJOS.

import java.util.HashMap;
import java.util.Map;

public class MapaVelocidad {
    public static final Map<String, Integer> velocidades;
    private static MapaVelocidad instance;
    static {
        velocidades = new HashMap<>();
        // Guardar las velocidades en el formato "Region1-Region2"
        velocidades.put("COSTA-COSTA", 70);
        velocidades.put("COSTA-SIERRA", 50);
        velocidades.put("SIERRA-SIERRA", 60);
        velocidades.put("SIERRA-SELVA", 55);
        velocidades.put("SELVA-SELVA", 65);
        velocidades.put("COSTA-SELVA", 53); //Provisional
    }

    public static MapaVelocidad getInstance() {
        if (instance == null) {
            instance = new MapaVelocidad();
        }
        return instance;
    }


    // Función para obtener la velocidad promedio entre dos regiones
    public int obtenerVelocidad(String region1, String region2) {
        String clave = region1 + "-" + region2;
        // Buscar la velocidad correspondiente
        if (velocidades.containsKey(clave)) {
            return velocidades.get(clave);
        }
        // Si no se encuentra la clave, buscar en el sentido contrario
        clave = region2 + "-" + region1;
        if (velocidades.containsKey(clave)) {
            return velocidades.get(clave);
        }
        // Si no se encuentra la velocidad entre esas dos regiones, retornar un valor predeterminado
        return -1; // o lanzar una excepción si es necesario
    }
}