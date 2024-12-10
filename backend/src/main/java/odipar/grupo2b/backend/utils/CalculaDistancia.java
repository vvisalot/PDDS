package odipar.grupo2b.backend.utils;

import odipar.grupo2b.backend.model.Oficina;

public class CalculaDistancia {

    private static final int RADIO_TIERRA_KM = 6371; // Radio de la Tierra en kilómetros

    // Para calcular la distancia entre dos puntos dados por latitud y longitud
    public static double calcular(double latitud1, double longitud1, double latitud2, double longitud2) {
        double dLat = Math.toRadians(latitud2 - latitud1);
        double dLon = Math.toRadians(longitud2 - longitud1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(latitud1)) * Math.cos(Math.toRadians(latitud2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return RADIO_TIERRA_KM * c; // Distancia en kilómetros
    }
}