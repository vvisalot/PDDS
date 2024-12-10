package odipar.grupo2b.backend.model;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public class Venta implements Cloneable {
    private UUID codigo;
    private LocalDateTime fechaHora;
    private Oficina origen;
    private Oficina destino;
    private int cantidad;
    private String idCliente;


    public Venta() {
        this.codigo = UUID.randomUUID();
    }

    public Venta(Oficina destino) {
        this.codigo = UUID.randomUUID();
        this.destino = destino;
    }
    
    public UUID getCodigo() {
        return codigo;
    }

    public void setCodigo(UUID codigo) {
        this.codigo = codigo;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public String getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(String idCliente) {
        this.idCliente = idCliente;
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

    public void setDestino(Oficina destino) {
        this.destino = destino;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true; // Check if both are the same object
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false; // Check if obj is null or a different class
        }
        Venta other = (Venta) obj;
        return Objects.equals(codigo, other.codigo);
    }

    @Override
    public int hashCode() {
        if (codigo == null) {
            return 0;
        }
        return codigo.hashCode();
    }

    @Override
    public String toString() {
        return "Venta: {" +
//                "fechaHora=" + fechaHora +
                " Departamento= " + destino.getDepartamento() +
                ", Provincia= " + destino.getProvincia() +
                ", ubigeoDestino='" + destino.getCodigo() + '\'' +
                ", cantidad=" + cantidad +
//                ", idCliente='" + idCliente + '\'' +
                "Region Destino= " + destino.getRegion() +
                '}';
    }

    @Override
    public Venta clone() {
        try {
            return (Venta) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException("Error al clonar la venta", e);
        }
    }


}