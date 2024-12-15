package odipar.grupo2b.backend.dto;

import java.time.LocalDateTime;

public record Bloqueo(
        Oficina origen,
        String nombreOrigen,
        Oficina destino,
        String nombreDestino,
        LocalDateTime inicio,
        LocalDateTime fin) {
}
