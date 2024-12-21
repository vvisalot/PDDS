package odipar.grupo2b.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import odipar.grupo2b.backend.dto.Oficina;
import odipar.grupo2b.backend.service.SimulacionDataService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/oficinas")
public class OficinaController {
    private final SimulacionDataService simulacionDataService;

    public OficinaController(SimulacionDataService simulacionDataService) {
        this.simulacionDataService = simulacionDataService;
    }

    // @PostMapping
    // public ResponseEntity<String> crear(@RequestBody Oficina oficina) {
    //     var mapaOficinasExtra = simulacionDataService.getMapaOficinasExtra();
    //     var newOficina = requestToModel(oficina);
    //     mapaOficinasExtra.put(newOficina.getCodigo(),newOficina);
    //     return new ResponseEntity<String>(newOficina.getCodigo(),HttpStatus.OK);
    // }

    // @PostMapping("/masivo")
    // public ResponseEntity<Integer> crearMasivo(@RequestBody List<Oficina> oficinaList) {
    //     var contador = 0;
    //     var mapaOficinasExtra = simulacionDataService.getMapaOficinasExtra();
    //     for(Oficina oficina: oficinaList){
    //         var newOficina = requestToModel(oficina);
    //         mapaOficinasExtra.put(newOficina.getCodigo(),newOficina);
    //         contador++;
    //     }
    //     return new ResponseEntity<Integer>(contador,HttpStatus.OK);
    // }

    private odipar.grupo2b.backend.model.Oficina requestToModel(Oficina oficinaRequest) {
        return new odipar.grupo2b.backend.model.Oficina(
                oficinaRequest.getCodigo(),
                oficinaRequest.getDepartamento(),
                oficinaRequest.getProvincia(),
                oficinaRequest.getLatitud(),
                oficinaRequest.getLongitud(),
                oficinaRequest.getRegion(),
                oficinaRequest.getCapacidad());
    }
}
