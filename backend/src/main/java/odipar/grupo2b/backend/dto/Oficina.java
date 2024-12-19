package odipar.grupo2b.backend.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Oficinas")
public class Oficina {
        @Id
        @Column(unique = true)
        private String codigo;
        @Column(nullable = false)
        private String departamento;
        @Column(nullable = false)
        private String provincia;
        @Column(nullable = false)
        private double latitud;
        @Column(nullable = false)
        private double longitud;
        @Column(nullable = false)
        private String region;
        private int capacidad = 0;

        public Oficina() {
        }

        public Oficina(String codigo, String departamento, String provincia, double latitud, double longitud,
                        String region, int capacidad) {
                this.codigo = codigo;
                this.departamento = departamento;
                this.provincia = provincia;
                this.latitud = latitud;
                this.longitud = longitud;
                this.region = region;
                this.capacidad = capacidad;
        }

        public String getCodigo() {
                return codigo;
        }

        public void setCodigo(String codigo) {
                this.codigo = codigo;
        }

        public String getDepartamento() {
                return departamento;
        }

        public void setDepartamento(String departamento) {
                this.departamento = departamento;
        }

        public String getProvincia() {
                return provincia;
        }

        public void setProvincia(String provincia) {
                this.provincia = provincia;
        }

        public double getLatitud() {
                return latitud;
        }

        public void setLatitud(double latitud) {
                this.latitud = latitud;
        }

        public double getLongitud() {
                return longitud;
        }

        public void setLongitud(double longitud) {
                this.longitud = longitud;
        }

        public String getRegion() {
                return region;
        }

        public void setRegion(String region) {
                this.region = region;
        }

        public int getCapacidad() {
                return capacidad;
        }

        public void setCapacidad(int capacidad) {
                this.capacidad = capacidad;
        }
}
