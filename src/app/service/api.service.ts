import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

// Estructura de los datos recibidos desde JSONPlaceholder.
export interface Publicacion {
  userId: number;
  id: number;
  title: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // PARA OTRO EJERCICIO: reemplaza esta URL por el endpoint solicitado.
  // Si la respuesta tiene otra forma, actualiza también Publicacion debajo.
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  // Inyecta HttpClient para realizar peticiones HTTP.
  constructor(private http: HttpClient) {}

  // Consulta las publicaciones y devuelve los datos recibidos.
  obtenerPublicaciones(): Observable<Publicacion[]> {
    // PARA OTRO EJERCICIO: ajusta el límite si la API tarda más en responder.
    // Así se dispara el respaldo local cuando la conexión queda esperando.
    return this.http.get<Publicacion[]>(this.apiUrl).pipe(
      timeout({ first: 8000 })
    );
  }
}
