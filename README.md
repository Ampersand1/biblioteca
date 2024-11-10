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

### Instalación
- git clone https://github.com/Ampersand1/biblioteca.git
- npm init --yes (terminal Visual Studio code)
- node index.js (terminal Visual Studio code)
- npm install express --save (terminal Visual Studio code)
- npm i –D nodemon (terminal Visual Studio code)
- npm i mongoose --save (terminal Visual Studio code)
- npm i dotenv --save (terminal Visual Studio code)
- npm i bcrypt --save (terminal Visual Studio code)
- npm i jsonwebtoken --save (terminal Visual Studio code)

## Ejecución del Proyecto

- npm run dev (terminal Visual Studio code)

## Estructura del Proyecto

###src/ - modelos y rutas de la API

###src/routes/ - Define las rutas de la API
- routes/authentication.js - Métodos de autenticación de los usuarios de la aplicación (Usuarios, Admins)
- routes/authorization.js - Métodos de validación de permisos de los usuarios (Usuarios, Admins)
- routes/inventario.js - Métodos de CRUD de inventario de libros (POST, GET, PUT, DELETE)
- routes/reserva.js - Métodos de CRUD de reserva de libros (POST, GET, PATCH, DELETE)
- routes/usuario.js - Métodos de CRUD de usuarios (POST, GET, PUT, DELETE)
###src/models/ - Contiene los esquemas de MongoDB para Usuarios y Libros
- models/inventario.js - Declaración de variables requeridas para el CRUD de inventario y para exportar a los campos de la base de datos 
- models/reserva.js - Declaración de variables requeridas para el CRUD de reserva y para exportar a los campos de la base de datos 
- models/usuario.js - Declaración de variables requeridas para el CRUD de usuarios y para exportar a los campos de la base de datos 
  
## Uso de la Aplicación

### Usuarios NO autenticados
1. Puede buscar si existe un libro en la biblioteca
2. Buscar libros por voz
### Usuarios
1. Registrarse y acceder a la aplicación
2. Modificar los datos de la cuenta
3. Eliminar su cuenta
4. Buscar libros y hacer reservas
5. Ver cuanto tiempo tiene para pedir prestado un libro y para devolverlo
6. Publicar reseñas
7. Ver recomendaciones de libros relacionados a sus busquedas
8. Buscar libros por voz
### Administradores
1. Registrarse y acceder a la aplicación
2. Modificar los datos de la cuenta
3. Eliminar su cuenta
4. Gestionar el inventario de libros
5. Ver y gestionar las reservas de usuarios
6. Ver y gestionar los prestamos de los usuarios
   
## Rutas de la API

### Autenticación y cuentas (Usuarios, Admins)
- POST /signup - Registrar nuevo usuario
- POST /signupadmin - Registrar nuevo admin
- POST /login - Iniciar sesión
- POST /logout - Cerrar sesión
- PUT /usuarios - Modificar cuenta propia (actualizar datos de la cuenta)
- DELETE /usuarios - Borrar cuenta propia
### Usuarios NO autenticados
INVENTARIO:
- GET /inventario/todos - Ver todos los libros
- GET /inventario/buscar?nombre=NombreLibro - Buscar un libro por su nombre
- GET /inventario/buscar?autor=NombreAutor - Buscar un libro por su autor
### Usuarios autenticados
INVENTARIO:
- GET /inventario/todos - Ver todos los libros
- GET /inventario/buscar?nombre=NombreLibro - Buscar un libro por su nombre
- GET /inventario/buscar?autor=NombreAutor - Buscar un libro por su autor
RESERVA:
- POST /reservas/:inventarioId - Crear una reserva para un artículo del inventario
- DELETE /reservas/:id - Eliminar una reserva
### Administradores
Estas son las funcionalidades que tienen las cuentas de los administradores:
USUARIOS:
- GET /usuarios - Ver todos los usuarios del sistema
- GET /usuarios/buscar?usuario=NombreUsuario - Buscar un usuario del sistema por su nombre
- GET /usuarios/buscar?correo=CorreoUsuario - Buscar un usuario del sistema por su correo
INVENTARIO:
- POST /inventario - Agregar un nuevo libro al inventario
- GET /inventario/todos - Ver todos los libros
- GET /inventario/buscar?nombre=NombreLibro - Buscar un libro por su nombre
- GET /inventario/buscar?autor=NombreAutor - Buscar un libro por su autor
- PUT /libros/:id - Actualizar un libro
- DELETE /inventario/borrar/:id - Borrar un libro de la base de datos
RESERVA:
- GET /reservas - Ver todas las reservas de libros
- PATCH /reservas/:id/cumplida - Marcar una reserva como cumplida

## Licencia 

Este proyecto está bajo la Licencia MIT.


