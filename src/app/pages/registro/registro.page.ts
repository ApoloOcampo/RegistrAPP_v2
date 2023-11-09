import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router'; // Agrega esta importación
import { Comuna } from 'src/app/models/comuna';
import { Region } from 'src/app/models/region';
import { LocationService } from 'src/app/services/location.service';

//importa la libreria de capacitor preferencececs
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {

  formularioRegistro: FormGroup;

  regiones: Region[] = [];
  comunas: Comuna[] = [];
  regionSeleccionado: number = 0;
  comunaSeleccionada: number = 0;

  constructor(private locationService: LocationService,private router: Router,public fb: FormBuilder, public alertController: AlertController) {
    this.formularioRegistro = this.fb.group({
      'nombre': new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z]*$/)]),
      'apellido': new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z]*$/)]),
      'rut': new FormControl("", [Validators.required, Validators.minLength(8), Validators.maxLength(9),]),
      'usuario': new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(8), Validators.pattern(/^[a-zA-Z0-9]*$/)]),
      'password': new FormControl("", [Validators.required, Validators.pattern(/^\d{4}$/), Validators.minLength(4), Validators.maxLength(4)]),
      'confirmacionPassword': new FormControl("", [Validators.required, Validators.pattern(/^\d{4}$/), Validators.minLength(4), Validators.maxLength(4)]),
    }, { validators: this.passwordMatchValidator });
    
  }

  ngOnInit() {
    this.cargarRegion();
    this.cargarComuna();
  }

  async cargarRegion() {
    const req = await this.locationService.getRegion();
    this.regiones = req.data;
    console.log("REGION", this.regiones);
  }

  async cargarComuna() {
    const req = await this.locationService.getComuna(this.regionSeleccionado);
    this.comunas = req.data;
    console.log("COMUNA", this.comunas);
  }


  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar']
    });

    await alert.present();
  }




  async guardar() {
    const f = this.formularioRegistro.value;

    // Verifica si el usuario ya existe en el preference
    const usuariosJSON = await Preferences.get({ key:'usuarios'});
    const usuarios = usuariosJSON && usuariosJSON.value ? JSON.parse(usuariosJSON.value) : [];

    // Validación ingreso de región
    if (!this.regionSeleccionado) {
      await this.mostrarAlerta('Región requerida', 'Debes seleccionar una región.');
      return;
    }
  
    // Validación ingreso de comuna
    if (!this.comunaSeleccionada) {
      await this.mostrarAlerta('Comuna requerida', 'Debes seleccionar una comuna.');
      return;
    }

    // Validación de usuario existente
    if (this.usuarioExiste(usuarios, f.usuario)) {
      await this.mostrarAlerta('Usuario existente', 'El usuario ya existe. Por favor, elige otro nombre de usuario.');
      return;
    }

    // Validación de nombre campo vacío
    if (!f.nombre) {
      await this.mostrarAlerta('Nombre requerido', 'Debes ingresar un nombre de usuario.');
      return;
    }

    // Validación nombre sin números
    if (/^[0-9]*$/.test(f.nombre)) {
      await this.mostrarAlerta('Nombre incorrecto', 'El nombre no debe contener numeros.');
      return;
    }

    // Validación nombre mínimo y máximo caracteres
    if (f.nombre.length < 3 || f.nombre.length > 20) {
      await this.mostrarAlerta('Nombre incorrecto', 'El nombre debe tener entre 3 y 20 caracteres.');
      return;
    }    

    // Validación de apellido campo vacío
    if (!f.apellido) {
      await this.mostrarAlerta('Apellido requerido', 'Debes ingresar un apellido.');
      return;
    }

    // Validación apellido sin números
    if (/^[0-9]*$/.test(f.apellido)) {
      await this.mostrarAlerta('Apellido incorrecto', 'El apellido no debe contener numeros.');
      return;
    }

    // Validación apellido mínimo y máximo caracteres    
    if (f.apellido.length < 3 || f.apellido.length > 20) {
      await this.mostrarAlerta('Apellido incorrecto', 'El apellido debe tener entre 3 y 20 caracteres.');
      return;
    }

    // Validación rut campo vacío
    if (!f.rut) {
      await this.mostrarAlerta('RUT requerido', 'Debes ingresar un RUT.');
      return;
    }

    // Validación rut con largo de 9 dígitos
    if (!/^\d{9}$/.test(f.rut)) {
      await this.mostrarAlerta('RUT incorrecto', 'El RUT debe contener exactamente 9 dígitos numéricos.');
      return;
    }

    // Validación usuario campo vacío
    if (!f.usuario) {
      await this.mostrarAlerta('Usuario requerido', 'Debes ingresar un nombre de usuario.');
      return;
    }

    // Validación usuario mínimo y máximo caracteres    
    if (f.usuario.length < 3 || f.usuario.length > 8) {
      await this.mostrarAlerta('Usuario incorrecto', 'El usuario debe tener entre 3 y 8 caracteres.');
      return;
    }

    // Validación password campo vacío
    if (!f.password) {
      await this.mostrarAlerta('Contraseña requerida', 'Debes ingresar una contraseña.');
      return;
    }

    // Validación password 4 dígitos
    if (!/^\d{4}$/.test(f.password)) {
      await this.mostrarAlerta('Contraseña incorrecta', 'La contraseña debe tener exactamente 4 números.');
      return;
    }

    // Validación confirmación password campo vacío
    if (!/^\d{4}$/.test(f.confirmacionPassword)) {
      await this.mostrarAlerta('Confirmación de contraseña incorrecta', 'La confirmación de contraseña debe contener exactamente 4 números.');
      return;
    }

    // validacion para que las password coicidan
    if (f.password !== f.confirmacionPassword) {
      await this.mostrarAlerta('Contraseñas no coinciden', 'Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
      return;
    }

    // Si todos los campos son válidos, realiza el registro
    var usuarioRe = {
      rut: f.rut,
      nombre: f.nombre,
      apellido: f.apellido,
      usuario: f.usuario,
      password: f.password,
      confirmacionPassword: f.confirmacionPassword,
      region: this.regiones.find(region => region.id === this.regionSeleccionado),
      comuna: this.comunas.find(comuna => comuna.id === this.comunaSeleccionada)
    }
      //coloca los datos del usuarioRe en el preferences como un array
    usuarios.push(usuarioRe);
    await Preferences.set({ key:'usuarios', value: JSON.stringify(usuarios) } );


    console.log('Usuario registrado exitosamente.');
    const successAlert = await this.alertController.create({
      header: 'Usuario Registrado',
      message: 'Usuario registrado exitosamente.',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await successAlert.present();

  }

  passwordMatchValidator(formGroup: FormGroup) {
    const passwordControl = formGroup.get('password');
    const confirmacionPasswordControl = formGroup.get('confirmacionPassword');

    if (passwordControl && confirmacionPasswordControl) {
      const password = passwordControl.value;
      const confirmacionPassword = confirmacionPasswordControl.value;

      if (password !== confirmacionPassword) {
        confirmacionPasswordControl.setErrors({ passwordMismatch: true });
      } else {
        confirmacionPasswordControl.setErrors(null);
      }
    }
  }

  // Función para verificar si un usuario ya existe
  usuarioExiste(usuarios: any[], usuario: string): boolean {
    return usuarios.some(u => u.usuario === usuario);
    
  }
}