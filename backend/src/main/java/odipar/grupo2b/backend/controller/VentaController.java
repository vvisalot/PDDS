package odipar.grupo2b.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import odipar.grupo2b.backend.dto.Venta;
import odipar.grupo2b.backend.dto.VentaRequest;
import odipar.grupo2b.backend.service.VentaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@CrossOrigin(origins = "*")
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

    @PostMapping("/masivo")
    public ResponseEntity<Integer> crear(@RequestBody List<VentaRequest> ventaRequest) {
        return ResponseEntity.ok(ventaService.crearMasivo(ventaRequest));
    }

    @GetMapping
    public ResponseEntity<List<Venta>> listar(@RequestParam(required = false) String idCliente, @RequestParam(required = false) String ubigeo) {
        return ResponseEntity.ok(ventaService.listarDto(idCliente, ubigeo));
    }
}
