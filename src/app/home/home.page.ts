import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonToggle,
  IonList,
  IonAvatar,
  IonIcon,
  IonLabel,
  IonBadge,
  IonModal,
  IonNote,
  ToastController
} from '@ionic/angular';

import { ApiService, Publicacion } from '../service/api.service';
import { addIcons } from 'ionicons';
import { cartOutline } from 'ionicons/icons';

// Registra el ícono que se usa como avatar en cada orden.
addIcons({ cartOutline });

// PARA OTRO EJERCICIO: ajusta estos campos al modelo de orden requerido.
interface Orden {
  id: number;
  producto: string;
  precio: number;
  stock: number;
  estado: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,

  // Importa las herramientas de Angular y los componentes de Ionic utilizados.
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonToggle,
    IonList,
    IonAvatar,
    IonIcon,
    IonLabel,
    IonBadge,
    IonModal,
    IonNote
  ]
})
export class HomePage implements OnInit {

  // Guarda las órdenes obtenidas de la API y adaptadas al ejercicio.
  ordenes: Orden[] = [];
  cargando = false;

  // Valores iniciales del filtro de precios.
  // PARA OTRO EJERCICIO: ajusta estos valores iniciales al rango que necesites.
  // El máximo de 250000 permite mostrar los 100 registros actuales de la API.
  precioMinimo = 0;
  precioMaximo = 250000;

  // Indica si se deben mostrar únicamente órdenes con stock crítico.
  soloStockCritico = false;

  // Controla la apertura del modal y la orden seleccionada.
  modalAbierto = false;
  ordenSeleccionada: Orden | null = null;

  constructor(
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  // Carga las órdenes al entrar en la página.
  ngOnInit(): void {
    this.cargarOrdenes();
  }

  // Consulta la API y transforma sus publicaciones en órdenes simuladas.
  cargarOrdenes(): void {
    this.cargando = true;
    this.apiService.obtenerPublicaciones().subscribe({
      next: (publicaciones: Publicacion[]) => {
        this.ordenes = this.adaptarPublicaciones(publicaciones);
        this.cargando = false;
      },

      // Informa al usuario si la petición HTTP falla.
      error: () => {
        this.cargarOrdenesDemo();
        this.cargando = false;
        this.mostrarToast('Sin conexión: se muestran 10 órdenes de demostración');
      }
    });
  }

  // Filtra las órdenes por precio y, opcionalmente, por stock crítico.
  get ordenesFiltradas(): Orden[] {
    return this.ordenes.filter((orden) => {

      // Comprueba que el precio esté dentro del rango seleccionado.
      const precioValido =
        orden.precio >= this.precioMinimo &&
        orden.precio <= this.precioMaximo;

      // PARA OTRO EJERCICIO: cambia el límite 5 si la regla de stock varía.
      // El mismo límite aparece en el color del badge en home.page.html.
      // El rango y el stock se combinan; ambos deben cumplirse.
      const stockValido =
        !this.soloStockCritico || orden.stock < 5;

      return precioValido && stockValido;
    });
  }

  // Calcula la cantidad de órdenes que cumplen los filtros.
  get cantidadOrdenes(): number {
    return this.ordenesFiltradas.length;
  }

  // Abre el modal con la orden seleccionada.
  abrirModal(orden: Orden): void {
    this.ordenSeleccionada = orden;
    this.modalAbierto = true;
  }

  // Cierra el modal y limpia la selección.
  cerrarModal(): void {
    this.modalAbierto = false;
    this.ordenSeleccionada = null;
  }

  // PARA OTRO EJERCICIO: cambia 0.19 y la etiqueta IVA del modal si cambia la tasa.
  // Calcula el IVA del 19 % sobre el precio de la orden.
  get iva(): number {
    return this.ordenSeleccionada
      ? this.ordenSeleccionada.precio * 0.19
      : 0;
  }

  // Suma el precio y el IVA para obtener el total de facturación.
  get total(): number {
    return this.ordenSeleccionada
      ? this.ordenSeleccionada.precio + this.iva
      : 0;
  }

  // Crea y muestra una notificación temporal.
  async mostrarToast(mensaje: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom'
    });

    await toast.present();
  }

  // Actualiza los datos y notifica el resultado.
  actualizarOrdenes(): void {
    this.cargando = true;
    this.apiService.obtenerPublicaciones().subscribe({
      next: (publicaciones: Publicacion[]) => {
        this.ordenes = this.adaptarPublicaciones(publicaciones);
        this.cargando = false;

        this.mostrarToast('Órdenes actualizadas');
      },

      // Muestra una notificación si falla la actualización.
      error: () => {
        this.cargarOrdenesDemo();
        this.cargando = false;
        this.mostrarToast('Sin conexión: se muestran 10 órdenes de demostración');
      }
    });
  }

  // PARA OTRO EJERCICIO: cambia estos títulos si quieres otros ejemplos sin conexión.
  // La API remota sigue siendo la fuente principal; estos 10 registros son respaldo local.
  private cargarOrdenesDemo(): void {
    const publicacionesDemo: Publicacion[] = Array.from(
      { length: 10 },
      (_, indice) => ({
        userId: 1,
        id: indice + 1,
        title: `Producto de demostración ${indice + 1}`,
        body: 'Orden de ejemplo para visualizar la pantalla sin conexión.'
      })
    );

    this.ordenes = this.adaptarPublicaciones(publicacionesDemo);
  }

  // Adapta los posts de prueba a órdenes, ya que la API no entrega inventario.
  private adaptarPublicaciones(publicaciones: Publicacion[]): Orden[] {
    return publicaciones.map((publicacion) => ({
      // PARA OTRO EJERCICIO: mapea aquí los campos reales recibidos.
      // Esta API solo entrega posts; precio y stock se inventan para la demostración.
      id: publicacion.id,
      producto: publicacion.title,
      precio: publicacion.id * 2000 + 10000,
      stock: publicacion.id % 8,
      estado: publicacion.id % 2 === 0 ? 'Pagado' : 'Pendiente'
    }));
  }
}
