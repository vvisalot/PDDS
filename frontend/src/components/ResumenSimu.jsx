import { useState, Button } from 'react';
import { jsPDF } from 'jspdf';

const ResumenSimu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [documentContent, setDocumentContent] = useState('');

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text(documentContent, 10, 10);
    doc.save('documento.pdf');
  };

  // const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   setDocumentContent(e.target.value);
  // };
  const handleInputChange = (e) => {
    setDocumentContent(e.target.value);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleOpenModal}
      >
        Abrir documento
      </button>

      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white w-1/2 h-1/2 rounded shadow-md p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Documento</h2>
            <textarea
              className="w-full h-3/4 p-2 border border-gray-400 rounded"
              value={documentContent}
              onChange={handleInputChange}
            />
            <div className="flex justify-end mt-4">
              <Button
                type='primary'
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                onClick={handleDownloadPdf}
              >
                Descargar PDF
              </Button>
              <Button
                type='primary'
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleCloseModal}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenSimu;