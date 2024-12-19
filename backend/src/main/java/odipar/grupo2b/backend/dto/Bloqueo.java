package odipar.grupo2b.backend.dto;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "Bloqueos", uniqueConstraints = @UniqueConstraint(columnNames = { "oficina1", "oficina2" }))
public class Bloqueo {
    @EmbeddedId
    private BloqueoId id;
    @Column(nullable = false)
    private LocalDateTime inicio;
    @Column(nullable = false)
    private LocalDateTime fin;

    public Bloqueo() {
    }

    public Bloqueo(BloqueoId id, LocalDateTime inicio, LocalDateTime fin) {
        this.id = id;
        this.inicio = inicio;
        this.fin = fin;
    }

    public BloqueoId getId() {
        return id;
    }

    public void setId(BloqueoId id) {
        this.id = id;
    }

    public LocalDateTime getInicio() {
        return inicio;
    }

    public void setInicio(LocalDateTime inicio) {
        this.inicio = inicio;
    }

    public LocalDateTime getFin() {
        return fin;
    }

    public void setFin(LocalDateTime fin) {
        this.fin = fin;
    }
}
