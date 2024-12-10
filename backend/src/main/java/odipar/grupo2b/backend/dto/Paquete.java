package odipar.grupo2b.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record Paquete(UUID codigo,
        LocalDateTime fechaHoraPedido,
        Oficina destino,
        int cantidadEntregada,
        int cantidadTotal,
        String idCliente) {
}
