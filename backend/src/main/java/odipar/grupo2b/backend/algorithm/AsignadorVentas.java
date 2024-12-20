package odipar.grupo2b.backend.algorithm;

import odipar.grupo2b.backend.model.*;
import odipar.grupo2b.backend.utils.RelojSimulado;

import java.time.LocalDateTime;
import java.util.*;

public class AsignadorVentas {
    private static final RelojSimulado reloj = RelojSimulado.getInstance();
    private static final MapaVelocidad mapaVelocidad = MapaVelocidad.getInstance();
    private static final double TIEMPO_EN_OFICINA = 0;
    private static final double TIEMPO_DESCARGA = 1;
    //Se asignaran las ventas segun la cercania a los almacenes principales en Lima, Arequipa y Trujillo
    public static Map<Oficina, List<Camion>> asignarVentasGreedy(List<Camion> camiones, List<Venta> ventas, List<Oficina> almacenesPrincipales, GrafoTramos grafoTramos) {
//        List<Venta> ventasAsignadas = new ArrayList<>();
        Map<Oficina, List<Camion>> mapaCamionesPorCentral = new HashMap<>();

        for (Camion camion : camiones) {
            if (camion.getEnRuta()) {
                continue;
            }
            // Solo corre una vez para inicializar cada Central
            mapaCamionesPorCentral.computeIfAbsent(camion.getAlmacenCarga(), k -> new ArrayList<>());
            // Agregar camion a la lista de camiones de la central
            mapaCamionesPorCentral.get(camion.getAlmacenCarga()).add(camion);
        }
        var ventasProcesadas = ventas.stream()
                .filter(v -> v.getFechaHora().isAfter(reloj.getTiempo().minusHours(reloj.getIntervalo())) && v.getFechaHora().isBefore(reloj.getTiempoSiguienteBatch().minusHours(reloj.getIntervalo())))
                .toList();
        // Calculamos el tiempo para cada venta desde cada almacen principal
        Map<Oficina, Map<Venta, Double>> mapaTiempoPorVentaPorOficina = new HashMap<>();
        for (var almacen : almacenesPrincipales) {
            Map<Venta, Double> mapaTiempoPorVenta = new HashMap<>();
            for (var venta : ventasProcesadas) {
                var mejorRuta = new Ruta(grafoTramos.obtenerRutaMasCorta(almacen, venta.getDestino()));
                var tiempo = mejorRuta.calcularTiempoRuta();
                mapaTiempoPorVenta.put(venta, tiempo);
            }
            mapaTiempoPorVentaPorOficina.put(almacen, mapaTiempoPorVenta);
        }

        // Asignamos las ventas a los camiones
        // Comparar el tiempo para cada venta y nos quedamos con el mejor de los n almacenes
        for (Venta venta : ventasProcesadas) {
            int cantidadRestante = venta.getCantidad();  // Cantidad restante por asignar
            while (cantidadRestante > 0) {
                Camion camionSeleccionado = seleccionarCamion(venta, mapaCamionesPorCentral, mapaTiempoPorVentaPorOficina, grafoTramos, cantidadRestante);
                if (camionSeleccionado == null) {
                    System.out.println("No se pudo asignar completamente la venta. Cantidad restante: " + cantidadRestante + " unidades");
                    break;
                }
                int capacidadDisponible = camionSeleccionado.getCapacidad() - camionSeleccionado.getCargaActual();

                if (capacidadDisponible > 0) {
                    int cantidadAsignada = Math.min(capacidadDisponible, cantidadRestante);  // Asignar la mayor cantidad posible

                    camionSeleccionado.setCargaActual(camionSeleccionado.getCargaActual() + cantidadAsignada);
                    cantidadRestante -= cantidadAsignada;

                    // Se pasa una parte de una venta a un paquete
                    // Para saber que parte de la venta tiene un camion (Venta parcial)
                    var paquete = new Paquete(venta, cantidadAsignada);
                    camionSeleccionado.agregarPaquete(paquete);  // Agregar la venta al camión
                }
            }
        }
        return mapaCamionesPorCentral;
    }

