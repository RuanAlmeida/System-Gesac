import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';

import { PontoPresencaService } from './ponto-presenca.service';
import { empty } from 'rxjs/observable/empty';
import { SuiLocalizationService } from 'ng2-semantic-ui';
import pt from 'ng2-semantic-ui/locales/pt';
import Swal from 'sweetalert2';

import { ApiServiceEstadoMunicipio } from '../api-services/api-services-estado-municipio';
import { ApiServicesData } from '../api-services/api-services-data';
import { ApiServicesMsg } from '../api-services/api-services-msg';
import { ApiServicesPagination } from '../api-services/api-services-pagination';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-ponto-presenca',
  templateUrl: './ponto-presenca.component.html',
  styleUrls: ['./ponto-presenca.component.scss']
})
export class PontoPresencaComponent implements OnInit, OnDestroy {

  ufsPP: any;
  municipiospp: any;
  tipologias: Object;
  empresas: Object;
  contador: number = null;
  listaGesac = [];
  pontosPresencaFiltrada: any;
  erroEmpresa: boolean;
  solicitacaoSubmit: any;
  /*
  * Variáveis do codigo ponto de presença do gesac
  */
  pontopresencaCod_gesac: any = [];
  pontoPresencaStatus = [];
  selecionados = [];
  selecaoModalObsAcao = [];
  /*
  * Variáveis
   */
  botoesMSA: boolean;
  resp: any;
  multiplasSolicitacoes: any;
  pagina = 1;
  pontoFiltrado: any;
  /*
  * Variáveis do Modal
  */
  selcGesac = false;
  abrirNodal = false;
  obsAcaoModal = false;
  condicao: string;
  marcados = false;
  marcadosInput = false;
  numMarcados = 0;
  statusDiferentes = false;
  analiseShow = false;
  pendenciaShow = false;

  SelecionarG = {
    campoN: ''
  };

  filtros = {
    gesac: '',
    uf: '',
    municipio: '',
    status: '',
    ponto: '',
    tipologia: ''
  };

  mSolicitacoes = {
    tipo_solicitacao: '',
    num_doc_sei: null,
    num_oficio: null,
    data_oficio: null,
    cnpj_empresa: '',
    motivo: ''
  };

  optionsPontoPre: any;


  toggle = false;
  pontosPresenca: any;
  segmentDimmed: boolean;
  test: any;
  ufs: any;
  municipios: any;

  paginacao: any;
  allArrays: any;
  numeroPagina = 50;
  totalItens = 0;
  pontoPresencaPag: any;

  constructor(
    private apiServicesMsg: ApiServicesMsg,
    private localizationService: SuiLocalizationService,
    private location: Location,
    private pontoPresencaService: PontoPresencaService,
    private apiServicesPagination: ApiServicesPagination,
    private apiServicesData: ApiServicesData,
    private apiServiceEstadoMunicipio: ApiServiceEstadoMunicipio,
    private router: Router
  ) {
    localizationService.load('pt', pt);
    localizationService.setLanguage('pt'); }

  goBack() {
    this.location.back();
  }

  loadPontoPre() {
    this.segmentDimmed = true;
    this.paginacao = this.pontoPresencaService.getPontoPresenca().subscribe(dados => {
      this.pontosPresenca = dados;
      this.pontopresencaCod_gesac = [];
      this.pontoPresencaStatus = [];
      this.numMarcados = 0;
      this.botoesMSA = false;
      this.funcaoPaginacao(this.pontosPresenca);
    });
  }
  loadPontoPreRealizarSolicitacao(cod_gesac) {
    this.segmentDimmed = true;
    this.paginacao = this.pontoPresencaService.getPontoPresenca().subscribe(dados => {
      this.pontosPresenca = dados;
      this.pontopresencaCod_gesac = [];
      this.pontoPresencaStatus = [];
      this.numMarcados = 0;
      this.botoesMSA = false;
      this.filtroRealizarSolicitacao(cod_gesac);
    });
  }

  getEstados() {
    this.ufsPP = this.apiServiceEstadoMunicipio.getEstados();
  }

  selectEstado(uf) {
    this.municipios = this.apiServiceEstadoMunicipio.getMunicipios(uf);
  }

  getStatusPP() {
    this.pontoPresencaService.getStatusPP().subscribe(dados => {
      this.optionsPontoPre = dados;
      this.optionsPontoPre.unshift({cod_status: '', descricao: '' });
    });
  }

