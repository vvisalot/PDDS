package odipar.grupo2b.backend.algorithm;

import odipar.grupo2b.backend.model.*;
import odipar.grupo2b.backend.utils.RelojSimulado;

import java.time.LocalDateTime;
import java.util.*;

public class AsignadorVentas {
    private static final RelojSimulado reloj = RelojSimulado.getInstance();

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
                .filter(v -> v.getFechaHora().isAfter(reloj.getTiempo()) && v.getFechaHora().isBefore(reloj.getTiempoSiguienteBatch()))
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
                Camion camionSeleccionado = seleccionarCamion(venta, mapaCamionesPorCentral, mapaTiempoPorVentaPorOficina);
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
                .filter(v -> v.getFechaHora().isAfter(fechaHora) && v.getFechaHora().isBefore(fechaSiguiente))
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
                Camion camionSeleccionado = seleccionarCamion(venta, mapaCamionesPorCentral, mapaTiempoPorVentaPorOficina);
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

    private static Camion seleccionarCamion(Venta venta, Map<Oficina, List<Camion>> mapaCamionesPorCentral, Map<Oficina, Map<Venta, Double>> mapaTiempoPorVentaPorOficina) {
        Camion camionSeleccionado = null;
        double menorTiempo = Double.MAX_VALUE;
        int capacidadMinima = Integer.MAX_VALUE;
        for (var almacen : mapaCamionesPorCentral.keySet()) {
            for (var camion : mapaCamionesPorCentral.get(almacen)) {
                var tiempo = mapaTiempoPorVentaPorOficina.get(almacen).get(venta);
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
}
