# Diagnóstico de fuentes — 13 de noviembre de 2026

El escaneo automático de las 11:00 UTC registró 2 de 16 fuentes consultadas correctamente. Las comprobaciones públicas posteriores, usando el catálogo real y las correcciones, recuperaron documentos de 8 fuentes. Son muestras de hasta dos documentos: no acreditan cobertura completa ni sustituyen el análisis de relevancia.

| Fuente | Estado de lectura | Muestra | Resultado |
| --- | --- | --- | --- |
| ANMAT - Disposiciones y Circulares Sanitarias | Lectura verificada | 2 | Se extrajeron documentos oficiales. |
| INPI Argentina - Boletines de Marcas y Patentes | Requiere ajuste | 0 | El documento supera el límite de descarga de 15 MB. Requiere procesarlo por partes o usar un conector específico. |
| ANVISA - Resoluções da Diretoria Colegiada (RDC) e Atos Normativos | Lectura verificada | 2 | Se extrajeron documentos oficiales. |
| Diário Oficial da União (DOU) - Seção 1 (Atos Normativos) | No disponible | 0 | No se pudo consultar el portal. Revisa el detalle técnico o vuelve a comprobar la fuente. |
| INPI Brasil - Revista da Propriedade Industrial (RPI) | Lectura verificada | 2 | Se extrajeron documentos oficiales. |
| INAPI Chile - Diario Oficial y Boletín Marcario | Lectura verificada | 2 | Se extrajeron documentos oficiales. |
| ISP Chile - Resoluciones ANAMED y Dispositivos Médicos | No disponible | 0 | No se pudo validar el certificado HTTPS del portal. |
| INVIMA - Normatividad y Circulares Sanitarias | Lectura verificada | 2 | Se extrajeron documentos oficiales. |
| MinSalud Colombia - Decretos y Resoluciones de Salud | Lectura verificada | 2 | Se extrajeron documentos oficiales. |
| SIC - Gaceta de la Propiedad Industrial | No disponible | 0 | No se pudo validar el certificado HTTPS del portal. |
| COFEPRIS - Resoluciones y Disposiciones Sanitarias | Lectura verificada | 2 | Se extrajeron documentos oficiales. |
| Diario Oficial de la Federación (DOF) - Sección Salud & Comercio | Lectura verificada | 2 | Se extrajeron documentos oficiales. |
| IMPI - Gaceta de la Propiedad Industrial | Requiere ajuste | 0 | El portal respondió, pero requiere ajustar la extracción de sus documentos. |
| DIGEMID / DIGESA - Normas Sanitarias y Resoluciones Directorales | Acceso bloqueado | 0 | El portal bloqueó el acceso automático. Requiere un conector o un canal oficial alternativo. |
| Diario Oficial El Peruano - Separata de Normas Legales | No disponible | 0 | El enlace ya no existe. Es necesario actualizar la URL de revisión. |
| INDECOPI - Gaceta Electrónica de Propiedad Intelectual | Requiere ajuste | 0 | El portal respondió, pero requiere ajustar la extracción de sus documentos. |

Correcciones: API pública de contenidos de ANVISA; reconocimiento de enlaces PDF cortos; conservación de documentos válidos en fuentes parcialmente fallidas; equivalencia entre dominios www y raíz en INAPI; ruta HTTPS válida de publicaciones del DOF; preferencia IPv4 y un reintento ante errores transitorios de conexión. Los certificados HTTPS se siguen validando.

Cada fuente conserva su comprobación, ejemplos y motivo de error. La interfaz permite volver a comprobar lectura sin ejecutar Gemini. Los errores de certificado, bloqueos, formatos dinámicos no implementados y PDFs que exceden 15 MB permanecen identificados; no se presentan como ausencia de novedades.
