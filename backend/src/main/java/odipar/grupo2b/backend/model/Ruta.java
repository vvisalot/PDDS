package odipar.grupo2b.backend.model;

import odipar.grupo2b.backend.algorithm.GrafoTramos;

import java.util.*;

public class Ruta {

    private List<Paquete> paquetesEntregados = new ArrayList<>();
    private List<Tramo> rutaRecorrida = new ArrayList<>();
    private double tiempo = 0.0;
    private final GrafoTramos grafoTramos = GrafoTramos.getInstance();
    private final MapaVelocidad mapaVelocidad = MapaVelocidad.getInstance();
    private Oficina puntoPartida;
    private static final double TIEMPO_EN_OFICINA = 1;
    private static final double TIEMPO_DESCARGA = 1;

    public Ruta(Oficina puntoPartida) {
        for (int i = 0; i < RutaManager.cantidadPaquetes(); i++) {
            paquetesEntregados.add(null);
        }
        this.puntoPartida = puntoPartida;
    }

    public Ruta(List<Tramo> tramos) {
        this.rutaRecorrida = tramos;
    }

    public Ruta() {}

    public Ruta(Oficina puntoInicial, Oficina almacenRetorno){
        var paqueteVacioInicial = new Paquete(new Venta(puntoInicial),0);
        var paqueteVacioAlmacenRetorno = new Paquete(new Venta(almacenRetorno),0);
        this.paquetesEntregados.add(paqueteVacioInicial);
        this.paquetesEntregados.add(paqueteVacioAlmacenRetorno);
    }

    @SuppressWarnings("unchecked")
    public Ruta(ArrayList<Paquete> paquetes, Oficina puntoPartida) {
        this.paquetesEntregados = (ArrayList<Paquete>) paquetes.clone();
        this.puntoPartida = puntoPartida;
    }

    public ArrayList<Paquete> getPaquetesEntregados(){
        return (ArrayList<Paquete>) paquetesEntregados;
    }

    // Creamos una solución vecina intercambiando dos paquetes
    public void generateIndividual() {
        for (int paqueteIndex = 0; paqueteIndex < RutaManager.cantidadPaquetes(); paqueteIndex++) {
            setPaquete(paqueteIndex, RutaManager.obtenerPaquete(paqueteIndex));
        }
        Collections.shuffle(paquetesEntregados);
        var ventaVacia = new Venta();
        ventaVacia.setDestino(puntoPartida);
        var puntoInicial = new Paquete(ventaVacia,0);
        paquetesEntregados.add(0,puntoInicial);
        RutaManager.agregarPuntoInicial(puntoInicial);
    }

    public void generateIndividualGreedy() {
        var ventaVacia = new Venta();
        ventaVacia.setDestino(puntoPartida);
        var puntoInicial = new Paquete(ventaVacia,0);
        RutaManager.agregarPuntoInicial(puntoInicial);

        var paquetes = RutaManager.obtenerPaquetes();

        var paquetesAux = calculateShortestPath(paquetes);
        RutaManager.setPaquetesAEntregar(paquetesAux);
        /*var customComparator = Comparator
            .<Paquete>comparingInt(paquete -> RutaManager.prioridadRegion.getOrDefault(paquete.getVenta().getDestino().getRegion(), Integer.MAX_VALUE))
             .thenComparingDouble(paquete -> this.compararDistancias(paquete, puntoPartida));

        paquetes.sort(customComparator);*/
        paquetesEntregados.add(null);
        for (int paqueteIndex = 0; paqueteIndex < RutaManager.cantidadPaquetes(); paqueteIndex++) {
            setPaquete(paqueteIndex, RutaManager.obtenerPaquete(paqueteIndex));
        }

    }

