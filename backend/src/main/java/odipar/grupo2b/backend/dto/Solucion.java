package odipar.grupo2b.backend.dto;

import java.util.List;

public record Solucion(boolean colapso,
                        Camion camion,
                       List<Tramo> tramos,
                       Double tiempoTotal) {
}
