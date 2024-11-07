# READSPACE 

READSPACE es una aplicación web donde los usuarios pueden buscar los libros disponibles en una biblioteca tradicional, hacer reservas de los libros que quieren pedir prestados y publicar reseñas de los mismos. Además, en la app también se gestiona el inventario de libros, y las reservas y préstamos hechos por los usuarios. Por lo tanto, la app tiene dos tipos de usuario: Administrador y Usuario.

## Tabla de Contenidos
- [Instalación y Configuración](#instalación-y-configuración)
- [Ejecución del Proyecto](#ejecución-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Uso de la Aplicación](#uso-de-la-aplicación)
- [Rutas de la API](#rutas-de-la-api)
- [Licencia](#licencia)

## Instalación y Configuración
### Requisitos Previos
- Node.js (descargar entorno de ejecución)
- MongoDB (cuenta en la página oficial)
- Poner el resto de requisitos previos si aplica!!!
### Instalación
- git clone https://github.com/Ampersand1/biblioteca.git
- npm init --yes (terminal Visual Studio code)
- node index.js (terminal Visual Studio code)
- npm install express --save (terminal Visual Studio code)
- npm i –D nodemon (terminal Visual Studio code)
- npm run dev (terminal Visual Studio code)
- npm i mongoose --save (terminal Visual Studio code)
- npm i dotenv --save (terminal Visual Studio code)
- npm i bcrypt --save (terminal Visual Studio code)
- npm i jsonwebtoken --save (terminal Visual Studio code)

## Ejecución del Proyecto
- Poner los comandos y pasos para la ejecución del proyecto.!!!!!

## Estructura del Proyecto
- Poner lo que haga falta!!!
- routes/ - Define las rutas de la API
- models/ - Contiene los esquemas de MongoDB para Usuarios y Libros
  
## Uso de la Aplicación
- Poner lo que haga falta (revisa el documento de la entrega 1)!!!!!!
### Un usuario no autenticado
1. Puede buscar si existe un libro en la biblioteca
### Usuarios
1. Registrarse y acceder a la aplicación
2. Buscar libros y hacer reservas
3. Ver cuanto tiempo tiene para pedir prestado un libro y para devolverlo
4. Publicar reseñas
### Administradores
1. Registrarse y acceder a la aplicación
2. Gestionar el inventario de libros
3. Ver y gestionar las reservas de usuarios
4. Ver y gestionar los prestamos de los usuarios
   
## Rutas de la API
### Autenticación y cuentas
- POST /signup - Registrar nuevo usuario
- POST /signupadmin - Registrar nuevo admin
- POST /login - Iniciar sesión
- PUT /usuarios - Modificar cuenta propia (actualizar datos de la cuenta)
- DELETE /usuarios - Borrar cuenta propia
### Usuarios
Estas son las funcionalidades que tienen las cuentas de usuarios:
- LOS SIGUIENTES SON EJEMPLOS: (LLENAR CUANDO YA ESTEN LOS ENDPOINTS QUE USARÁN LOS USUARIOS COMPLETOS)
- GET /libros - Buscar libros
- POST /reservas - Hacer una reserva
### Administradores
Estas son las funcionalidades que tienen las cuentas de los administradores:
- poner los endpoints de obtener un usuario y todos los usuarios
- LOS SIGUIENTES SON EJEMPLOS: (LLENAR CUANDO YA ESTEN LOS ENDPOINTS QUE USARÁN LOS ADMINISTRADORES)
- GET /inventario - Ver el inventario de libros
- PUT /libros/:id - Actualizar un libro

## Licencia 
Este proyecto está bajo la Licencia MIT.


