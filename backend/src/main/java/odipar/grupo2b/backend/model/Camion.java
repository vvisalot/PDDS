package odipar.grupo2b.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Camion {
    private String codigo;
    private char tipo;
    private int capacidad;
    private int cargaActual;
    private List<Paquete> paquetes;
    private Oficina posicionFinal;
    private LocalDateTime fechaDeLlegadaPosicionFinal;
    private boolean enRuta = false;
    private List<LocalDateTime> mantenimientosProgrmados;
    private LocalDateTime fechaUltimoMantenimiento;
    private boolean enMantenimiento = false;
    private Oficina almacenCarga;
    private LocalDateTime regresoAlmacen;

    public Camion(String codigo){
        this.codigo = codigo;
    }

    public Camion(String codigo, char tipo, Oficina almacenCarga) {
        this.codigo = codigo;
        this.tipo = tipo;
        this.paquetes = new ArrayList<>();

        switch (tipo) {
            case 'A':
                this.capacidad = 90;
                break;
            case 'B':
                this.capacidad = 45;
                break;
            case 'C':
                this.capacidad = 30;
                break;
        }
        this.cargaActual = 0;
        this.posicionFinal = almacenCarga;
        this.almacenCarga = almacenCarga;
        this.mantenimientosProgrmados = new ArrayList<>();
    }

    public static List<Camion> inicializarCamiones(Oficina lima, Oficina trujillo, Oficina arequipa, Map<Camion,List<LocalDateTime>> mapaMantenimientos) {
        List<Camion> camiones = new ArrayList<>();

        //Tipo A
        for (int i = 0; i < 4; i++)
            camiones.add(new Camion(String.format("A%03d", i + 1), 'A', lima));
        camiones.add(new Camion("A005", 'A', trujillo));
        camiones.add(new Camion("A006", 'A', arequipa));

        //Tipo B
        for (int i = 0; i < 7; i++)
            camiones.add(new Camion(String.format("B%03d", i + 1), 'B', lima));
        for (int i = 7; i < 10; i++)
            camiones.add(new Camion(String.format("B%03d", i + 1), 'B', trujillo));
        for (int i = 10; i < 15; i++)
            camiones.add(new Camion(String.format("B%03d", i + 1), 'B', arequipa));

        //Tipo C
        for (int i = 0; i < 10; i++)
            camiones.add(new Camion(String.format("C%03d", i + 1), 'C', lima));
        for (int i = 10; i < 16; i++)
            camiones.add(new Camion(String.format("C%03d", i + 1), 'C', trujillo));
        for (int i = 16; i < 24; i++)
            camiones.add(new Camion(String.format("C%03d", i + 1), 'C', arequipa));

        int cap = 0;
        for (Camion c : camiones) {
            if(mapaMantenimientos.containsKey(c)){
                c.setMantenimientosProgrmados(mapaMantenimientos.get(c));
            }
            cap += c.getCapacidad();
        }
//        System.out.println("Capacidad total: " + cap + "\n");
        return camiones;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public char getTipo() {
        return tipo;
    }

    public void setTipo(char tipo) {
        this.tipo = tipo;
    }

    public int getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(int capacidad) {
        this.capacidad = capacidad;
    }

    public int getCargaActual() {
        return cargaActual;
    }

    public void setCargaActual(int cargaActual) {
        this.cargaActual = cargaActual;
    }

    public List<Paquete> getPaquetes() {
        return paquetes;
    }

    public void setPaquetes(List<Paquete> paquetes) {
        this.paquetes = paquetes;
    }

    public Oficina getPosicionFinal() {
        return posicionFinal;
    }
    //Imprimir ventas
    public void imprimirPaquetes() {
        for (Paquete p : paquetes) {
            System.out.println(p);
        }
    }

    public void setPosicionFinal(Oficina posicionFinal) {
        this.posicionFinal = posicionFinal;
    }

    public List<LocalDateTime> getMantenimientosProgrmados() {
        return mantenimientosProgrmados;
    }

    public void setMantenimientosProgrmados(List<LocalDateTime> mantenimientosProgrmados) {
        this.mantenimientosProgrmados = mantenimientosProgrmados;
    }

    public LocalDateTime getFechaUltimoMantenimiento() {
        return fechaUltimoMantenimiento;
    }

    public void setFechaUltimoMantenimiento(LocalDateTime fechaUltimoMantenimiento) {
        this.fechaUltimoMantenimiento = fechaUltimoMantenimiento;
    }

    public void agregarPaquete(Paquete paquete) {
        this.paquetes.add(paquete);
    }

    @Override
    public String toString() {
        return "El camion de código " + codigo +
                " y tipo " + tipo +
                " de capacidad " + capacidad +
                " se encuentra llevando " + cargaActual + " de carga" +
                " y tiene " + paquetes.size() + " paquete(s) asignados.";
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Camion) {
            Camion c = (Camion) obj;
            return this.codigo.equals(c.codigo);
        }
        return false;
    }

    @Override
    public int hashCode() {
        return this.codigo.hashCode();
    }

    public LocalDateTime getFechaDeLlegadaPosicionFinal(){
        return this.fechaDeLlegadaPosicionFinal;
    }

    public void setFechaDeLlegadaPosicionFinal(LocalDateTime fechaDeLlegadaPosicionFinal){
        this.fechaDeLlegadaPosicionFinal = fechaDeLlegadaPosicionFinal;
    }

    public boolean getEnRuta(){
        return this.enRuta;
    };

    public void setEnRuta(boolean enRuta){
        this.enRuta = enRuta;
    };

    public boolean getEnMantenimiento() {
        return  this.enMantenimiento;
    }

    public void setEnMantenimiento(boolean enMantenimiento) {
        this.enMantenimiento = enMantenimiento;
    }

    public Oficina getAlmacenCarga(){
        return this.almacenCarga;
    }

    public void setAlmacenCarga(Oficina almacenCarga) {
        this.almacenCarga = almacenCarga;
    }

    public LocalDateTime getRegresoAlmacen(){
        return  this.regresoAlmacen;
    }

    public void setRegresoAlmacen(LocalDateTime regresoAlmacen) {
        this.regresoAlmacen = regresoAlmacen;
    }

}