    public static Map<Oficina, List<Camion>> asignarVentasGreedy(List<Camion> camiones, List<Venta> ventas, List<Oficina> almacenesPrincipales, GrafoTramos grafoTramos, LocalDateTime fechaHora) {
        Map<Oficina, List<Camion>> mapaCamionesPorCentral = new HashMap<>();
        var fechaSiguiente = fechaHora.plusHours(6);
        for (Camion camion : camiones) {
            if (camion.getEnRuta()) {
                continue;
            }
            // Solo corre una vez para inicializar cada Central
            mapaCamionesPorCentral.computeIfAbsent(camion.getAlmacenCarga(), k -> new ArrayList<>());
            // Agregar camion a la lista de camiones de la central
            mapaCamionesPorCentral.get(camion.getAlmacenCarga()).add(camion);
        }
        var ventasProcesadas = ventas.stream()
                .filter(v -> v.getFechaHora().isAfter(fechaHora.minusHours(reloj.getIntervalo())) && v.getFechaHora().isBefore(fechaSiguiente.minusHours(reloj.getIntervalo())))
                .toList();
        // Calculamos el tiempo para cada venta desde cada almacen principal
        Map<Oficina, Map<Venta, Double>> mapaTiempoPorVentaPorOficina = new HashMap<>();
        for (var almacen : almacenesPrincipales) {
            Map<Venta, Double> mapaTiempoPorVenta = new HashMap<>();
            for (var venta : ventasProcesadas) {
                var mejorRuta = new Ruta(grafoTramos.obtenerRutaMasCorta(almacen, venta.getDestino()));
                var tiempo = mejorRuta.calcularTiempoRuta();
                mapaTiempoPorVenta.put(venta, tiempo);
            }
            mapaTiempoPorVentaPorOficina.put(almacen, mapaTiempoPorVenta);
        }

        // Asignamos las ventas a los camiones
        // Comparar el tiempo para cada venta y nos quedamos con el mejor de los n almacenes
        for (Venta venta : ventasProcesadas) {
            int cantidadRestante = venta.getCantidad();  // Cantidad restante por asignar
            while (cantidadRestante > 0) {
                Camion camionSeleccionado = seleccionarCamion(venta, mapaCamionesPorCentral, mapaTiempoPorVentaPorOficina, grafoTramos, cantidadRestante);
                if (camionSeleccionado == null) {
                    System.out.println("No se pudo asignar completamente la venta. Cantidad restante: " + cantidadRestante + " unidades");
                    break;
                }
                int capacidadDisponible = camionSeleccionado.getCapacidad() - camionSeleccionado.getCargaActual();

                if (capacidadDisponible > 0) {
                    int cantidadAsignada = Math.min(capacidadDisponible, cantidadRestante);  // Asignar la mayor cantidad posible

                    camionSeleccionado.setCargaActual(camionSeleccionado.getCargaActual() + cantidadAsignada);
                    cantidadRestante -= cantidadAsignada;

                    // Se pasa una parte de una venta a un paquete
                    // Para saber que parte de la venta tiene un camion (Venta parcial)
                    var paquete = new Paquete(venta, cantidadAsignada);
                    camionSeleccionado.agregarPaquete(paquete);  // Agregar la venta al camión
                }
            }
        }
        return mapaCamionesPorCentral;
    }

