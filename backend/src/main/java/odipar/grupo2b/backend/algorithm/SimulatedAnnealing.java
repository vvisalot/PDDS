package odipar.grupo2b.backend.algorithm;

import odipar.grupo2b.backend.dto.Solucion;
import odipar.grupo2b.backend.model.*;
import odipar.grupo2b.backend.utils.RelojSimulado;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class SimulatedAnnealing {
    private static final MapaVelocidad mapaVelocidad = MapaVelocidad.getInstance();
    private static final double TIEMPO_DESCARGA = 1;
    private static final double TIEMPO_EN_OFICINA = 1;
    private final GrafoTramos grafoTramos = GrafoTramos.getInstance();

    public static Solucion calcular(List<Paquete> paquetes, Camion camion, RelojSimulado reloj,
                                  List<Oficina> almacenesPrincipales) {
        RutaManager.limpiarPaquetes();
        for (var paquete : paquetes) {
            RutaManager.agregarPaquete(paquete);
        }

        double temp = 100000;
        double coolingRate = 0.003;
        Ruta currentSolution;
        Ruta best;
        double bestTime;

        currentSolution = new Ruta(camion.getPosicionFinal());
        currentSolution.generateIndividualGreedy();

        best = new Ruta(currentSolution.getPaquetesEntregados(), camion.getPosicionFinal());
        bestTime = best.getTiempoTotal();

        if(esRutaInvalida(best, bestTime)){
            return new Solucion(
                true,
                null,
                null,
                null
            ); 
        }

        best.construirRutaMarcada();
        var posicionFinal = best.getPaquetesEntregados().get(best.getPaquetesEntregados().size() - 1).getVenta().getDestino();
        camion.setPosicionFinal(posicionFinal);

        //AGREGAR TIEMPO DE LLEGADA A ULTIMO PUNTO
        double hoursToAdd = bestTime;
        long wholeHours = (long) hoursToAdd;
        long minutes = (long) ((hoursToAdd - wholeHours) * 60);
        var fechaEntregaUltimoPaquete = reloj.getTiempo().plusHours(wholeHours).plusMinutes(minutes);
        camion.setFechaDeLlegadaPosicionFinal(fechaEntregaUltimoPaquete);
        camion.setEnRuta(true);

        //Escoger almacén de retorno
        var mejorTiempo = Double.MAX_VALUE;
        Oficina almacenRegreso = null;
        Ruta mejorRutaRegreso = new Ruta();
        for (Oficina almacen : almacenesPrincipales) {
            Ruta rutaRegreso = new Ruta(posicionFinal, almacen);
            var tiempoRegreso = rutaRegreso.getTiempoRegreso();
            if (tiempoRegreso < mejorTiempo) {
                mejorTiempo = tiempoRegreso;
                almacenRegreso = almacen;
                mejorRutaRegreso = rutaRegreso;
            }
        }

        camion.setAlmacenCarga(almacenRegreso);
        var paquetesAEntregar = new ArrayList<odipar.grupo2b.backend.dto.Paquete>();

        for(int i = 1; i < best.getPaquetesEntregados().size();i++){
            var paquete = best.getPaquetesEntregados().get(i);
            var destino = paquete.getVenta().getDestino();
            paquetesAEntregar.add(new odipar.grupo2b.backend.dto.Paquete(
                    paquete.getVenta().getCodigo(),
                    paquete.getVenta().getFechaHora(),
                    new odipar.grupo2b.backend.dto.Oficina(destino.getLatitud(),destino.getLongitud()),
                    paquete.getCantidad(),
                    paquete.getVenta().getCantidad(),
                    paquete.getVenta().getIdCliente()
            ));
        }
        var camionSolucion = new odipar.grupo2b.backend.dto.Camion(camion.getCodigo(),camion.getTipo(),camion.getCapacidad(),camion.getCargaActual(),paquetesAEntregar);
        var tramosSolucion = new ArrayList<odipar.grupo2b.backend.dto.Tramo>();
        LocalDateTime tiempoActual = reloj.getTiempo();
        for (int i=0;  i< best.getRutaRecorrida().size(); i++) {
            var tramo = best.getRutaRecorrida().get(i);
            var origen = tramo.getOrigen();
            var destino = tramo.getDestino();
            var velocidad = mapaVelocidad.obtenerVelocidad(origen.getRegion(), destino.getRegion());
            tramosSolucion.add(new odipar.grupo2b.backend.dto.Tramo(
                    new odipar.grupo2b.backend.dto.Oficina(origen.getLatitud(),origen.getLongitud()),
                    new odipar.grupo2b.backend.dto.Oficina(destino.getLatitud(),destino.getLongitud()),
                    tramo.getDistancia(),
                    velocidad,
                    tiempoActual,
                    tiempoActual = tiempoActual.plusMinutes((long) (tramo.getDistancia() * 60 / velocidad)),
                    i != best.getRutaRecorrida().size() -1 ? (int) TIEMPO_EN_OFICINA: (int) TIEMPO_DESCARGA,
                    tramo.getEsFinal()
            ));
            tiempoActual = tiempoActual.plusHours((long) TIEMPO_EN_OFICINA);
        }
        best.desmarcarTramos();
        mejorRutaRegreso.construirRuta();
        var rutaRegreso = mejorRutaRegreso.getRutaRecorrida();
        posicionFinal = mejorRutaRegreso.getPaquetesEntregados().get(mejorRutaRegreso.getPaquetesEntregados().size() - 1).getVenta().getDestino();
        camion.setPosicionFinal(posicionFinal);
        for (Tramo tramo : rutaRegreso) {
            var origen = tramo.getOrigen();
            var destino = tramo.getDestino();
            var velocidad = mapaVelocidad.obtenerVelocidad(origen.getRegion(), destino.getRegion());
            var tiempoLlegada = tiempoActual.plusMinutes((long) (tramo.getDistancia() * 60.0 / (double) velocidad));
            var origenDTO = new odipar.grupo2b.backend.dto.Oficina(origen.getLatitud(), origen.getLongitud());
            var destinoDTO = new odipar.grupo2b.backend.dto.Oficina(destino.getLatitud(), destino.getLongitud());
            var distancia = tramo.getDistancia();
            var esFinal = tramo.getEsFinal();
            tramosSolucion.add(new odipar.grupo2b.backend.dto.Tramo(
                    origenDTO,
                    destinoDTO,
                    distancia,
                    velocidad,
                    tiempoActual,
                    tiempoLlegada,
                    (int) TIEMPO_EN_OFICINA,
                    esFinal
            ));
            tiempoActual = tiempoActual.plusHours((long) TIEMPO_EN_OFICINA);
        }

        hoursToAdd = bestTime + mejorTiempo;
        wholeHours = (long) hoursToAdd;
        minutes = (long) ((hoursToAdd - wholeHours) * 60);
        camion.setRegresoAlmacen(reloj.getTiempo().plusHours(wholeHours).plusMinutes(minutes));

        return new Solucion(
            false,
            camionSolucion,
            tramosSolucion,
            hoursToAdd
        );
    }

    public static Solucion calcular(List<Paquete> paquetes, Camion camion, LocalDateTime fechaHora,
                                  List<Oficina> almacenesPrincipales) {
        RutaManager.limpiarPaquetes();
        for (var paquete : paquetes) {
            RutaManager.agregarPaquete(paquete);
        }

        double temp = 100000;
        double coolingRate = 0.003;
        Ruta currentSolution;
        Ruta best;
        double bestTime;

        currentSolution = new Ruta(camion.getPosicionFinal());
        currentSolution.generateIndividualGreedy();

        best = new Ruta(currentSolution.getPaquetesEntregados(), camion.getPosicionFinal());
        bestTime = best.getTiempoTotal();

        if(esRutaInvalida(best, bestTime)){
            return new Solucion(
                true,
                null,
                null,
                null
            ); 
        }

        best.construirRutaMarcada();
        var posicionFinal = best.getPaquetesEntregados().get(best.getPaquetesEntregados().size() - 1).getVenta().getDestino();
        camion.setPosicionFinal(posicionFinal);

        //AGREGAR TIEMPO DE LLEGADA A ULTIMO PUNTO
        double hoursToAdd = bestTime;
        long wholeHours = (long) hoursToAdd;
        long minutes = (long) ((hoursToAdd - wholeHours) * 60);
        var fechaEntregaUltimoPaquete = fechaHora.plusHours(wholeHours).plusMinutes(minutes);
        camion.setFechaDeLlegadaPosicionFinal(fechaEntregaUltimoPaquete);
        camion.setEnRuta(true);

        //Escoger almacén de retorno
        var mejorTiempo = Double.MAX_VALUE;
        Oficina almacenRegreso = null;
        Ruta rutaRegreso = new Ruta();
        for (Oficina almacen : almacenesPrincipales) {
            rutaRegreso = new Ruta(posicionFinal, almacen);
            var tiempoRegreso = rutaRegreso.getTiempoRegreso();
            if (tiempoRegreso < mejorTiempo) {
                mejorTiempo = tiempoRegreso;
                almacenRegreso = almacen;
            }
        }

        camion.setAlmacenCarga(almacenRegreso);
        var paquetesAEntregar = new ArrayList<odipar.grupo2b.backend.dto.Paquete>();

        for(int i = 1; i < best.getPaquetesEntregados().size();i++){
            var paquete = best.getPaquetesEntregados().get(i);
            var destino = paquete.getVenta().getDestino();
            paquetesAEntregar.add(new odipar.grupo2b.backend.dto.Paquete(
                    paquete.getVenta().getCodigo(),
                    paquete.getVenta().getFechaHora(),
                    new odipar.grupo2b.backend.dto.Oficina(destino.getLatitud(),destino.getLongitud()),
                    paquete.getCantidad(),
                    paquete.getVenta().getCantidad(),
                    paquete.getVenta().getIdCliente()
            ));
        }
        var camionSolucion = new odipar.grupo2b.backend.dto.Camion(camion.getCodigo(),camion.getTipo(),camion.getCapacidad(),camion.getCargaActual(),paquetesAEntregar);
        var tramosSolucion = new ArrayList<odipar.grupo2b.backend.dto.Tramo>();
        LocalDateTime tiempoActual = fechaHora;
        for (int i=0;  i< best.getRutaRecorrida().size(); i++) {
            var tramo = best.getRutaRecorrida().get(i);
            var origen = tramo.getOrigen();
            var destino = tramo.getDestino();
            var velocidad = mapaVelocidad.obtenerVelocidad(origen.getRegion(), destino.getRegion());
            tramosSolucion.add(new odipar.grupo2b.backend.dto.Tramo(
                    new odipar.grupo2b.backend.dto.Oficina(origen.getLatitud(),origen.getLongitud()),
                    new odipar.grupo2b.backend.dto.Oficina(destino.getLatitud(),destino.getLongitud()),
                    tramo.getDistancia(),
                    velocidad,
                    tiempoActual,
                    tiempoActual = tiempoActual.plusMinutes((long) (tramo.getDistancia() * 60 / velocidad)),
                    i != best.getRutaRecorrida().size() -1 ? (int) TIEMPO_EN_OFICINA: (int) TIEMPO_DESCARGA,
                    tramo.getEsFinal()
            ));
            tiempoActual = tiempoActual.plusHours((long) TIEMPO_EN_OFICINA);
        }
        best.desmarcarTramos();
        for (int i=0;  i< rutaRegreso.getRutaRecorrida().size(); i++) {
            var tramo = rutaRegreso.getRutaRecorrida().get(i);
            var origen = tramo.getOrigen();
            var destino = tramo.getDestino();
            var velocidad = mapaVelocidad.obtenerVelocidad(origen.getRegion(), destino.getRegion());
            tramosSolucion.add(new odipar.grupo2b.backend.dto.Tramo(
                    new odipar.grupo2b.backend.dto.Oficina(origen.getLatitud(),origen.getLongitud()),
                    new odipar.grupo2b.backend.dto.Oficina(destino.getLatitud(),destino.getLongitud()),
                    tramo.getDistancia(),
                    velocidad,
                    tiempoActual,
                    tiempoActual = tiempoActual.plusMinutes((long) (tramo.getDistancia() * 60.0 / (double) velocidad)),
                    (int) TIEMPO_EN_OFICINA,
                    tramo.getEsFinal()
            ));
            tiempoActual = tiempoActual.plusHours((long) TIEMPO_EN_OFICINA);
        }

        hoursToAdd = bestTime + mejorTiempo;
        wholeHours = (long) hoursToAdd;
        minutes = (long) ((hoursToAdd - wholeHours) * 60);
        camion.setRegresoAlmacen(fechaHora.plusHours(wholeHours).plusMinutes(minutes));

        return new Solucion(
            false,
            camionSolucion,
            tramosSolucion,
            hoursToAdd
        );
    }

    public static double acceptanceProbability(double currentTime, double newTime, double temperature) {
        if (newTime < currentTime) {
            return 1.0;
        }
        return Math.exp((currentTime - newTime) / temperature);
    }

    public static double randomDouble() {
        Random r = new Random();
        return r.nextInt(1000) / 1000.0;
    }

    public static int randomInt(int min, int max) {
        Random r = new Random();
        double d = min + r.nextDouble() * (max - min);
        return (int) d;
    }

    private static boolean esRutaInvalida(Ruta ruta, double tiempo) {
        if (tiempo <= 24.0) {
            return false;
        } else if (tiempo <= 48.0) {
            ruta.construirRutaMarcada();
            var rutaEvaluar = ruta.getRutaRecorrida();
            var tiempoEnRuta = 0.0;
            for (int i = 0; i< rutaEvaluar.size(); i++) {
                var tramo = rutaEvaluar.get(i);
                var velocidad = mapaVelocidad.obtenerVelocidad(tramo.getOrigen().getRegion(), tramo.getDestino().getRegion());
                tiempoEnRuta += tramo.getDistancia() / velocidad;
                tiempoEnRuta += i != rutaEvaluar.size() -1 ? TIEMPO_EN_OFICINA: TIEMPO_DESCARGA;
                if (tramo.getEsFinal() && tramo.getDestino().getRegion().equals("COSTA") && tiempoEnRuta >= 24.0) {
                    ruta.desmarcarTramos();
                    return true;
                }
            }
            ruta.desmarcarTramos();
            return false;
        } else if (tiempo <= 72.0) {
            ruta.construirRutaMarcada();
            var rutaEvaluar = ruta.getRutaRecorrida();
            var tiempoEnRuta = 0.0;
            for (int i = 0; i< rutaEvaluar.size(); i++) {
                var tramo = rutaEvaluar.get(i);
                var velocidad = mapaVelocidad.obtenerVelocidad(tramo.getOrigen().getRegion(), tramo.getDestino().getRegion());
                tiempoEnRuta += tramo.getDistancia() / velocidad;
                tiempoEnRuta += i != rutaEvaluar.size() -1 ? TIEMPO_EN_OFICINA: TIEMPO_DESCARGA;
                if (tramo.getEsFinal()) {
                    if (tramo.getDestino().getRegion().equals("COSTA") && tiempoEnRuta >= 24.0) {
                        ruta.desmarcarTramos();
                        return true;
                    } else if (tramo.getDestino().getRegion().equals("SIERRA") && tiempoEnRuta >= 48.0) {
                        ruta.desmarcarTramos();
                        return true;
                    }
                }
            }
            ruta.desmarcarTramos();
            return false;
        }
        ruta.desmarcarTramos();
        return true;
    }
}