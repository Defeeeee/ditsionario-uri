"use client"; // Directiva para marcarlo como Componente de Cliente

import React, { useState, useEffect } from 'react';

// Iconos (se pueden reemplazar con Lucide u otros)
const SearchIcon = () => <>🔍</>; // Icono de búsqueda
const BookOpenIcon = () => <>📖</>; // Icono de libro
const XIcon = () => <>✕</>; // Icono para cerrar (modal)
const PlusCircleIcon = () => <>➕</>; // Icono para proponer palabra
const LockIcon = () => <>🔒</>; // Icono de candado para login

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
  { id: 11, term: "etsempto", definition: "Cuando Uri intenta decir 'exento' pero su lengua tiene otros planes." },
  { id: 12, term: "etsilio", definition: "La versión de Uri para 'exilio', cuando alguien es desterrado de su presencia." },
  { id: 13, term: "tsionismo", definition: "La peculiar forma en que Uri se refiere al 'sionismo', movimiento que probablemente explica con la misma claridad." },
  { id: 14, term: "etsetera", definition: "Lo que Uri dice cuando quiere terminar una lista pero no sabe cómo pronunciar 'etcétera'." },
  { id: 15, term: "etsremismo", definition: "Cuando Uri habla de 'extremismo' pero lo hace de forma extremadamente incorrecta." },
  { id: 16, term: "tsi", definition: "La versión minimalista de Uri para decir 'sí', ahorrando energía para sus explicaciones confusas." },
  { id: 17, term: "etsalumno", definition: "Lo que Uri llama a un 'ex-alumno' que ha sobrevivido a sus clases y ahora vive para contarlo." },
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
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para el login
  const [isAdmin, setIsAdmin] = useState(false); // Estado para el admin
  const [password, setPassword] = useState(''); // Estado para la contraseña
  const [loginError, setLoginError] = useState(''); // Estado para errores de login
  const [pendingSuggestions, setPendingSuggestions] = useState([]); // Estado para sugerencias pendientes
  const [approvedSuggestions, setApprovedSuggestions] = useState([]); // Estado para sugerencias aprobadas

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

  // Función para aprobar una sugerencia
  const handleApproveSuggestion = async (suggestionId) => {
    try {
      // Encontrar la sugerencia en las pendientes
      const suggestionToApprove = pendingSuggestions.find(suggestion => suggestion.id === suggestionId);
      if (!suggestionToApprove) return;

      // Enviar a la API
      const response = await fetch('/api/suggestions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: suggestionId,
          action: 'approve'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Crear una nueva entrada para el diccionario
        const newDictionaryEntry = {
          id: suggestionToApprove.id,
          term: suggestionToApprove.term,
          definition: suggestionToApprove.definition
        };

        // Añadir a las sugerencias aprobadas
        const updatedApprovedSuggestions = [...approvedSuggestions, {
          ...suggestionToApprove,
          status: 'approved'
        }];
        setApprovedSuggestions(updatedApprovedSuggestions);

        // Eliminar de las sugerencias pendientes
        const updatedPendingSuggestions = pendingSuggestions.filter(suggestion => suggestion.id !== suggestionId);
        setPendingSuggestions(updatedPendingSuggestions);

        // Actualizar searchResults para incluir la nueva entrada
        setSearchResults([...dictionaryData, ...updatedApprovedSuggestions.map(s => ({
          id: s.id,
          term: s.term,
          definition: s.definition
        }))]);
      } else {
        console.error("Error al aprobar la sugerencia:", result.error);
        alert(`Error al aprobar la sugerencia: ${result.error}`);
      }
    } catch (error) {
      console.error("Error al aprobar la sugerencia:", error);
      alert("Error al aprobar la sugerencia. Por favor, inténtalo de nuevo.");
    }
  };

  // Función para rechazar una sugerencia
  const handleRejectSuggestion = async (suggestionId) => {
    try {
      // Enviar a la API
      const response = await fetch('/api/suggestions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: suggestionId,
          action: 'reject'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Eliminar de las sugerencias pendientes
        const updatedPendingSuggestions = pendingSuggestions.filter(suggestion => suggestion.id !== suggestionId);
        setPendingSuggestions(updatedPendingSuggestions);
      } else {
        console.error("Error al rechazar la sugerencia:", result.error);
        alert(`Error al rechazar la sugerencia: ${result.error}`);
      }
    } catch (error) {
      console.error("Error al rechazar la sugerencia:", error);
      alert("Error al rechazar la sugerencia. Por favor, inténtalo de nuevo.");
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (password === 'urigoat') {
      setIsLoggedIn(true);
      setIsAdmin(false);
      setLoginError('');
      // Guardar en localStorage para mantener la sesión
      localStorage.setItem('ditsionarioLoggedIn', 'true');
      localStorage.setItem('ditsionarioIsAdmin', 'false');
    } else if (password === 'uriadmin') {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setLoginError('');
      // Guardar en localStorage para mantener la sesión
      localStorage.setItem('ditsionarioLoggedIn', 'true');
      localStorage.setItem('ditsionarioIsAdmin', 'true');
    } else {
      setLoginError('Contraseña incorrecta. Inténtalo de nuevo.');
    }
  };

  // Cargar datos desde la API al iniciar
  useEffect(() => {
    // Verificar si el usuario ya estaba logueado
    const isUserLoggedIn = localStorage.getItem('ditsionarioLoggedIn') === 'true';
    if (isUserLoggedIn) {
      setIsLoggedIn(true);

      // Verificar si es admin
      const isUserAdmin = localStorage.getItem('ditsionarioIsAdmin') === 'true';
      setIsAdmin(isUserAdmin);
    }

    // Inicializar la base de datos y cargar sugerencias
    const initializeAndFetchData = async () => {
      try {
        // Inicializar la base de datos
        await fetch('/api/init-db');

        // Cargar sugerencias desde la API
        const response = await fetch('/api/suggestions?type=all');
        const result = await response.json();

        if (result.success) {
          // Establecer sugerencias pendientes
          if (result.data.pending) {
            setPendingSuggestions(result.data.pending);
          }

          // Establecer sugerencias aprobadas
          if (result.data.approved) {
            setApprovedSuggestions(result.data.approved);

            // Añadir sugerencias aprobadas a los resultados de búsqueda
            const approvedEntries = result.data.approved.map(suggestion => ({
              id: suggestion.id,
              term: suggestion.term,
              definition: suggestion.definition
            }));

            // Combinar con el diccionario original
            setSearchResults([...dictionaryData, ...approvedEntries]);
          }
        } else {
          console.error('Error al cargar sugerencias:', result.error);
        }
      } catch (error) {
        console.error('Error al inicializar o conectar con la API:', error);
      }
    };

    initializeAndFetchData();
  }, []);

  const handleSubmitProposal = async (event) => {
    event.preventDefault();
    if (newWord.trim() === '' || newDefinition.trim() === '') {
      setFeedbackMessage('Por favor, completa ambos campos.');
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage('Enviando propuesta...');

    try {
      // Crear nueva sugerencia
      const newSuggestion = {
        id: Date.now().toString(), // Usar timestamp como ID único
        term: newWord,
        definition: newDefinition,
        date: new Date().toISOString(),
        status: 'pending'
      };

      // Enviar a la API
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSuggestion),
      });

      const result = await response.json();

      if (result.success) {
        // Añadir a las sugerencias pendientes en el estado local
        setPendingSuggestions([...pendingSuggestions, newSuggestion]);

        // Mostrar mensaje de éxito
        setFeedbackMessage(`¡Gracias por proponer "${newWord}"! Tu sugerencia será revisada por un administrador.`);
        setNewWord('');
        setNewDefinition('');
      } else {
        console.error("Error al guardar la propuesta:", result.error);
        setFeedbackMessage(`Error al guardar la propuesta: ${result.error}`);
      }

      // Opcional: También enviar a Google Script si se desea mantener esa funcionalidad
      // Comentado para usar solo la base de datos CSV
      /*
      const payload = {
        palabraPropuesta: newWord,
        definicionPropuesta: newDefinition,
      };

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
      });
      */
    } catch (error) {
      console.error("Error al guardar la propuesta:", error);
      setFeedbackMessage('Error al guardar la propuesta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Renderizado condicional basado en el estado de login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 font-sans flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="bg-slate-800/70 p-8 rounded-xl shadow-xl border border-slate-700 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <span className="text-4xl mr-3"><LockIcon /></span>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
              Atseso Restringido
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-slate-500 text-gray-100"
                placeholder="Ingresa la contraseña"
                autoFocus
              />
            </div>

            {loginError && (
              <p className="text-red-400 text-sm">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full px-5 py-3 text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-colors"
            >
              Atseder
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            <div className="flex justify-between items-center">
              <p className="text-lg text-slate-400">V1.0.6 {isAdmin && <span className="ml-2 text-green-400">(Admin)</span>}</p>
              <button 
                onClick={() => {
                  localStorage.removeItem('ditsionarioLoggedIn');
                  localStorage.removeItem('ditsionarioIsAdmin');
                  setIsLoggedIn(false);
                  setIsAdmin(false);
                }}
                className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </header>

          {/* Panel de Administración */}
          {isAdmin && (
            <div className="w-full max-w-4xl mb-8 bg-slate-800/70 p-5 rounded-xl border border-slate-700">
              <h2 className="text-2xl font-bold text-sky-400 mb-4">Panel de Administración</h2>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-3">Sugerencias Pendientes</h3>

                {pendingSuggestions.length === 0 ? (
                  <p className="text-slate-400">No hay sugerencias pendientes de aprobación.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                        <h4 className="text-lg font-medium text-sky-300">{suggestion.term}</h4>
                        <p className="text-slate-300 mb-3">{suggestion.definition}</p>
                        <p className="text-xs text-slate-400 mb-3">Propuesto el: {new Date(suggestion.date).toLocaleString()}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveSuggestion(suggestion.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleRejectSuggestion(suggestion.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-200 mb-3">Sugerencias Aprobadas</h3>

                {approvedSuggestions.length === 0 ? (
                  <p className="text-slate-400">No hay sugerencias aprobadas.</p>
                ) : (
                  <div className="space-y-2">
                    {approvedSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                        <h4 className="text-md font-medium text-sky-300">{suggestion.term}</h4>
                        <p className="text-sm text-slate-300">{suggestion.definition}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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
