import React, { useState } from 'react';
import { FaRegCalendarAlt } from "react-icons/fa";

const FormVenta = ({ onAddSale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const rawDate = formData.get('fechaHora');
    const destino = formData.get('destino');
    const cantidad = formData.get('cantidad');
    const idCliente = formData.get('idCliente');

    // Validate
    const errors = [];

    // Validate date
    const fechaHora = new Date(rawDate);
    if (isNaN(fechaHora.getTime())) {
      errors.push("Debe seleccionar una fecha y hora válida");
    }

    // Validate destination (6-digit number)
    if (!/^\d{6}$/.test(destino)) {
      errors.push("El destino debe ser un número de 6 dígitos");
    }

    // Validate cantidad (positive number)
    if (isNaN(cantidad) || Number(cantidad) <= 0) {
      errors.push("La cantidad debe ser mayor a 0");
    }

    // Validate client ID (positive number)
    if (isNaN(idCliente) || Number(idCliente) <= 0) {
      errors.push("El ID de cliente debe ser mayor a 0");
    }

    // If errors, show first error
    if (errors.length > 0) {
      alert(errors[0]);
      return;
    }

    // Format date consistently
    const formattedDate = `${fechaHora.getFullYear()}-${
      String(fechaHora.getMonth() + 1).padStart(2, '0')
    }-${String(fechaHora.getDate()).padStart(2, '0')} ${
      String(fechaHora.getHours()).padStart(2, '0')
    }:${String(fechaHora.getMinutes()).padStart(2, '0')}:00`;

    // Call add sale function
    onAddSale({
      fechaHora: formattedDate,
      destino: Number(destino),
      cantidad: Number(cantidad),
      idCliente: Number(idCliente)
    });

    // Close modal
    setIsOpen(false);
  };

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Agregar Venta
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Registrar Nueva Venta</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fechaHora" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  id="fechaHora"
                  name="fechaHora"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="destino" className="block text-sm font-medium text-gray-700 mb-2">
                  Destino (Código de 6 dígitos)
                </label>
                <input
                  type="number"
                  id="destino"
                  name="destino"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="Ej: 123456"
                  min="100000"
                  max="999999"
                  required
                />
              </div>

              <div>
                <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  id="cantidad"
                  name="cantidad"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="Cantidad de paquetes"
                  min="1"
                  required
                />
              </div>

              <div>
                <label htmlFor="idCliente" className="block text-sm font-medium text-gray-700 mb-2">
                  ID Cliente
                </label>
                <input
                  type="number"
                  id="idCliente"
                  name="idCliente"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="ID del cliente"
                  min="1"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormVenta;