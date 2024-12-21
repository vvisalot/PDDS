package odipar.grupo2b.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import odipar.grupo2b.backend.dto.Venta;
import odipar.grupo2b.backend.dto.VentaRequest;
import odipar.grupo2b.backend.repository.VentaRepository;

@Service
public class VentaService {
    private final SimulacionDataService simulacionDataService;
    private final VentaRepository ventaRepository;
    private final Sort sort = Sort.by(Sort.Order.desc("fechaRegistro"));
    public VentaService(VentaRepository ventaRepository, SimulacionDataService simulacionDataService){
        this.ventaRepository = ventaRepository;
        this.simulacionDataService = simulacionDataService;
    }

    public UUID crear(VentaRequest ventaRequest){
        var venta = new Venta(ventaRequest);
        venta = ventaRepository.save(venta);
        return venta.getId() != null ? venta.getId() : new UUID(0L, 0L);
    }

    public Integer crearMasivo(List<VentaRequest> ventaRequest){
        var contador = 0;
        for(VentaRequest venta: ventaRequest){
            var ventaObj = new Venta(venta);
            ventaObj = ventaRepository.save(ventaObj);
            if(ventaObj.getId() != null)
                contador++;
        }
        return contador;
    }

    public List<odipar.grupo2b.backend.model.Venta> listar(LocalDateTime inicio, LocalDateTime fin){
        return ventaRepository.findByFechaHoraBetween(inicio,fin)
                                .stream()
                                .map(v -> v.toModel(simulacionDataService.getMapaOficinas().get(v.getDestino())))
                                .toList();
    }

    public List<Venta> listarDto(String idCliente, String ubigeo){
        boolean idClienteExists = true;
        boolean ubigeoExists = true;
        if(idCliente == null || idCliente.isEmpty() || idCliente.isBlank()){
            idClienteExists = false;
        }
        if(ubigeo == null || ubigeo.isEmpty() || ubigeo.isBlank()){
            ubigeoExists = false;
        }
        if(idClienteExists && ubigeoExists){
            return ventaRepository.findByIdClienteAndDestino(idCliente,ubigeo, sort);
        }else if(idClienteExists){
            return ventaRepository.findByIdCliente(idCliente, sort);
        }else if(ubigeoExists){
            return ventaRepository.findByDestino(ubigeo, sort);
        }
        return ventaRepository.findAll(sort);
    }

    public void actualizarCantidades(Integer cantidad, UUID id){
        ventaRepository.updateCantidadById(cantidad, id);
    }
}