    private List<Paquete> calculateShortestPath(List<Paquete> paquetes) {
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

    private List<Paquete> findShortestPathWithinSector(Paquete start, List<Paquete> sectorLocations) {
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

    private double haversineDistance(Paquete p1, Paquete p2) {
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

    public double compararDistancias(Paquete paquete, Oficina puntoPartida){
        var mejorRuta = grafoTramos.obtenerRutaMasCorta(puntoPartida, paquete.getVenta().getDestino());
        return calcularTiempoRuta(mejorRuta);
    }

    public Paquete getPaquete(int index) {
        return paquetesEntregados.get(index);
    }

    public void setPaquete(int index, Paquete paquete) {
        paquetesEntregados.set(index, paquete);
        // If the tour has been altered we need to reset the fitness and distance
        tiempo = 0.0;
    }

    public double getTiempoTotal(){
        if (tiempo == 0.0) {
            double tiempoRuta = 0.0;
            // Loop through our tour's cities
            for (int paqueteIndex=0; paqueteIndex < cantidadPaquetes() && cantidadPaquetes()>1; paqueteIndex++) {
                // Get city we're traveling from
                Paquete paqueteActual = getPaquete(paqueteIndex);
                // City we're traveling to
                Paquete paqueteSiguiente;
                // Check we're not on our tour's last city, if we are set our
                // tour's final destination city to our starting city
                if(paqueteIndex+1 < cantidadPaquetes()){
                    paqueteSiguiente = getPaquete(paqueteIndex+1);
                }
                else{
                    paqueteSiguiente = getPaquete(0);
                }
                // Get the distance between the two cities

                tiempoRuta += calcularTiempoRuta(paqueteActual, paqueteSiguiente);
                tiempoRuta += paqueteIndex != cantidadPaquetes() -1 ? TIEMPO_EN_OFICINA : TIEMPO_DESCARGA;
            }
            tiempo = tiempoRuta;
        }
        return tiempo;
    }

    public double getTiempoRegreso(){
        if (tiempo == 0.0) {
            double tiempoRuta = 0.0;
            // Loop through our tour's cities
            for (int paqueteIndex=0; paqueteIndex+1 < cantidadPaquetes() && cantidadPaquetes()>1; paqueteIndex++) {
                // Get city we're traveling from
                Paquete paqueteActual = getPaquete(paqueteIndex);
                // City we're traveling to
                Paquete paqueteSiguiente;
                // Check we're not on our tour's last city, if we are set our
                // tour's final destination city to our starting city
                paqueteSiguiente = getPaquete(paqueteIndex+1);

                // Get the distance between the two cities

                tiempoRuta += calcularTiempoRuta(paqueteActual, paqueteSiguiente);
                tiempoRuta += TIEMPO_EN_OFICINA;
            }
            tiempo = tiempoRuta;
        }
        return tiempo;
    }

    public int cantidadPaquetes() {
        return paquetesEntregados.size();
    }

    @Override
    public String toString() {
        construirRuta();
        if (rutaRecorrida.isEmpty()) {
            return "No hay ruta para este camión";
        }
        StringBuilder s = new StringBuilder(rutaRecorrida.get(0).toString());
        for (int i = 1; i < rutaRecorrida.size(); i++) {
            s.append(" | ").append(rutaRecorrida.get(i).toString());
        }
        return s.toString();
    }

    public double calcularTiempoRuta(Paquete paqueteActual, Paquete paqueteSiguiente) {
        var oficinaActual = paqueteActual.getVenta().getDestino();
        var oficinaSiguiente = paqueteSiguiente.getVenta().getDestino();
        var mejorRuta = grafoTramos.obtenerRutaMasCorta(oficinaActual, oficinaSiguiente);
        return calcularTiempoRuta(mejorRuta);
    }

    public double calcularTiempoRuta() {
        double tiempoTotal = 0.0;
        for (Tramo tramo : rutaRecorrida) {
            var velocidad = mapaVelocidad.obtenerVelocidad(tramo.getOrigen().getRegion(), tramo.getDestino().getRegion());
            tiempoTotal += tramo.getDistancia() / velocidad;
        }
        return tiempoTotal;
    }

    public double calcularTiempoRuta(List<Tramo> ruta) {
        double tiempoTotal = 0.0;
        for (Tramo tramo : ruta) {
            var velocidad = mapaVelocidad.obtenerVelocidad(tramo.getOrigen().getRegion(), tramo.getDestino().getRegion());
            tiempoTotal += tramo.getDistancia() / velocidad;
        }
        return tiempoTotal;
    }

    public void construirRuta(){
        List<Tramo> ruta = new ArrayList<>();
        for (int i = 0; i < paquetesEntregados.size() - 1; i++) {
            var oficinaActual = paquetesEntregados.get(i).getVenta().getDestino();
            var oficinaSiguiente = paquetesEntregados.get(i + 1).getVenta().getDestino();
            var mejorRuta = grafoTramos.obtenerRutaMasCorta(oficinaActual, oficinaSiguiente);
            ruta.addAll(mejorRuta);
        }
        this.rutaRecorrida = ruta;
    }

    public void construirRutaMarcada(){
        List<Tramo> ruta = new ArrayList<>();
        for (int i = 0; i < paquetesEntregados.size() - 1; i++) {
            var oficinaActual = paquetesEntregados.get(i).getVenta().getDestino();
            var oficinaSiguiente = paquetesEntregados.get(i + 1).getVenta().getDestino();
            var mejorRuta = grafoTramos.obtenerRutaMasCorta(oficinaActual, oficinaSiguiente);
            mejorRuta.get(mejorRuta.size() - 1).setEsFinal(true);
            ruta.addAll(mejorRuta);
        }
        this.rutaRecorrida = ruta;
    }
    //TODO: Desmarcar los tramos como finales
    public void desmarcarTramos(){
        for(Tramo tramo: rutaRecorrida){
            tramo.setEsFinal(false);
        }
    }
    public List<Tramo> getRutaRecorrida(){
        return this.rutaRecorrida;
    }
}
