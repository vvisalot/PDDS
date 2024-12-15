package odipar.grupo2b.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import odipar.grupo2b.backend.algorithm.AsignadorVentas;
import odipar.grupo2b.backend.algorithm.GrafoTramos;
import odipar.grupo2b.backend.algorithm.SimulatedAnnealing;
import odipar.grupo2b.backend.dto.Bloqueo;
import odipar.grupo2b.backend.dto.Mantenimiento;
import odipar.grupo2b.backend.dto.Resultado;
import odipar.grupo2b.backend.dto.Solucion;
import odipar.grupo2b.backend.model.Camion;
import odipar.grupo2b.backend.model.Oficina;
import odipar.grupo2b.backend.model.Venta;
import odipar.grupo2b.backend.utils.RelojSimulado;

@Service
public class AlgoritmoService {
    private final int DIAS_MANTENIMIENTO = 3;

    public Resultado simular(List<Camion> camiones, RelojSimulado reloj, List<Venta> ventas,
                                  List<Oficina> almacenesPrincipales, GrafoTramos grafoTramos, Map<LocalDateTime, List<Bloqueo>> mapaBloqueos){
        var mantenimientos = new ArrayList<Mantenimiento>();
        for (Camion c : camiones) {
            //Revisar si esta en mantenimiento, si ya paso los días de mantenimiento vuelve a estar disponible
            if (c.getEnMantenimiento() && reloj.getTiempo().equals(c.getFechaUltimoMantenimiento().plusDays(DIAS_MANTENIMIENTO))) {
                c.setEnMantenimiento(false);
            }
            //Revisar si el camión se tiene que quedar por mantenimiento
            for (LocalDateTime fechaMantenimieto : c.getMantenimientosProgrmados()) {
                if (fechaMantenimieto.equals(reloj.getTiempo())) {
                    c.setFechaUltimoMantenimiento(reloj.getTiempo());
                    c.setEnMantenimiento(true);
                    mantenimientos.add(new Mantenimiento(c.getCodigo(), reloj.getTiempo(), reloj.getTiempo().plusDays(DIAS_MANTENIMIENTO)));
                }
            }
        }

        // <editor-fold desc="ENDPOINT REGISTRAR VENTAS">
        // Asignamos las ventas a los camiones
        var mapaCamionesPorCentral = AsignadorVentas.asignarVentasGreedy(camiones, ventas, almacenesPrincipales, grafoTramos);
        // </editor-fold>

        // <editor-fold desc="ENDPOINT SIMULACION">
        //Este loop corre cada vez que se tiene que
        var solucion = new ArrayList<Solucion>();
        for (var entry : mapaCamionesPorCentral.entrySet()) {
            for (var camion : entry.getValue()) {
                if (camion.getPaquetes().isEmpty()) {
                    continue;
                }
                var solucionCamion = SimulatedAnnealing.calcular(camion.getPaquetes(), camion, reloj, almacenesPrincipales);
                solucion.add(solucionCamion);
            }
        }

        //Actualizar posicion de los camiones para siguiente ejecucion
        for(Camion c :camiones) {
            if(c.getEnRuta()){
                if (c.getRegresoAlmacen().isBefore(reloj.getTiempoSiguienteBatch())){
                    c.setEnRuta(false);
                    c.setCargaActual(0);
                }
            }
        }
        var bloqueos = mapaBloqueos.get(reloj.getTiempo());
        reloj.pasarCicloDeEntregas();
        return new Resultado(solucion, mantenimientos, bloqueos);
    }


    public Resultado simular(List<Camion> camiones, List<Venta> ventas,
                                  List<Oficina> almacenesPrincipales, GrafoTramos grafoTramos, LocalDateTime fechaHora, Map<LocalDateTime, List<Bloqueo>> mapaBloqueos){
        var mantenimientos = new ArrayList<Mantenimiento>();
        for (Camion c : camiones) {
            //Revisar si esta en mantenimiento, si ya paso los días de mantenimiento vuelve a estar disponible
            if (c.getEnMantenimiento() && fechaHora.equals(c.getFechaUltimoMantenimiento().plusDays(DIAS_MANTENIMIENTO))) {
                c.setEnMantenimiento(false);
            }
            //Revisar si el camión se tiene que quedar por mantenimiento
            for (LocalDateTime fechaMantenimieto : c.getMantenimientosProgrmados()) {
                if (fechaMantenimieto.equals(fechaHora)) {
                    c.setFechaUltimoMantenimiento(fechaHora);
                    c.setEnMantenimiento(true);
                    mantenimientos.add(new Mantenimiento(c.getCodigo(), fechaHora, fechaHora.plusDays(DIAS_MANTENIMIENTO)));
                }
            }
        }

        // <editor-fold desc="ENDPOINT REGISTRAR VENTAS">
        // Asignamos las ventas a los camiones
        var mapaCamionesPorCentral = AsignadorVentas.asignarVentasGreedy(camiones, ventas, almacenesPrincipales, grafoTramos, fechaHora);
        // </editor-fold>

        // <editor-fold desc="ENDPOINT SIMULACION">
        //Este loop corre cada vez que se tiene que
        var solucion = new ArrayList<Solucion>();
        for (var entry : mapaCamionesPorCentral.entrySet()) {
            for (var camion : entry.getValue()) {
                if (camion.getPaquetes().isEmpty()) {
                    continue;
                }
                var solucionCamion = SimulatedAnnealing.calcular(camion.getPaquetes(), camion, fechaHora, almacenesPrincipales);
                solucion.add(solucionCamion);
            }
        }

        //Actualizar posicion de los camiones para siguiente ejecucion
        var fechaSiguiente = fechaHora.plusHours(6);
        for(Camion c :camiones) {
            if(c.getEnRuta()){
                if (c.getRegresoAlmacen().isBefore(fechaSiguiente)){
                    c.setEnRuta(false);
                    c.setCargaActual(0);
                }
            }
        }
        int hour = fechaHora.getHour();
        int closestMultiple = (hour / 6) * 6;
        var key = fechaHora.withHour(closestMultiple).withMinute(0).withSecond(0).withNano(0);
        var bloqueos = mapaBloqueos.get(key);
        return new Resultado(solucion, mantenimientos, bloqueos);
    }
}
