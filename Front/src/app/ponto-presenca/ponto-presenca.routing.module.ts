import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PontoPresencaComponent } from './ponto-presenca.component';
import { PontoPresencaAddEditComponent } from './ponto-presenca-add-edit/ponto-presenca-add-edit.component';
import { PontoPresencaDetalheComponent } from './ponto-presenca-detalhe/ponto-presenca-detalhe.component';

const PontoPresencaRoutes = [
    { path: '', component: PontoPresencaComponent },
    { path: 'novo', component: PontoPresencaAddEditComponent },
    {path: ':id/detalhe', component: PontoPresencaDetalheComponent,
      children: [
          { path: ':detalheappeditPP', component: PontoPresencaAddEditComponent }
    ]
    },
    { path: ':id', component: PontoPresencaAddEditComponent }
];
@NgModule({
    imports: [RouterModule.forChild(PontoPresencaRoutes)],
    exports: [RouterModule]
})
export class PontoPresencaRoutingModule { }