    private static Camion seleccionarCamion(Venta venta, Map<Oficina, List<Camion>> mapaCamionesPorCentral, Map<Oficina, Map<Venta, Double>> mapaTiempoPorVentaPorOficina, GrafoTramos grafoTramos, int cantidadRestante) {
        Camion camionSeleccionado = null;
        double menorTiempo = Double.MAX_VALUE;
        int capacidadMinima = Integer.MAX_VALUE;
        for (var almacen : mapaCamionesPorCentral.keySet()) {
            for (var camion : mapaCamionesPorCentral.get(almacen)) {
                var paquestesActuales = camion.getPaquetes();
                Double tiempo;                
                if(paquestesActuales.size() == 0) {
                    tiempo = mapaTiempoPorVentaPorOficina.get(almacen).get(venta);
                }else{
                    var ventaVacia = new Venta();
                    ventaVacia.setDestino(almacen);
                    var puntoInicial = new Paquete(ventaVacia,0);
                    var paquetesTemp = new ArrayList<Paquete>();
                    paquetesTemp.addAll(camion.getPaquetes());
                    paquetesTemp.add(0, puntoInicial);
                    int cantidadAsignada = Math.min(camion.getCapacidad() - camion.getCargaActual(), cantidadRestante);
                    var paqueteNuevo = new Paquete(venta, cantidadAsignada);
                    paquetesTemp.add(paqueteNuevo);
                    var paquetesOrdenados = calculateShortestPath(paquetesTemp);
                    List<Tramo> rutaTemp = new ArrayList<>();
                    Double tiempoCalculo = 0.0;
                    for (int i = 0; i < paquetesOrdenados.size() - 1; i++) {
                        var oficinaActual = paquetesOrdenados.get(i).getVenta().getDestino();
                        var oficinaSiguiente = paquetesOrdenados.get(i + 1).getVenta().getDestino();
                        var mejorRuta = grafoTramos.obtenerRutaMasCorta(oficinaActual, oficinaSiguiente);                        
                        if( venta.getDestino().getCodigo().equals(oficinaSiguiente.getCodigo()) ){
                            tiempoCalculo = 0.0;
                            for (Tramo tramo : mejorRuta) {
                                var velocidad = mapaVelocidad.obtenerVelocidad(tramo.getOrigen().getRegion(), tramo.getDestino().getRegion());
                                tiempoCalculo += tramo.getDistancia() / velocidad;
                            }
                        }
                        rutaTemp.addAll(mejorRuta);
                    }
                    Double tiempoTotal = 0.0;
                    for (Tramo tramo : rutaTemp) {
                        var velocidad = mapaVelocidad.obtenerVelocidad(tramo.getOrigen().getRegion(), tramo.getDestino().getRegion());
                        tiempoTotal += tramo.getDistancia() / velocidad;
                    }
                    tiempoTotal += (double)paquetesOrdenados.size();

                    boolean valido = true;
                    if (tiempoTotal <= 24.0) {
                        valido = true;
                    } else if (tiempoTotal <= 48.0) {
                        var rutaMarcada = construirRutaMarcada(paquetesOrdenados, grafoTramos);
                        var tiempoEnRuta = 0.0;
                        for (int i = 0; i< rutaMarcada.size(); i++) {
                            var tramo = rutaMarcada.get(i);
                            var velocidad = mapaVelocidad.obtenerVelocidad(tramo.getOrigen().getRegion(), tramo.getDestino().getRegion());
                            tiempoEnRuta += tramo.getDistancia() / velocidad;
                            tiempoEnRuta += i != rutaMarcada.size() -1 ? TIEMPO_EN_OFICINA: TIEMPO_DESCARGA;
                            if (tramo.getEsFinal() && tramo.getDestino().getRegion().equals("COSTA") && tiempoEnRuta >= 24.0) {
                                desmarcarTramos(rutaMarcada);
                                valido = false;
                                break;
                            }
                        }
                        if(!valido) continue;
                        desmarcarTramos(rutaMarcada);
                        valido = true;
                    } else if (tiempoTotal <= 72.0) {
                        var rutaMarcada = construirRutaMarcada(paquetesOrdenados, grafoTramos);
                        var tiempoEnRuta = 0.0;
                        for (int i = 0; i< rutaMarcada.size(); i++) {
                            var tramo = rutaMarcada.get(i);
                            var velocidad = mapaVelocidad.obtenerVelocidad(tramo.getOrigen().getRegion(), tramo.getDestino().getRegion());
                            tiempoEnRuta += tramo.getDistancia() / velocidad;
                            tiempoEnRuta += i != rutaMarcada.size() -1 ? TIEMPO_EN_OFICINA: TIEMPO_DESCARGA;
                            if (tramo.getEsFinal()) {
                                if (tramo.getDestino().getRegion().equals("COSTA") && tiempoEnRuta >= 24.0) {
                                    desmarcarTramos(rutaMarcada);
                                    valido = false;
                                break;
                                } else if (tramo.getDestino().getRegion().equals("SIERRA") && tiempoEnRuta >= 48.0) {
                                    desmarcarTramos(rutaMarcada);
                                    valido = false;
                                break;
                                }
                            }
                        }
                        if(!valido) continue;
                        desmarcarTramos(rutaMarcada);
                        valido = true;
                    } else {
                        valido = false;
                    }
                    if(!valido) continue;                    
                    tiempo = tiempoCalculo;
                }
                
                var capacidadDisponible = camion.getCapacidad() - camion.getCargaActual();
                if (tiempo < menorTiempo && !camion.getEnRuta() && !camion.getEnMantenimiento() && capacidadDisponible > 0) {
                    // Si el tiempo es menor, actualizamos el camión seleccionado sin importar la capacidad
                    menorTiempo = tiempo;
                    camionSeleccionado = camion;
                    capacidadMinima = capacidadDisponible;
                } else if (tiempo == menorTiempo && !camion.getEnRuta() && !camion.getEnMantenimiento() && capacidadDisponible > 0 && capacidadDisponible < capacidadMinima) {
                    // Si el tiempo es igual, seleccionamos el camión con la menor capacidad disponible
                    camionSeleccionado = camion;
                    capacidadMinima = capacidadDisponible;
                }
            }
        }
        return camionSeleccionado;
    }

