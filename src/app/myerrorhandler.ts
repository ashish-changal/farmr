import {ErrorHandler, Injectable} from '@angular/core'
import { LoggerService } from './logger.service';

@Injectable()
export class MyErrorHandler extends ErrorHandler {
  
  constructor(private logger: LoggerService) { 
    // We rethrow exceptions, so operations like 'bootstrap' will result in an error
    // when an error happens. If we do not rethrow, bootstrap will always succeed.
    super();
  }
  
  handleError(error) {
    this.logger.log(error);
    super.handleError(error);  
  }
}