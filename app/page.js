import React, { useState } from 'react';
// import Head from 'next/head'; // Se eliminó esta línea para evitar errores de compilación en entornos sin contexto Next.js

// Iconos (se pueden reemplazar con Lucide u otros)
const SearchIcon = () => <>🔍</>; // Icono de búsqueda
const BookOpenIcon = () => <>📖</>; // Icono de libro

const dictionaryData = [
  { id: 1, term: "Etsamen", definition: "Derivado de la palabra 'examen', utilizado por Uri para meter miedo." },
  { id: 2, term: "Etsel", definition: "Deformación de 'Excel', programa que Uri domina." },
  { id: 3, term: "Etsenso", definition: "Intento fallido de decir 'extenso', típico de Uri." },
  { id: 4, term: "Atsiones", definition: "Cuando Uri intenta hablar de 'acciones' y le sale esto." },
  { id: 5, term: "Prótsimo", definition: "La forma en la que Uri te dice que algo es 'próximo', pero con su toque especial." },
  { id: 6, term: "Etsplicar", definition: "El arte de Uri de 'explicar' algo, haciéndolo más confuso." },
  { id: 7, term: "Ditsionario", definition: "La versión de Uri de un 'diccionario', probablemente con más palabras como estas." },
  { id: 8, term: "Atseso / Atseder", definition: "Cuando Uri quiere 'acceso' o 'acceder'." },
  { id: 9, term: "Etsplanada", definition: "Si Uri te cita en la 'explanada', prepárate para cualquier cosa." },
  { id: 10, term: "Beit Hamiknash", definition: "Término hebreo para el Templo de Jerusalén, que Uri usa para sonar culto." },
];

// Componente Principal de la App
export default function DictionaryApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(dictionaryData);

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

  return (
      <>
        {/*
      <Head>
        <title>Diccionario Uri V1.0.5</title>
        <meta name="description" content="Diccionario Uri V1.0.5 - Interfaz Moderna" />
        <link rel="icon" href="/favicon.ico" /> {}// Asegúrate de tener un favicon.ico en tu carpeta public
      </Head>
      Se eliminó el componente Head para evitar problemas de compilación en entornos que no son Next.js
      */}

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
          <div className="w-full max-w-xl mb-8 sm:mb-10">
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
      </>
  );
}
