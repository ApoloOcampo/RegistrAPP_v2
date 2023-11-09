import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
})
export class RecuperarContrasenaPage implements OnInit {
  usuarios: any[] = [];
  
  nombreUsuarioInput: string = '';
  rutUsuarioInput:string = '';
  resultadoContrasena: string = '';

  constructor() { }

  async ngOnInit() {
    const usuariosPreferences = await Preferences.get({key: 'usuarios'})
    if(usuariosPreferences && usuariosPreferences.value){
      this.usuarios = JSON.parse(usuariosPreferences.value);
    }
  }

  buscarContrasena(){
    const contrasenaEncontrada = this.usuarios.find(usuario => usuario.usuario === this.nombreUsuarioInput) && this.usuarios.find(rut => rut.rut == this.rutUsuarioInput);
    
    if(contrasenaEncontrada) {
      this.resultadoContrasena = 'Contraseña encontrada:' + contrasenaEncontrada.password;

    }else{
      this.resultadoContrasena = 'nombre de usuario no encontrado';
    }
  }


}
