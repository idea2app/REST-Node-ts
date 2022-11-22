import { JsonController } from 'routing-controllers';

import { HomeModel, Home } from '../model';
import { Controller } from './Base';

@JsonController('/home')
export class HomeController extends Controller('/home', HomeModel, Home) {}
