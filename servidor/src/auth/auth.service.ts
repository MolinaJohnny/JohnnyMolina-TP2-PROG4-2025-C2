import { Injectable } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
// import { JwtService } from '@nestjs/jwt';
import { sign, decode} from 'jsonwebtoken';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';


const contrasenaSecreta = 'securePassword123';
@Injectable()
export class AuthService {

  constructor(
    private readonly usuariosService: UsuariosService,
    // private readonly jwtService: JwtService,
  ) {}


  async register(user: CreateUsuarioDto) {
    return this.createToken(user.nombreUsuario);
  }
  login(user : CreateUsuarioDto) {
    return this.createToken(user.nombreUsuario);
  }
  createToken(userName: String ) {
    const payload : { user: String; admin : Boolean } = {
      user: userName,
      admin: false,
    };
    const token = sign(payload,
    contrasenaSecreta,
    {
      expiresIn: '15m',
    }
    )
    return {token : token};
  }
}
