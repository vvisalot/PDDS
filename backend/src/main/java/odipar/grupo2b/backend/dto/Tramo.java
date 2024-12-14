package odipar.grupo2b.backend.dto;

import java.time.LocalDateTime;

public record Tramo(Oficina origen,
                    String nombreOrigen,
                    Oficina destino,
                    String nombreDestino,
                    double distancia,
                    double velocidad,
                    LocalDateTime tiempoSalida,
                    LocalDateTime tiempoLlegada,
                    int tiempoEspera,
                    boolean seDejaraElPaquete) {

}
