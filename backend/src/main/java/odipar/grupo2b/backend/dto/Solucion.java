package odipar.grupo2b.backend.dto;

import java.util.List;

public record Solucion(boolean colapso,
                        Camion camion,
                       List<TramoResponse> tramos,
                       Double tiempoTotal) {
}
