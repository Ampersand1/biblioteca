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
- Node.js
- MongoDB
- Poner el resto de requisitos previos si aplica!!!
### Instalación
git clone https://github.com/Ampersand1/biblioteca.git
- Poner el resto de comandos para instalación de la aplicación!!!

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
- POST /signup - Registrar nuevo admin
- POST /login - Iniciar sesión
- poner el resto de endpoints que le competen a la gestión de cuentas (como eliminar o actualizar una cuenta)
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