  ngOnInit() {
    this.pontoPresencaService.filtroObsAcao.subscribe(gesacs => {
      this.loadPontoPreRealizarSolicitacao(gesacs);
    });
    setTimeout(() => {
      this.ufs = this.apiServiceEstadoMunicipio.getEstados();
    }, 500);
    this.loadPontoPre();
    this.botoesMSA = false;
    this.getStatusPP();
  }

  getEmpresas() {
    this.pontoPresencaService.getEmpresas().subscribe(dados => {
      this.empresas = dados;
    });
  }

  getTipologia() {
    this.pontoPresencaService.getTipologia().subscribe(dados => {
      this.tipologias = dados;
    });
  }

  page(pagina) {
    this.pontoPresencaPag = this.allArrays[pagina - 1];
    this.todosMarcados(this.allArrays);
  }

  todosMarcados(array) {
    let tem = true;
    for (let i = 0; i < this.allArrays.length; i++) {
      for (let u = 0; u < this.allArrays[i].length; u++) {
        if (!this.allArrays[i][u].check || this.allArrays[i][u].check === false) {
          tem = false;
          break;
        }
      }
    }
    (tem === true) ? this.marcados = true : this.marcados = false;
  }

  ngOnDestroy() {
    this.paginacao.unsubscribe();
  }


  funcaoPaginacao(array) {
    this.totalItens = array.length;
    this.allArrays = this.apiServicesPagination.pagination(
      array,
      this.numeroPagina
    );
    let pagina;
    this.page((pagina = 1));
    this.segmentDimmed = false;
  }

  posicaoItemArray(array, ponto) {
    let posicao = null;
    array.forEach((element, i) => {
      (element.cod_gesac === ponto.cod_gesac) ? posicao = i : posicao = posicao;
    });
    return posicao;
  }

  unidades(valueInput, ponto) {
    if (valueInput === true) {
      this.numMarcados++;
      this.botoesMSA = true;
      if (this.numMarcados > 0) {
        this.pontopresencaCod_gesac.push(ponto.cod_gesac);
        this.pontoPresencaStatus.push(ponto.cod_status);
      }
      this.todosMarcados(this.allArrays);
    } else {
      this.numMarcados--;
      if (this.numMarcados !== 0) {
        this.pontopresencaCod_gesac.splice(this.pontopresencaCod_gesac.indexOf(ponto.cod_gesac), 1);
        this.pontoPresencaStatus.splice(this.pontoPresencaStatus.indexOf(ponto.cod_status), 1);
        this.botoesMSA = true;
      } else {
        this.pontopresencaCod_gesac.splice(this.pontopresencaCod_gesac.indexOf(ponto.cod_gesac), 1);
        this.pontoPresencaStatus.splice(this.pontoPresencaStatus.indexOf(ponto.cod_status), 1);
        this.botoesMSA = false;
      }
      this.todosMarcados(this.allArrays);
    }
  }

  toggleAll(value) {
    if (value === true) {
      for (let i = 0; i < this.allArrays.length; i++) {
        for (let u = 0; u < this.allArrays[i].length; u++) {
          this.allArrays[i][u].check = true;
          this.pontopresencaCod_gesac.push(this.allArrays[i][u].cod_gesac);
          this.pontoPresencaStatus.push(this.allArrays[i][u].cod_status);
        }
      }
      this.marcadosInput = true;
      this.botoesMSA = true;
    } else {
      for (let i = 0; i < this.allArrays.length; i++) {
        for (let u = 0; u < this.allArrays[i].length; u++) {
          this.allArrays[i][u].check = false;
        }
      }
      this.numMarcados = 0;
      this.marcadosInput = false;
      this.botoesMSA = false;
      this.pontopresencaCod_gesac = [];
      this.pontoPresencaStatus = [];
    }
  }

  /*
 * Métodos feichar o modal
 */
  closeModal() {
    this.abrirNodal = false;
    this.selcGesac = false;
    this.analiseShow = false;
    this.pendenciaShow = false;
    this.contador = null;
    this.mSolicitacoes = {
      tipo_solicitacao: '',
      num_doc_sei: null,
      num_oficio: null,
      data_oficio: null,
      cnpj_empresa: '',
      motivo: ''
    };
  }

  closeObsAcao() {
    this.router.navigate(['/pontPre']);
    this.obsAcaoModal = false;
  }