    private static List<Tramo> construirRutaMarcada(List<Paquete> paquetesEntregados, GrafoTramos grafoTramos){
        List<Tramo> ruta = new ArrayList<>();
        for (int i = 0; i < paquetesEntregados.size() - 1; i++) {
            var oficinaActual = paquetesEntregados.get(i).getVenta().getDestino();
            var oficinaSiguiente = paquetesEntregados.get(i + 1).getVenta().getDestino();
            var mejorRuta = grafoTramos.obtenerRutaMasCorta(oficinaActual, oficinaSiguiente);
            mejorRuta.get(mejorRuta.size() - 1).setEsFinal(true);
            ruta.addAll(mejorRuta);
        }
        return ruta;
    }

    private static void desmarcarTramos(List<Tramo> ruta){
        for(Tramo tramo: ruta){
            tramo.setEsFinal(false);
        }
    }

    private static List<Paquete> calculateShortestPath(List<Paquete> paquetes) {
        // Group locations by sector
        Map<Integer, List<Paquete>> sectorMap = new HashMap<>();
        for (Paquete p : paquetes) {
            sectorMap.computeIfAbsent(RutaManager.prioridadRegion.getOrDefault(p.getVenta().getDestino().getRegion(), Integer.MAX_VALUE), k -> new ArrayList<>()).add(p);
        }

        ArrayList<Paquete> path = new ArrayList<>();
        Paquete current = null;

        // Process sectors in order (1, 2, 3)
        for (int sector = 1; sector <= 3; sector++) {
            List<Paquete> sectorLocations = sectorMap.getOrDefault(sector, new ArrayList<>());
            if (!sectorLocations.isEmpty()) {
                if (current == null) {
                    // Starting point for the first region
                    current = sectorLocations.remove(0);
                    path.add(current);
                } else {
                    // Find the closest location in the new sector to the last visited location
                    Paquete closestStart = null;
                    double minDistance = Double.MAX_VALUE;
                    for (Paquete loc : sectorLocations) {
                        double distance = haversineDistance(current, loc);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestStart = loc;
                        }
                    }
                    // Start the new sector from the closest location
                    sectorLocations.remove(closestStart);
                    path.add(closestStart);
                    current = closestStart;
                }

                // Find the shortest path within the current sector
                List<Paquete> shortestWithinSector = findShortestPathWithinSector(current, sectorLocations);
                path.addAll(shortestWithinSector);

                // Update the current location to the last in the path
                if (!shortestWithinSector.isEmpty()) {
                    current = shortestWithinSector.get(shortestWithinSector.size() - 1);
                }
            }
        }

        return path;
    }

    private static List<Paquete> findShortestPathWithinSector(Paquete start, List<Paquete> sectorLocations) {
        ArrayList<Paquete> path = new ArrayList<>();
        Paquete current = start;

        while (!sectorLocations.isEmpty()) {
            Paquete nearest = null;
            double minDistance = Double.MAX_VALUE;
            for (Paquete loc : sectorLocations) {
                double distance = haversineDistance(current, loc);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = loc;
                }
            }
            path.add(nearest);
            sectorLocations.remove(nearest);
            current = nearest;
        }

        return path;
    }

    private static double haversineDistance(Paquete p1, Paquete p2) {
        final double R = 6371.0; // Earth's radius in kilometers
        double lat1 = Math.toRadians(p1.getVenta().getDestino().getLatitud());
        double lon1 = Math.toRadians(p1.getVenta().getDestino().getLongitud());
        double lat2 = Math.toRadians(p2.getVenta().getDestino().getLatitud());
        double lon2 = Math.toRadians(p2.getVenta().getDestino().getLongitud());

        double dLat = lat2 - lat1;
        double dLon = lon2 - lon1;

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in kilometers
    }
}
