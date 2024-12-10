package odipar.grupo2b.backend.dto;

import java.time.LocalDateTime;

public record VentaRequest(
    LocalDateTime fechaHora, 
    String destino, 
    Integer cantidad, 
    String idCliente) {
} 
