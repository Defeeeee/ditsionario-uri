"use client"; // Directiva para marcarlo como Componente de Cliente

import React, { useState } from 'react';

// Iconos (se pueden reemplazar con Lucide u otros)
const SearchIcon = () => <>🔍</>; // Icono de búsqueda
const BookOpenIcon = () => <>📖</>; // Icono de libro
const XIcon = () => <>✕</>; // Icono para cerrar (modal)
const PlusCircleIcon = () => <>➕</>; // Icono para proponer palabra

const dictionaryData = [
  { id: 1, term: "Etsamen", definition: "Derivado de la palabra 'examen', utilizado por Uri para meter miedo." },
  { id: 2, term: "Etsel", definition: "Deformación de 'Excel', programa que Uri domina." },
  { id: 3, term: "Etsenso", definition: "Intento fallido de decir 'extenso'." },
  { id: 4, term: "Atsiones", definition: "Cuando Uri intenta hablar de 'acciones' y le sale esto." },
  { id: 5, term: "Prótsimo", definition: "La forma en la que Uri te dice que algo es 'próximo', pero con su toque especial." },
  { id: 6, term: "Etsplicar", definition: "El arte de Uri de 'explicar' algo, haciéndolo más confuso." },
  { id: 7, term: "Ditsionario", definition: "La versión de Uri de un 'diccionario', probablemente con más palabras como estas." },
  { id: 8, term: "Atseso / Atseder", definition: "Cuando Uri quiere 'acceso' o 'acceder' y suelta estas joyas." },
  { id: 9, term: "Etsplanada", definition: "Si Uri te cita en la 'explanada', prepárate para cualquier cosa." },
  { id: 10, term: "Beit Hamiknash", definition: "Término hebreo para el Templo de Jerusalén, que Uri usa para sonar culto, aunque no siempre sepa qué significa." },
];

