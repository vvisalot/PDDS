package odipar.grupo2b.backend.model;

import odipar.grupo2b.backend.utils.CalculaDistancia;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Tramo {
    private List<Bloqueo> bloqueos = null;
    private double distancia;

    private Oficina origen;
    private Oficina destino;

    private double costoReal;
    private double costoTotal;
    private boolean esFinal = false;
    private boolean estaBloqueado = false;

    public Tramo(Oficina origen, Oficina destino){
        this.origen = origen;
        this.destino = destino;
    }

    public Tramo(Oficina origen, Oficina destino, double distancia) {
        this.origen = origen;
        this.destino = destino;
        this.distancia = distancia;
        this.bloqueos= new ArrayList<>();
    }

    public double getCostoTotal(double heuristica){
        return costoReal + heuristica;
    }


    public void setCostoReal(double costoReal) {
        this.costoReal = costoReal;
    }

    public double getCostoReal() {
        return costoReal;
    }

    public void setCostoTotal(double costoTotal) {
        this.costoTotal = costoTotal;
    }

    public void agregarBloqueo(Bloqueo bloqueo) {
        bloqueos.add(bloqueo);
    }

    public void eliminarBloqueo(Bloqueo bloqueo) {
        bloqueos.remove(bloqueo);
    }

    public List<Bloqueo> getBloqueos() {
        return bloqueos;
    }

    public void setBloqueos(List<Bloqueo> bloqueos) {
        this.bloqueos = bloqueos;
    }

    public double getDistancia() {
        double lat1 = this.origen.getLatitud();
        double lat2 = this.destino.getLatitud();
        double lon1 = this.origen.getLongitud();
        double lon2 = this.destino.getLongitud();

        distancia = CalculaDistancia.calcular(lat1, lon1, lat2, lon2);

        return distancia;
    }

    public void setDistancia(int distancia) {
        this.distancia = distancia;
    }

    public Oficina getOrigen() {
        return origen;
    }

    public void setOrigen(Oficina origen) {
        this.origen = origen;
    }

    public Oficina getDestino() {
        return destino;
    }

    public boolean getEsFinal(){
        return this.esFinal;
    }

    public void setEsFinal(boolean esFinal){
        this.esFinal = esFinal;
    }

    public boolean getEstaBloqueado() {
        return estaBloqueado;
    }

    public void setEstaBloqueado(boolean estaBloqueado){
        this.estaBloqueado = estaBloqueado;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true; // Check if both are the same object
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false; // Check if obj is null or a different class
        }
        Tramo other = (Tramo) obj;
        var thisCode = origen.getCodigo() + destino.getCodigo();
        var otherCode = other.origen.getCodigo() + other.destino.getCodigo();
        return Objects.equals(thisCode, otherCode);
    }

    @Override
    public int hashCode() {
        if (origen == null || destino == null) {
            return 0;
        }
        var codigo = origen.getCodigo() + destino.getCodigo();
        return codigo.hashCode();
    }

    @Override
    public String toString() {
        return "Tramo{" + "origen=" + origen.getCodigo() + ", destino=" + destino.getCodigo() + '}';
    }
}