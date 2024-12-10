package odipar.grupo2b.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import odipar.grupo2b.backend.dto.Venta;

public interface VentaRepository extends ListCrudRepository<Venta,UUID>  {
    @Modifying
    @Transactional
    @Query("UPDATE Venta v SET v.cantidad = :cantidad WHERE v.id = :id")
    int updateCantidadById(@Param("cantidad") Integer cantidad, @Param("id") UUID id);
}
