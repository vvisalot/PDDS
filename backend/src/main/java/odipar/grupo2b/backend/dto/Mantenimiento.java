package odipar.grupo2b.backend.dto;

import java.time.LocalDateTime;

public record Mantenimiento(
        String camion,
        LocalDateTime inicio,
        LocalDateTime fin) {
}
