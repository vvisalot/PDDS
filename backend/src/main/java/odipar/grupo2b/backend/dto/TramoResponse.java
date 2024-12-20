package odipar.grupo2b.backend.dto;

import java.time.LocalDateTime;

public record TramoResponse(OficinaResponse origen,
                    String nombreOrigen,
                    OficinaResponse destino,
                    String nombreDestino,
                    double distancia,
                    double velocidad,
                    LocalDateTime tiempoSalida,
                    LocalDateTime tiempoLlegada,
                    int tiempoEspera,
                    boolean seDejaraElPaquete) {

}