  /*
  * Métodos abrir o modal
  */
  modalGesacOpen() {
    this.selcGesac = true;
    this.getTipologia();
    this.getEstados();
  }

  openModalObsAcao() {
    if (this.pontopresencaCod_gesac.length > 0) {
      this.selecaoModalObsAcao = this.pontopresencaCod_gesac;
    } else {
      this.pontosPresenca.forEach(element => {
        this.selecaoModalObsAcao.push(element.cod_gesac);
      });
    }
    this.obsAcaoModal = true;
  }




  openModal(multipla) {
    this.statusDiferentes = false;
    this.pontoPresencaStatus.filter(function (el) { return el !== empty; }).join('');
      for (let i = 0; i < this.pontoPresencaStatus.length; i++) {
        if (this.pontoPresencaStatus[i] !== undefined) {
          if (this.pontoPresencaStatus[0] !== this.pontoPresencaStatus[i]) {
            this.apiServicesMsg.setMsg('warning', 'Não é possivel executar esta ação, status diferentes.', 5000);
            this.statusDiferentes = true;
            break;
          }
        }
      }
    if (this.statusDiferentes === false) {
      this.pontoPresencaService.getStatusSolicitacoes(this.pontoPresencaStatus[0]).subscribe(dados => {
        this.multiplasSolicitacoes = dados;
        this.ActiveMsgReturnSolicitation();
      });
      if (multipla === 'msolicitacoes') {
        this.condicao = 'Múltiplas Solicitações';
        this.getEmpresas();
      }
    }
  }


  ActiveMsgReturnSolicitation() {
    if (this.multiplasSolicitacoes.length === 0) {
      this.apiServicesMsg.setMsg('warning', 'Não é possivel executar esta ação, ' +
      'pois não há solicitações possíveis para este Status!', 5000);
      this.abrirNodal = false;
    } else {
      this.abrirNodal = true;
    }
  }

  /*
 * Função para verificar a data
 */
  verificarData(data_oficio) {
    const dataAtual = this.apiServicesData.formatData(new Date());
    data_oficio  = this.apiServicesData.formatData(data_oficio);
    if (!data_oficio) {
      return true;
    }
    return data_oficio <= dataAtual;
  }

  enviarMS(fmsolicitacoes: NgForm) {
    if (this.verificarData(fmsolicitacoes.value.data_oficio)) {
      fmsolicitacoes.value.data_oficio = this.apiServicesData.formatData(fmsolicitacoes.value.data_oficio);
      if (!this.analiseShow) {
        delete fmsolicitacoes.value.cnpj_empresa;
        this.solicitacaoSubmit = true;
      } else if (this.analiseShow && fmsolicitacoes.value.cnpj_empresa) {
        this.solicitacaoSubmit = true;
      } else {
        this.solicitacaoSubmit = false;
        this.erroEmpresa = true;
      }

      if (this.solicitacaoSubmit) {
        let cod_gesac = this.pontopresencaCod_gesac;
          fmsolicitacoes.value.cod_gesac = this.pontopresencaCod_gesac;
          fmsolicitacoes.value.tipo_solicitacao = fmsolicitacoes.value.tipo_solicitacao.tipo_solicitacao;
          this.pontoPresencaService.postMSolicitacoes(fmsolicitacoes.value).subscribe(resp => {
            this.resp = resp;
            fmsolicitacoes.reset();
            this.loadPontoPreRealizarSolicitacao(cod_gesac); 
            this.closeModal();
          });
        }
    } else {
      Swal('', 'A Data do Ofício selecionada é maior que Data Atual', 'warning');
    }
  }

  filtroRealizarSolicitacao(gesac){
    let valida;
    const ponto = this.pontosPresenca.filter(pontoPres => {
      valida = false;
      gesac.forEach(elemento => {if (elemento.toString() === pontoPres.cod_gesac.toString()) { valida = true; return false;}})
      return valida;
    });
    this.funcaoPaginacao(ponto);
  }

  gerarExcelId(){
    const date = new Date();
    const dataDocumento = `${date.toISOString().slice(8, 10)}-${date.toISOString().slice(5, 7)}-${date.toISOString().slice(0, 4)}`;
    this.pontoPresencaService.gerarExcelId(this.pontopresencaCod_gesac)
    .subscribe(
      res => saveAs(res, `SGsacFiltrado ${dataDocumento}.xlsx`),
      erro => Swal('Erro', 'Ocorreu um erro, por favor recarregue a página e tente novamente.' +
      ' Se o erro persistir favor entrar em contato com a COSIS - 2027-6040.', 'error')
    )
  }

