package odipar.grupo2b.backend.repository;

import org.springframework.data.repository.ListCrudRepository;

import odipar.grupo2b.backend.dto.Bloqueo;
import odipar.grupo2b.backend.dto.BloqueoId;

public interface BloqueoRepository extends ListCrudRepository<Bloqueo,BloqueoId>{    

} 