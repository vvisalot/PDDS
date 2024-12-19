package odipar.grupo2b.backend.dto;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class TramoId implements Serializable {

    private String oficina1;
    private String oficina2;

    public TramoId() {}

    public TramoId(String oficina1, String oficina2) {
        this.oficina1 = oficina1;
        this.oficina2 = oficina2;
    }

    public String getoficina1() {
        return oficina1;
    }

    public void setoficina1(String oficina1) {
        this.oficina1 = oficina1;
    }

    public String getoficina2() {
        return oficina2;
    }

    public void setoficina2(String oficina2) {
        this.oficina2 = oficina2;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TramoId tramo = (TramoId) o;
        return Objects.equals(oficina1, tramo.oficina1) && Objects.equals(oficina2, tramo.oficina2);
    }

    @Override
    public int hashCode() {
        return Objects.hash(oficina1, oficina2);
    }
}