// Componente Principal de la App
export default function DictionaryApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(dictionaryData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el envío

  // !!! IMPORTANTE: REEMPLAZA ESTA URL CON LA URL DE TU SCRIPT DE GOOGLE APPS !!!
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykcHYgW_jiDFJ7rX4rTRYRGQummqyqFJJXdpWO3WiI9ZPEZYiAMTd-1XHouMxa354N/exec';


  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults(dictionaryData);
    } else {
      const filteredResults = dictionaryData.filter((entry) =>
          entry.term.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(filteredResults);
    }
  };

  const handleProposeWord = () => {
    setIsModalOpen(true);
    setFeedbackMessage(''); // Limpiar mensaje de feedback al abrir
  };

  const handleCloseModal = () => {
    if (isSubmitting) return; // Evitar cerrar si se está enviando
    setIsModalOpen(false);
    setNewWord(''); // Limpiar campos del modal al cerrar
    setNewDefinition('');
    setFeedbackMessage('');
  };

  const handleSubmitProposal = async (event) => {
    event.preventDefault();
    if (newWord.trim() === '' || newDefinition.trim() === '') {
      setFeedbackMessage('Por favor, completa ambos campos.');
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage('Enviando propuesta...');

    const payload = {
      palabraPropuesta: newWord,
      definicionPropuesta: newDefinition,
    };

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        // No es necesario 'mode: "no-cors"' aquí, ya que el script de Google Apps
        // configurado para "Cualquier usuario" y devolviendo JSON con ContentService
        // debería manejar las solicitudes correctamente y permitir leer la respuesta.
        // Si hay problemas de CORS, es probable que la implementación del script
        // (específicamente la configuración de "Quién tiene acceso") necesite revisión.
      });

      const resultText = await response.text(); // Primero obtenemos el texto de la respuesta
      let result;
      try {
        result = JSON.parse(resultText); // Intentamos parsear como JSON
      } catch (e) {
        console.error("Error al parsear la respuesta JSON del script:", e);
        console.error("Texto de la respuesta recibida:", resultText);
        setFeedbackMessage('Error: La respuesta del servidor no es un JSON válido. Revisa la consola para más detalles.');
        setIsSubmitting(false);
        return;
      }


      if (result.result === "success") {
        setFeedbackMessage(`¡Gracias por proponer "${newWord}"! ${result.message}`);
        setNewWord('');
        setNewDefinition('');
      } else {
        console.error("Error devuelto por Google Script:", result.message);
        setFeedbackMessage(`Error al enviar la propuesta: ${result.message || 'Respuesta no esperada del servidor.'}`);
      }
    } catch (error) {
      console.error("Error en la petición fetch a Google Script:", error);
      setFeedbackMessage('Error de conexión al enviar la propuesta. Revisa tu conexión, la URL del script e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
          {/* Sección del Encabezado */}
          <header className="w-full max-w-4xl mb-8 sm:mb-12 text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-4xl mr-3"><BookOpenIcon /></span>
              <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
                Ditsionario Uri
              </h1>
            </div>
            <p className="text-lg text-slate-400">V1.0.5</p>
          </header>

          {/* Sección de la Barra de Búsqueda */}
          <div className="w-full max-w-xl mb-6">
            <div className="relative">
              <input
                  type="text"
                  placeholder="Buscar término..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full p-4 pl-12 pr-4 text-lg bg-slate-700 border border-slate-600 rounded-xl shadow-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-300 ease-in-out placeholder-slate-400 text-gray-100"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <SearchIcon />
              </div>
            </div>
          </div>

          {/* Botón para Proponer Palabra */}
          <div className="w-full max-w-xl mb-8 sm:mb-10 text-center">
            <button
                onClick={handleProposeWord}
                className="inline-flex items-center justify-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
            >
              <span className="mr-2"><PlusCircleIcon /></span>
              Proponer Palabra
            </button>
          </div>


          {/* Sección de la Lista del Diccionario */}
          <main className="w-full max-w-4xl">
            {searchResults.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {searchResults.map((entry) => (
                      <div
                          key={entry.id}
                          className="bg-slate-800/70 p-5 sm:p-6 rounded-xl shadow-xl hover:shadow-sky-500/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-slate-700 hover:border-sky-600"
                      >
                        <h2 className="text-2xl sm:text-3xl font-semibold text-sky-400 mb-2">
                          {entry.term}
                        </h2>
                        <p className="text-slate-300 text-base sm:text-lg">{entry.definition}</p>
                      </div>
                  ))}
                </div>
            ) : (
                <div className="text-center py-10">
                  <p className="text-xl text-slate-400">No se encontraron términos para "{searchTerm}".</p>
                </div>
            )}
          </main>

          {/* Sección del Pie de Página */}
          <footer className="w-full max-w-4xl mt-12 sm:mt-16 pt-8 border-t border-slate-700 text-center">
            <p className="text-slate-500">
              &copy; {new Date().getFullYear()} Ditsionario Uri. Todos los derechos reservados.
            </p>
          </footer>
        </div>

        {/* Modal para Proponer Palabra */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
              <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-sky-400">Proponer Nueva Palabra</h3>
                  <button
                      onClick={handleCloseModal}
                      className="text-slate-400 hover:text-sky-400 transition-colors p-1 rounded-full disabled:opacity-50"
                      aria-label="Cerrar modal"
                      disabled={isSubmitting}
                  >
                    <XIcon />
                  </button>
                </div>
                <form onSubmit={handleSubmitProposal}>
                  <div className="mb-4">
                    <label htmlFor="newWord" className="block text-sm font-medium text-slate-300 mb-1">
                      Palabra
                    </label>
                    <input
                        type="text"
                        id="newWord"
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-slate-500 text-gray-100"
                        placeholder="Escribe la palabra mal escrita"
                        disabled={isSubmitting}
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="newDefinition" className="block text-sm font-medium text-slate-300 mb-1">
                      Definición (con humor)
                    </label>
                    <textarea
                        id="newDefinition"
                        value={newDefinition}
                        onChange={(e) => setNewDefinition(e.target.value)}
                        rows="3"
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-slate-500 text-gray-100"
                        placeholder="Escribe la definición graciosa al estilo Uri"
                        disabled={isSubmitting}
                    ></textarea>
                  </div>
                  {feedbackMessage && (
                      <p className={`mb-4 text-sm ${feedbackMessage.includes('Gracias') ? 'text-green-400' : feedbackMessage.includes('Error') || feedbackMessage.includes('completa') ? 'text-red-400' : 'text-sky-300'}`}>
                        {feedbackMessage}
                      </p>
                  )}
                  <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2.5 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Propuesta'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </>
  );
}
