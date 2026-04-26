# Lector EPUB (MVP)

Este proyecto tiene como mision proporcionar un visor de archivos EPUB ligero, rapido y libre de dependencias externas complejas. Esta disenado como un monolito sencillo utilizando unicamente HTML, CSS y JavaScript puro. Su proposito es permitir la lectura de libros electronicos directamente en el navegador de manera local, garantizando la privacidad del usuario al no requerir carga ni procesamiento de datos en servidores de terceros.

## Caracteristicas

- Lectura de archivos EPUB de forma estrictamente local.
- Soporte para extraer e inyectar imagenes integradas en el documento (Base64).
- Esquema de colores de bajo contraste, optimizado para prevenir la fatiga visual en sesiones prolongadas.
- Soporte nativo para modo claro y oscuro segun las preferencias del sistema operativo.
- Carga de archivos mediante boton de seleccion o funcionalidad de arrastrar y soltar (Drag and Drop).
- Arquitectura modular basada en servicios (EpubService.js), disenada para facilitar una posible migracion futura a frameworks modernos.

## Uso

1. Abre el archivo `index.html` en cualquier navegador web moderno (Edge, Chrome, Firefox, Safari).
2. Haz clic en el boton "Abrir EPUB" o arrastra tu archivo `.epub` hacia el contenedor principal.
3. Utiliza los botones "Anterior" y "Siguiente" para navegar comodamente entre los capitulos del libro.

## Licencia

This project is licensed under the MIT License.

This project uses JSZip (MIT License)
https://stuk.github.io/jszip/
