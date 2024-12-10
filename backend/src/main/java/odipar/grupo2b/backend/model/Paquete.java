package odipar.grupo2b.backend.model;

// Para saber que parte de la venta se va a enviar en un camión
public class Paquete {
    private final Venta venta;
    private final int cantidad;

    public Paquete(Venta venta, int cantidad) {
        this.venta = venta;
        this.cantidad = cantidad;
    }

    public Venta getVenta() {
        return venta;
    }

    public int getCantidad() {
        return cantidad;
    }

    @Override
    public String toString() {
        return "Paquete{" +
                "venta=" + venta +
                ", cantidad=" + cantidad +
                '}';
    }
}
