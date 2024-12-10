package odipar.grupo2b.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import odipar.grupo2b.backend.model.Oficina;

@Entity
@Table(name = "Ventas")
public class Venta {
    @Id    
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;
    @Column(nullable = false)
    private LocalDateTime fechaHora;
    @Column(nullable = false, length = 6)
    private String destino;
    @Column(nullable = false)
    private Integer cantidad;
    @Column(nullable = false)
    private Integer cantidadTotal;
    @Column(nullable = false, length = 6)
    private String idCliente;

    public Venta() {}

    public Venta(VentaRequest ventaRequest) {
        this.fechaHora = ventaRequest.fechaHora();
        this.destino = ventaRequest.destino();
        this.cantidad = ventaRequest.cantidad();
        this.cantidadTotal = ventaRequest.cantidad();
        this.idCliente = ventaRequest.idCliente();
    }

    public odipar.grupo2b.backend.model.Venta toModel(){
        var venta = new odipar.grupo2b.backend.model.Venta();
        venta.setCodigo(this.id);
        venta.setFechaHora(this.fechaHora);
        venta.setDestino(new Oficina(this.destino));
        venta.setCantidad(this.cantidad);
        venta.setIdCliente(this.idCliente);
        return venta;
    }

    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
    public LocalDateTime getFechaHora() {
        return fechaHora;
    }
    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }
    public String getDestino() {
        return destino;
    }
    public void setDestino(String destino) {
        this.destino = destino;
    }
    public Integer getCantidad() {
        return cantidad;
    }
    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
    public Integer getCantidadTotal() {
        return cantidadTotal;
    }
    public void setCantidadTotal(Integer cantidadTotal) {
        this.cantidadTotal = cantidadTotal;
    }
    public String getIdCliente() {
        return idCliente;
    }
    public void setIdCliente(String idCliente) {
        this.idCliente = idCliente;
    }
}
