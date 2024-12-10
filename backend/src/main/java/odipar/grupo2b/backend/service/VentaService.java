package odipar.grupo2b.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import odipar.grupo2b.backend.dto.Venta;
import odipar.grupo2b.backend.dto.VentaRequest;
import odipar.grupo2b.backend.repository.VentaRepository;

@Service
public class VentaService {
    private final VentaRepository ventaRepository;

    public VentaService(VentaRepository ventaRepository){
        this.ventaRepository = ventaRepository;
    }

    public UUID crear(VentaRequest ventaRequest){
        var venta = new Venta(ventaRequest);
        venta = ventaRepository.save(venta);
        return venta != null ? venta.getId() : new UUID(0L, 0L);
    }

    public List<odipar.grupo2b.backend.model.Venta> listar(){
        return ventaRepository.findAll()
                                .stream()
                                .map(Venta::toModel)
                                .toList();
    }

    public void actualizarCantidades(Integer cantidad, UUID id){
        ventaRepository.updateCantidadById(cantidad, id);
    }
}
