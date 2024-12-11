package odipar.grupo2b.backend.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import odipar.grupo2b.backend.dto.VentaRequest;
import odipar.grupo2b.backend.service.VentaService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@CrossOrigin(origins = "https://1inf54-981-2b.inf.pucp.edu.pe")
@RestController
@RequestMapping("/api/ventas")
public class VentaController {
    private final VentaService ventaService;

    public VentaController (VentaService ventaService){
        this.ventaService = ventaService;
    }

    @PostMapping
    public ResponseEntity<UUID> crear(@RequestBody VentaRequest ventaRequest) {
        return ResponseEntity.ok(ventaService.crear(ventaRequest));
    }
}
