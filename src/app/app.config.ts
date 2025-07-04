import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideNgGlyphs } from '@ng-icons/core';
import { withMaterialSymbolsOutlined, withMaterialSymbolsRounded } from '@ng-icons/material-symbols';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // provideNgGlyphs(withMaterialSymbolsOutlined(), withMaterialSymbolsRounded()),
    provideRouter(routes)
  ]
};