  ActiveInputAnalise(mSolicitacoes) {
    if (mSolicitacoes && mSolicitacoes.tipo_permissao.toString() === '3') {
      this.analiseShow = true;
      this.pendenciaShow = false;
    } else if (mSolicitacoes && mSolicitacoes.tipo_permissao.toString() === '4') {
      this.analiseShow = false;
      this.pendenciaShow = true;
    } else {
      this.analiseShow = false;
      this.pendenciaShow = false;
    }
  }

  selecoesGesacs(campo, fmselecionarGesac: NgForm) {
    if (campo) {
      this.listaGesac = campo.split('\n');
      this.listaGesac.sort((a, b) => {
        return a - b;
      });
      this.listaGesac = this.listaGesac.filter(function (item, pos, self) {
        return self.indexOf(item) === pos;
      });
      fmselecionarGesac.reset();
    }
    this.toggleAll(false);
    this.filterGsac(this.listaGesac, this.selecionados);
    if (this.allArrays) {
      this.botoesMSA = true;
    }
    this.selcGesac = false;
    this.selecionados = [];
    this.listaGesac = [];
  }

  filterGsac(arrayGsac, arraySelecionados) {
    let ponto = this.pontosPresenca;
    if (arrayGsac.length > 0) {
      ponto = ponto.filter(pontoPres => {
        if (arrayGsac.some(gsac => gsac === pontoPres.cod_gesac.toString())) {
          this.pontopresencaCod_gesac.push(pontoPres.cod_gesac);
          this.pontoPresencaStatus.push(pontoPres.cod_status);
          this.numMarcados++;
          pontoPres.check = true;
          return true;
        } else {
          return false;
        }
      });
    }
    if (arraySelecionados.length > 0) {
      ponto = ponto.filter(pontoPres => {
        if (arraySelecionados.some(selec => pontoPres.tipologia && pontoPres.tipologia.includes(selec.nome))) {
          this.pontopresencaCod_gesac.push(pontoPres.cod_gesac);
          this.pontoPresencaStatus.push(pontoPres.cod_status);
          this.numMarcados++;
          pontoPres.check = true;
          return true;
        } else {
          if (this.pontopresencaCod_gesac) {
            this.pontopresencaCod_gesac.splice(this.pontopresencaCod_gesac.indexOf(pontoPres.cod_gesac), 1);
            this.pontoPresencaStatus.splice(this.pontoPresencaStatus.indexOf(pontoPres.cod_status), 1);
            this.numMarcados--;
            pontoPres.check = false;
          }
          return false;
        }
      });
    }
    this.pontopresencaCod_gesac = this.pontopresencaCod_gesac.filter((item, pos, self) => self.indexOf(item) === pos);
    this.pontoPresencaStatus = this.pontoPresencaStatus.filter((item, pos, self) => self.indexOf(item) === pos);
    this.numMarcados = this.pontopresencaCod_gesac.length;
    this.funcaoPaginacao(ponto);
  }


  filtroPonto(filtros): any {
    if (!filtros.gesac && !filtros.uf && !filtros.municipio && !filtros.status && !filtros.ponto && !filtros.tipologia) {
      this.funcaoPaginacao(this.pontosPresenca);
    } else {
      let valida;
      const ponto = this.pontosPresenca.filter(pontoPres => {
        valida = true;
        if (filtros.gesac && !pontoPres.cod_gesac.toString().includes(filtros.gesac.toLowerCase())) { valida = false; }
        if (filtros.uf && !pontoPres.uf.toLowerCase().includes(filtros.uf.toLowerCase())) { valida = false; }
        if (filtros.municipio && !pontoPres.nome_municipio.toLowerCase().includes(filtros.municipio.toLowerCase())) { valida = false; }
        if (filtros.status.descricao &&
          pontoPres.descricao.toLowerCase() !== filtros.status.descricao.toLowerCase()) { valida = false; }
        if (filtros.ponto && !pontoPres.nome.toLowerCase().includes(filtros.ponto.toLowerCase())) { valida = false; }
        if ((filtros.tipologia && pontoPres.tipologia == null) ||
          (filtros.tipologia && !pontoPres.tipologia.toLowerCase().includes(filtros.tipologia.toLowerCase()))) { valida = false; }
        return valida;
      });
      this.funcaoPaginacao(ponto);
    }
  }
}
