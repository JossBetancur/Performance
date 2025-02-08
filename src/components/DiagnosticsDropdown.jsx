import React, { useState } from "react";

const DiagnosticsDropdown = ({ title, diagnostics }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [filter, setFilter] = useState("all");

  const filteredDiagnostics = diagnostics.filter((diagnostic) => {
    if (filter === "mobile") return diagnostic.tipo === "móvil";
    if (filter === "desktop") return diagnostic.tipo === "escritorio";
    return true;
  });

  const toggleOpen = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const convertTextToLinks = (text) => {
    text = text.replace(/[\(\)]/g, '');

    return text.split(urlRegex).map((part, idx) => 
      urlRegex.test(part) ? (
        <a 
          key={idx} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  return (
    <div className="mt-4 p-2 shadow">
      <button
        onClick={toggleDropdown}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none flex items-center justify-between"
        aria-expanded={isOpen ? "true" : "false"}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 ml-2 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2">
          {filteredDiagnostics.length > 0 ? (
            <ul className="list-disc list-inside">
              {filteredDiagnostics.map((diagnostic, index) => (
                <div
                  key={index}
                  className="mb-4 p-2 border rounded flex flex-col"
                >
                  <h3
                    className="font-bold text-xl cursor-pointer"
                    onClick={() => toggleOpen(index)}
                    aria-expanded={openIndex === index ? "true" : "false"}
                    aria-controls={`diagnostic-details-${index}`}
                  >
                    {diagnostic.titulo}
                  </h3>

                  {openIndex === index && (
                    <div className="mt-2">
                      <p className="text-sm break-words overflow-hidden">{convertTextToLinks(diagnostic.descripcion)}</p>                  
                      {diagnostic.detalles && Object.keys(diagnostic.detalles).length > 0 ? (
                        <div className="mt-4">
                          {Object.entries(diagnostic.detalles).map(([key, value], idx) => (
                            <div key={idx} className="mb-2">
                              
                              {typeof value === "object" ? (
                                <div className="overflow-x-auto mt-2">
                                  <table className="min-w-full bg-white border border-gray-200 table-auto">
                                    <thead>
                                      <tr>
                                        <th className="py-2 px-4 border-b text-neutral-800">Propiedad</th>
                                        <th className="py-2 px-4 border-b text-neutral-800">Valor</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Object.entries(value).map(([subKey, subValue], subIdx) => (
                                        <tr key={subIdx}>
                                          <td className="py-2 px-4 border-b text-neutral-800">{subKey}</td>
                                          <td className="py-2 px-4 border-b text-neutral-800 overflow-hidden text-ellipsis whitespace-nowrap">
                                            {typeof subValue === "object" ? (
                                              <pre className="text-black bg-gray-100 p-4 rounded whitespace-pre-wrap break-all text-sm">
                                                <code className="text-black">
                                                  {JSON.stringify(subValue, null, 2)}
                                                </code>
                                              </pre>
                                            ) : (
                                              <span className="text-black">{subValue}</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-sm">{value}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No hay detalles adicionales disponibles</p>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </ul>
          ) : (
            <p>No hay diagnósticos disponibles para este filtro</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosticsDropdown;
