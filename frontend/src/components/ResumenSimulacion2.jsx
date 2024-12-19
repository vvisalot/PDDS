//prueba para ver si se guardan datos en el ultimo minuto antes
//de que termine la simulacion
import React, { useEffect } from "react";

const ResumenSimulacion2 = ({ resumenDatos, simulacionFinalizada }) => {
    // Este efecto se ejecutará cuando la simulación esté a punto de finalizar.
    useEffect(() => {
        if (simulacionFinalizada) {
          console.log("Resumen Final FINAL de la Simulación:", resumenDatos);
    
          // Opcional: Guardar los datos finales
          guardarDatosFinales(resumenDatos);
        }
    }, [simulacionFinalizada]);

    // Función para guardar los datos finales (ejemplo, puedes usar un API o localStorage)
    const guardarDatosFinales = (resumen) => {
        console.log("Guardando datos finales...", resumen);
        // Aquí podrías usar localStorage, una API, etc.
        // localStorage.setItem("resumenSimulacion", JSON.stringify(resumen));
    };

    return (
        <div>
        {simulacionFinalizada ? (
            <div>
            <h2>Resumen Final de la Simulación</h2>
            <p><strong>Camiones Usados:</strong> {resumenDatos.camionesUsados}</p>
            <p><strong>Pedidos Entregados:</strong> {resumenDatos.pedidosEntregados}</p>
            <p><strong>Rango Fecha Simulada:</strong> {resumenDatos.rangoFechaSimulada}</p>
            <p><strong>Tiempo Real Transcurrido:</strong> {resumenDatos.tiempoRealTranscurrido} segundos</p>
            <p><strong>Tiempo Simulado:</strong> {resumenDatos.tiempoSimulado} horas</p>
            </div>
        ) : (
            <p>Simulación en progreso...</p>
        )}
        </div>
    );
};

export default ResumenSimulacion2;
