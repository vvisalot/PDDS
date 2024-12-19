package odipar.grupo2b.backend.dto;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "Tramos", uniqueConstraints = @UniqueConstraint(columnNames = {"oficina1", "oficina2"}))
public class Tramo {
    @EmbeddedId
    private TramoId id;

    public Tramo() {}

    public Tramo(TramoId id) {
        this.id = id;
    }

    public TramoId getId() {
        return id;
    }

    public void setId(TramoId id) {
        this.id = id;
    }
}
