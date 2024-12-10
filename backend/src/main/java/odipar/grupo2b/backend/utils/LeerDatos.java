package odipar.grupo2b.backend.utils;

import odipar.grupo2b.backend.algorithm.GrafoTramos;
import odipar.grupo2b.backend.model.Bloqueo;
import odipar.grupo2b.backend.model.Oficina;
import odipar.grupo2b.backend.model.Tramo;
import odipar.grupo2b.backend.model.Venta;
import odipar.grupo2b.backend.model.Camion;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.MonthDay;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.logging.Logger;

public class LeerDatos {
    private static final Logger logger = Logger.getLogger(LeerDatos.class.getName());
    private static Random random = new Random();

    // Método para leer las oficinas desde un archivo y almacenarlas en un HashMap
    public static Map<String, Oficina> leerOficinasDesdeArchivo(String fileName) {
        Map<String, Oficina> mapaOficinas = new HashMap<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(LeerDatos.class.getClassLoader().getResourceAsStream("static/" + fileName), StandardCharsets.UTF_8))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                String[] datos = linea.split(","); // Asume que los datos están separados por comas
                // Asignar los valores a los atributos correspondientes
                String codigo = datos[0];  // UBIGEO
                Oficina oficina = getOficina(datos, codigo);
                // Agregar la oficina al mapa usando el código (ubigeo) como clave
                mapaOficinas.put(codigo, oficina);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return mapaOficinas;
    }

    private static Oficina getOficina(String[] datos, String codigo) {
        String departamento = datos[1];  // DEP
        String provincia = datos[2];  // PROV
        double latitud = Double.parseDouble(datos[3]);  // LATITUD
        double longitud = Double.parseDouble(datos[4]);  // LONGITUD
        String regionNatural = datos[5];  // REGION.NATURAL
        int capacidad = Integer.parseInt(datos[6]);  // ALMACEN

        // Crear una nueva instancia de Oficina
        return new Oficina(codigo, departamento, provincia, latitud, longitud, regionNatural, capacidad);
    }

    public static Pair<List<Tramo>, Map<String, Set<Tramo>>> leerTramosDesdeArchivo(String filePath, Map<String, Oficina> mapaOficinas) {
        List<Tramo> tramos = new ArrayList<>();
        Map<String, Set<Tramo>> mapaTramos = new HashMap<>();
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                String[] datos = linea.split(" => ");  // Asumimos que están separados por comas

                // Extraemos los valores de ubigeo para origen y destino
                String ubigeoOrigen = datos[0].trim();
                String ubigeoDestino = datos[1].trim();

                // Buscamos las oficinas correspondientes en el mapa
                Oficina oficinaOrigen = mapaOficinas.get(ubigeoOrigen);
                Oficina oficinaDestino = mapaOficinas.get(ubigeoDestino);

                if (oficinaOrigen != null && oficinaDestino != null) {
                    //TODO: Revisar si es necesario agregar la distancia
                    Tramo tramo = new Tramo(oficinaOrigen, oficinaDestino, 0);
                    tramos.add(tramo);
                    if (mapaTramos.containsKey(ubigeoOrigen)) {
                        mapaTramos.get(ubigeoOrigen).add(tramo);
                    } else {
                        Set<Tramo> tramosOrigen = new HashSet<>();
                        tramosOrigen.add(tramo);
                        mapaTramos.put(ubigeoOrigen, tramosOrigen);
                    }
                } else {
                    System.err.println("Oficina no encontrada para ubigeo: " + ubigeoOrigen + " o " + ubigeoDestino);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return new Pair<>(tramos, mapaTramos);
    }

    public static Pair<List<Tramo>, Map<String, Set<Tramo>>> leerTramosDesdeArchivo(String fileName, Map<String, Oficina> mapaOficinas, Map<Tramo,List<Bloqueo>> mapaBloqueos) {
        List<Tramo> tramos = new ArrayList<>();
        Map<String, Set<Tramo>> mapaTramos = new HashMap<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(LeerDatos.class.getClassLoader().getResourceAsStream("static/" + fileName), StandardCharsets.UTF_8))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                String[] datos = linea.split(" => ");  // Asumimos que están separados por comas

                // Extraemos los valores de ubigeo para origen y destino
                String ubigeoOrigen = datos[0].trim();
                String ubigeoDestino = datos[1].trim();

                // Buscamos las oficinas correspondientes en el mapa
                Oficina oficinaOrigen = mapaOficinas.get(ubigeoOrigen);
                Oficina oficinaDestino = mapaOficinas.get(ubigeoDestino);

                if (oficinaOrigen != null && oficinaDestino != null) {
                    //TODO: Revisar si es necesario agregar la distancia
                    Tramo tramo = new Tramo(oficinaOrigen, oficinaDestino, 0);
                    if(mapaBloqueos.containsKey(tramo)){
                        tramo.setBloqueos(mapaBloqueos.get(tramo));
                    }
                    tramos.add(tramo);
                    if (mapaTramos.containsKey(ubigeoOrigen)) {
                        mapaTramos.get(ubigeoOrigen).add(tramo);
                    } else {
                        Set<Tramo> tramosOrigen = new HashSet<>();
                        tramosOrigen.add(tramo);
                        mapaTramos.put(ubigeoOrigen, tramosOrigen);
                    }
                } else {
                    System.err.println("Oficina no encontrada para ubigeo: " + ubigeoOrigen + " o " + ubigeoDestino);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return new Pair<>(tramos, mapaTramos);
    }

    public static void leerBloqueos(String archivo, GrafoTramos grafoTramos) throws IOException {
        List<String> lineas = Files.readAllLines(Paths.get(archivo));

        // Formato para "MMdd,HH:mm" (mes, día y hora)
        DateTimeFormatter formatoHora = DateTimeFormatter.ofPattern("HH:mm");
        DateTimeFormatter formatoFecha = DateTimeFormatter.ofPattern("MMdd");
        int anioActual = LocalDateTime.now().getYear(); // Usamos el año actual

        for (String linea : lineas) {
            String[] datos = linea.split(";");

            // Parsear las fechas de inicio y fin: "0101,13:32==0119,10:39"
            String[] tiempos = datos[1].split("==");
            String fechaInicioStr = tiempos[0].split(",")[0].trim(); // "0101"
            String horaInicioStr = tiempos[0].split(",")[1].trim(); // "13:32"
            String fechaFinStr = tiempos[1].split(",")[0].trim(); // "0119"
            String horaFinStr = tiempos[1].split(",")[1].trim(); // "10:39"

            // Parsear fecha y hora de inicio
            MonthDay mesDiaInicio = MonthDay.parse(fechaInicioStr, formatoFecha); // Parsear "MMdd"
            LocalTime horaInicio = LocalTime.parse(horaInicioStr, formatoHora); // Parsear "HH:mm"
            LocalDate fechaInicioCompleta = mesDiaInicio.atYear(anioActual); // Añadir el año actual
            LocalDateTime fechaHoraInicio = LocalDateTime.of(fechaInicioCompleta, horaInicio);

            // Parsear fecha y hora de fin
            MonthDay mesDiaFin = MonthDay.parse(fechaFinStr, formatoFecha); // Parsear "MMdd"
            LocalTime horaFin = LocalTime.parse(horaFinStr, formatoHora); // Parsear "HH:mm"
            LocalDate fechaFinCompleta = mesDiaFin.atYear(anioActual); // Añadir el año actual
            LocalDateTime fechaHoraFin = LocalDateTime.of(fechaFinCompleta, horaFin);

            // Crear el objeto Bloqueo y asignarlo al Tramo
            Bloqueo bloqueo = new Bloqueo(fechaHoraInicio, fechaHoraFin);
            // Parsear el tramo: "250301 => 220501"
            String[] tramos = datos[0].split("=>");
            String ubigeoOrigen = tramos[0].trim();
            String ubigeoDestino = tramos[1].trim();

            grafoTramos.agregarBloqueo(bloqueo, ubigeoOrigen, ubigeoDestino);
            grafoTramos.agregarBloqueo(bloqueo, ubigeoDestino, ubigeoOrigen);
        }
    }

    public static void leerBloqueos(String archivo,Map<Tramo,List<Bloqueo>> mapaBloqueos) {
        // Formato para "MMdd,HH:mm" (mes, día y hora)
        DateTimeFormatter formatoHora = DateTimeFormatter.ofPattern("HH:mm");
        DateTimeFormatter formatoFecha = DateTimeFormatter.ofPattern("MMdd");
        int anioActual = LocalDateTime.now().getYear(); // Usamos el año actual
        try (BufferedReader br = new BufferedReader(new InputStreamReader(LeerDatos.class.getClassLoader().getResourceAsStream("static/" + archivo), StandardCharsets.UTF_8))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                
            String[] datos = linea.split(";");

            // Parsear las fechas de inicio y fin: "0101,13:32==0119,10:39"
            String[] tiempos = datos[1].split("==");
            String fechaInicioStr = tiempos[0].split(",")[0].trim(); // "0101"
            String horaInicioStr = tiempos[0].split(",")[1].trim(); // "13:32"
            String fechaFinStr = tiempos[1].split(",")[0].trim(); // "0119"
            String horaFinStr = tiempos[1].split(",")[1].trim(); // "10:39"

            // Parsear fecha y hora de inicio
            MonthDay mesDiaInicio = MonthDay.parse(fechaInicioStr, formatoFecha); // Parsear "MMdd"
            LocalTime horaInicio = LocalTime.parse(horaInicioStr, formatoHora); // Parsear "HH:mm"
            LocalDate fechaInicioCompleta = mesDiaInicio.atYear(anioActual); // Añadir el año actual
            LocalDateTime fechaHoraInicio = LocalDateTime.of(fechaInicioCompleta, horaInicio);

            // Parsear fecha y hora de fin
            MonthDay mesDiaFin = MonthDay.parse(fechaFinStr, formatoFecha); // Parsear "MMdd"
            LocalTime horaFin = LocalTime.parse(horaFinStr, formatoHora); // Parsear "HH:mm"
            LocalDate fechaFinCompleta = mesDiaFin.atYear(anioActual); // Añadir el año actual
            LocalDateTime fechaHoraFin = LocalDateTime.of(fechaFinCompleta, horaFin);

            // Crear el objeto Bloqueo y asignarlo al Tramo
            Bloqueo bloqueo = new Bloqueo(fechaHoraInicio, fechaHoraFin);
            // Parsear el tramo: "250301 => 220501"
            String[] tramos = datos[0].split("=>");
            String ubigeoOrigen = tramos[0].trim();
            String ubigeoDestino = tramos[1].trim();
            var tramo = new Tramo(new Oficina(ubigeoOrigen),new Oficina(ubigeoDestino));
            if(!mapaBloqueos.containsKey(tramo)) {
                mapaBloqueos.put(tramo,new ArrayList<>());
            }
            mapaBloqueos.get(tramo).add(bloqueo);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static List<Venta> leerVentasDesdeArchivo(String fileName, Map<String, Oficina> mapaOficinas) {
        List<Venta> ventas = new ArrayList<>();

        String nombreArchivo = fileName.substring(fileName.lastIndexOf("/") + 1);
        nombreArchivo = nombreArchivo.replace("c.1inf54.","");
        int anio = Integer.parseInt(nombreArchivo.substring(6, 10));
        int mes = Integer.parseInt(nombreArchivo.substring(10, 12));

//        System.out.println("Año: " + anio + ", Mes: " + mes);

        try (BufferedReader br = new BufferedReader(new InputStreamReader(LeerDatos.class.getClassLoader().getResourceAsStream("static/" + fileName), StandardCharsets.UTF_8))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                String[] partes = linea.split(",\\s+");

                // Día y hora
                String[] fechaHoraPartes = partes[0].split(" ");
                int dia = Integer.parseInt(fechaHoraPartes[0]);
                String[] horaMinutos = fechaHoraPartes[1].split(":");
                int hora = Integer.parseInt(horaMinutos[0]);
                int minutos = Integer.parseInt(horaMinutos[1]);

                // Construimos el LocalDateTime usando el año, mes, día, hora y minutos
                LocalDateTime fechaHora = LocalDateTime.of(anio, mes, dia, hora, minutos);

                // Origen y destino
                String[] ubicaciones = partes[1].split("=>");
                String origen = ubicaciones[0].trim();  // Ubigeo de origen (ignorado por ahora)
                String destino = ubicaciones[1].trim(); // Ubigeo de destino

                // Cantidad
                int cantidad = Integer.parseInt(partes[2].trim());

                // ID del cliente
                int randomNumber = random.nextInt(999999) + 1;
                String formattedNumber = String.format("%06d", randomNumber);
                String idCliente = formattedNumber;

                // Buscar la oficina de destino en el mapa de oficinas
                Oficina oficinaDestino = mapaOficinas.get(destino);
                if (oficinaDestino == null) {
                    System.out.println("No se encontró la oficina con ubigeo: " + destino);
                    continue; // Si no se encuentra la oficina, saltamos esta línea
                }

                // Crear la venta
                Venta venta = new Venta();
                venta.setFechaHora(fechaHora);
                venta.setDestino(oficinaDestino); // Asignamos la oficina del destino
                venta.setCantidad(cantidad);
                venta.setIdCliente(idCliente);

                ventas.add(venta);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return ventas;
    }

    public static Queue <Venta> encolarVentasDesdeArchivo(String archivo, Map <String, Oficina> mapaOficinas){
        Queue <Venta> ventas = new LinkedList <>();
        String nombreArchivo = archivo.substring(archivo.lastIndexOf("/") + 1);
        int anio = Integer.parseInt(nombreArchivo.substring(6, 10));
        int mes = Integer.parseInt(nombreArchivo.substring(10, 12));

//        System.out.println("Año: " + anio + ", Mes: " + mes);
        try (BufferedReader br = new BufferedReader(new FileReader(archivo))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                String[] partes = linea.split(",\\s+");

                // Día y hora
                String[] fechaHoraPartes = partes[0].split(" ");
                int dia = Integer.parseInt(fechaHoraPartes[0]);
                String[] horaMinutos = fechaHoraPartes[1].split(":");
                int hora = Integer.parseInt(horaMinutos[0]);
                int minutos = Integer.parseInt(horaMinutos[1]);

                // Construimos el LocalDateTime usando el año, mes, día, hora y minutos
                LocalDateTime fechaHora = LocalDateTime.of(anio, mes, dia, hora, minutos);

                // Guardamos la hora de la primera venta leida
                // LocalDateTime horaDelBatch = RelojSimulado.getInstance().getTiempo();

                // Origen y destino
                String[] ubicaciones = partes[1].split("=>");
                String origen = ubicaciones[0].trim();  // Ubigeo de origen (ignorado por ahora)
                String destino = ubicaciones[1].trim(); // Ubigeo de destino

                // Cantidad
                int cantidad = Integer.parseInt(partes[2].trim());

                // ID del cliente
                String idCliente = partes[3].trim();

                // Buscar la oficina de destino en el mapa de oficinas
                Oficina oficinaDestino = mapaOficinas.get(destino);
                if (oficinaDestino == null) {
                    System.out.println("No se encontró la oficina con ubigeo: " + destino);
                    continue; // Si no se encuentra la oficina, saltamos esta línea
                }

                // Crear la venta
                Venta venta = new Venta();
                venta.setFechaHora(fechaHora);
                venta.setDestino(oficinaDestino); // Asignamos la oficina del destino
                venta.setCantidad(cantidad);
                venta.setIdCliente(idCliente);

                ventas.add(venta);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return ventas;
    }

    public static void leerMantenimientos(String fileName,Map<Camion,List<LocalDateTime>> mapaMantenimientos){
        // Formato para "MMdd,HH:mm" (mes, día y hora)
        DateTimeFormatter formatoFecha = DateTimeFormatter.ofPattern("yyyyMMdd");
        try (BufferedReader br = new BufferedReader(new InputStreamReader(LeerDatos.class.getClassLoader().getResourceAsStream("static/" + fileName), StandardCharsets.UTF_8))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                String[] datos = linea.split(":");
                String fecha = datos[0].trim();
                var mantenimiento = LocalDate.parse(fecha, formatoFecha).atStartOfDay();
                String codigoCamion = datos[1].trim();
                var camion = new Camion(codigoCamion);
                if(!mapaMantenimientos.containsKey(camion)) {
                    mapaMantenimientos.put(camion,new ArrayList<>());
                }
                mapaMantenimientos.get(camion).add(mantenimiento);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
