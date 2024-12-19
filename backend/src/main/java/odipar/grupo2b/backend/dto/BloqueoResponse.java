package odipar.grupo2b.backend.dto;

import java.time.LocalDateTime;

public record BloqueoResponse(
        OficinaResponse origen,
        String nombreOrigen,
        OficinaResponse destino,
        String nombreDestino,
        LocalDateTime inicio,
        LocalDateTime fin) {
}
