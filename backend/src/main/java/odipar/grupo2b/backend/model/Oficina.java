package odipar.grupo2b.backend.model;

import java.util.Objects;

// Una oficina representa un nodo en nuestro grafo. Cada una tiene un ID unico y atributos extra y una
// lista de vecinos que son otras instancias de Oficina
public class Oficina {
    private String codigo;
    private String departamento;
    private String provincia;
    private double latitud;
    private double longitud;
    private String region;
    private int capacidad;

    public Oficina(String codigo) {
        this.codigo = codigo;
    }

    public Oficina(String codigo, String departamento, String provincia, double latitud, double longitud, String region, int capacidad) {
        this.codigo = codigo;
        this.departamento = departamento;
        this.provincia = provincia;
        this.latitud = latitud;
        this.longitud = longitud;
        this.region = region;
        this.capacidad = capacidad;
    }

    // Getters y Setters
    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getProvincia() {
        return provincia;
    }

    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }

    public double getLatitud() {
        return latitud;
    }

    public void setLatitud(double latitud) {
        this.latitud = latitud;
    }

    public double getLongitud() {
        return longitud;
    }

    public void setLongitud(double longitud) {
        this.longitud = longitud;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public int getAlmacen() {
        return capacidad;
    }

    public void setAlmacen(int almacen) {
        this.capacidad = almacen;
    }

    @Override
    public String toString() {
        return "Oficina{" +
                "ubigeo='" + codigo + '\'' +
                ", departamento='" + departamento + '\'' +
                ", provincia='" + provincia + '\'' +
                ", latitud=" + latitud +
                ", longitud=" + longitud +
                ", regionNatural='" + region + '\'' +
                ", almacen='" + capacidad + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object obj){
        if (this == obj) {
            return true; // Check if both are the same object
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false; // Check if obj is null or a different class
        }
        Oficina other = (Oficina) obj;
        return Objects.equals(codigo, other.codigo);
    }

    @Override
    public int hashCode() {
        if (codigo == null) {
            return 0;
        }
        return codigo.hashCode();
    }
}