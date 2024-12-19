package odipar.grupo2b.backend.repository;

import org.springframework.data.repository.ListCrudRepository;

import odipar.grupo2b.backend.dto.Tramo;
import odipar.grupo2b.backend.dto.TramoId;

public interface TramoRepository extends ListCrudRepository<Tramo,TramoId>{

}
