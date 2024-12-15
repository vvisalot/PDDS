package odipar.grupo2b.backend.dto;

import java.util.List;

public record Resultado(
        List<Solucion> rutas,
        List<Mantenimiento> mantenimientos,
        List<Bloqueo> bloqueos) {
}
